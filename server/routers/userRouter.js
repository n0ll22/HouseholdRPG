const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const queryOptions = require("../middleware/queryOptions");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Route a felhasználók listájának lekérésére, lapozással
router.get("/", async (req, res) => {
  try {
    // Lekérjük a kérésben található query paramétereket
    const queries = req.query;

    // A queryOptions függvény feldolgozza a query paramétereket a szűréshez, rendezéshez, lapozáshoz stb.
    const { query, sortOptions, skip, limit, page } = queryOptions(queries);

    // A teljes felhasználói szám lekérése a lapozáshoz szükséges metainformációkhoz
    const totalUsers = await User.countDocuments(query); // Számoljuk meg, hány felhasználó felel meg a lekérdezésnek

    // A lapozott felhasználók lekérése az adatbázisból
    const allUsers = await User.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Visszaküldjük az adatokat JSON formátumban, beleértve a lapozási metainformációkat
    res.json({
      users: allUsers,
      totalUsers, // A felhasználók teljes száma, amelyek megfelelnek a lekérdezésnek
      totalPages: Math.ceil(totalUsers / limit), // A teljes oldalak számának kiszámítása
      currentPage: parseInt(page), // Az aktuális oldal száma
    });
  } catch (err) {
    console.error(err); // Hibák naplózása
    res.status(500).send({
      error: "An internal server error has occurred...", // Visszaadunk egy hibaüzenetet
    });
  }
});
/*
// Route, amely több felhasználót kér le egy listából, az ID-k alapján
router.post("/multipleUsers", async (req, res) => {
  try {
    // A kérés törzséből lekérjük a felhasználókat
    const users = req.body;

    console.log(users);
    // Kiválasztjuk a felhasználók ID-jait
    const userIds = users.map((user) => user.user_id);

    // Lekérdezzük a felhasználókat az adatbázisból az ID-k alapján
    const result = await User.find({ _id: { $in: userIds } });

    if (result) {
      // Levesszük a nem szükséges mezőket (pl. passwordHash és __v), és csak a felhasználói adatokat küldjük vissza
      const UserDTO = result.map(({ passwordHash, __v, ...user }) => user._doc);

      return res.send(UserDTO); // Visszaküldjük a felhasználókat
    }

    return res.status(400).send({ error: "No user was found" }); // Ha nem találunk felhasználót, hibaüzenet
  } catch (err) {
    console.error(err); // Hibák naplózása
    return res.status(500).send({ error: err }); // Visszaküldjük a hibát
  }
});
*/
// Route a felhasználó regisztrálásához
router.post("/register", async (req, res) => {
  try {
    // A kérés törzséből lekérjük a felhasználói adatokat
    const { username, password, passwordAgain, email } = req.body;

    console.log(username, password, passwordAgain);

    // Adatellenőrzés
    if (!username || !password || !passwordAgain || !email) {
      return res.status(400).json({ error: "Fill all required fields!" }); // Ha hiányzik valami, hibaüzenet
    }

    // A jelszó minimális hossza 8 karakter
    if (password.length < 8 && password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters!" }); // Jelszó hosszának ellenőrzése
    }

    // Ellenőrizzük, hogy a két jelszó egyezzen
    if (password !== passwordAgain) {
      return res.status(400).json({ error: "Passwords must match!" }); // Ha nem egyeznek, hibaüzenet
    }

    // Ellenőrizzük, hogy létezik-e már a felhasználónév
    existingUser = await User.findOne({ username });
    if (existingUser?.username) {
      return res.status(400).json({ error: "Username already taken!" }); // Ha létezik, hibaüzenet
    }

    // A jelszó titkosítása
    const salt = await bcrypt.genSalt(); // Generálunk egy sót
    const passwordHash = await bcrypt.hash(password, salt); // A jelszót titkosítjuk

    // Felhasználó mentése az adatbázisba
    await User.create({
      email,
      username,
      passwordHash,
      exp: 0,
      lvl: 1,
      avatar: "default.jpg",
      taskToday: [], //
      banner: "bg-red-400",
      friendships: [],
      status: "online",
      isAdmin: false,
    });

    // Token létrehozása a felhasználó számára
    const newUser = await User.findOne({ username });
    const token = jwt.sign({ user: newUser.id }, process.env.JWT_SECRET); // JWT token létrehozása

    // A token beállítása a cookie-ban
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None", // allow cross-site cookie
      secure: true, // cookie only over HTTPS
    });

    res.send("Logged In!");
  } catch (err) {
    console.error(err); // Hibák naplózása
    return res.status(500).send({
      error: "An internal server error has occurred...", // Ha hiba történik, küldünk egy általános hibaüzenetet
    });
  }
});

// Felhasználó bejelentkezése
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body; // Felhasználónév és jelszó a kérés törzséből

    // Ellenőrizzük, hogy mindkét mező kitöltve van-e
    if (!username || !password) {
      return res.status(400).json({ error: "Fill all required fields!" });
    }

    // Megkeressük a felhasználót az adatbázisban a felhasználónév alapján
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(401).json({ error: "Incorrect username or password!" });
    }

    // Ellenőrizzük, hogy a jelszó megegyezik-e a tárolt jelszóval
    const passwordCompare = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (!passwordCompare) {
      return res.status(401).json({ error: "Incorrect username or password!" });
    }

    // Ha a felhasználó törölt státuszú, visszautasítjuk a bejelentkezést
    if (existingUser.status === "deleted") {
      return res.status(401).json({ error: "This account is deleted!" });
    }

    // Bejelentkezés után "online"-ra állítjuk a státuszt
    existingUser.status = "online";
    await existingUser.save();

    // JWT token létrehozása
    const token = jwt.sign({ user: existingUser.id }, process.env.JWT_SECRET);

    // A cookie-ban tároljuk a tokent
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None", // allow cross-site cookie
      secure: true, // cookie only over HTTPS
    });

    return res.send("Logged In!");
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Internal Server Error",
    });
  }
});

// Jelszó visszaállítása kérésre
router.post("/restorePassword", async (req, res) => {
  try {
    const { email } = req.body; // Email cím a kérés törzséből
    const user = await User.findOne({ email }); // Felhasználó keresése az email alapján

    // Ha nincs ilyen email-című felhasználó, hibát küldünk
    if (!user)
      return res
        .status(404)
        .json({ error: "No user was found with this email address!" });

    // Véletlenszerű token generálása
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // Token 15 percig érvényes

    // Token és lejárati idő beállítása a felhasználóhoz
    user.resetToken = token;
    user.resetTokenExpiry = tokenExpiry;

    await user.save();

    // A visszaállító linket tartalmazó email elküldése
    const resetLink = `${process.env.CLIENT_URL}/reactivate-account/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email küldése
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Jelszó visszaállítása",
      html: `<p>Kattints <a target="_blank" href="${resetLink}">ide</a> a jelszó visszaállításához. A link 15 percig érvényes.</p>`,
    });

    return res.json({
      message: "Recovery email has been sent to your email address!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Felhasználó fiókjának visszaállítása
router.post("/restoreAccount", async (req, res) => {
  try {
    const { email } = req.body; // Email cím a kérés törzséből
    const user = await User.findOne({ email }); // Felhasználó keresése az email alapján

    // Ha nincs ilyen email-című felhasználó, hibát küldünk
    if (!user)
      return res
        .status(404)
        .json({ error: "No user was found with this email address!" });

    // Véletlenszerű token generálása
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // Token 15 percig érvényes

    // Token és lejárati idő beállítása a felhasználóhoz
    user.resetToken = token;
    user.resetTokenExpiry = tokenExpiry;

    await user.save();

    // Aktiváló linket tartalmazó email elküldés
    const resetLink = `${process.env.CLIENT_URL}/reactivate-account/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email küldése
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Fiók újraaktiválása",
      html: `<p>Kattints <a target="_blank" href="${resetLink}">ide</a> a fiók újraaktiválásához. A link 15 percig érvényes.</p>`,
    });

    return res.json({
      message: "Recovery email was sent to your email address!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fiók újraaktiválása
router.post("/reactivate-account", async (req, res) => {
  try {
    const { token } = req.body; // A kérés törzséből lekérjük a token-t

    // Ellenőrizzük, hogy van-e token
    if (!token)
      return res.status(401).json({ error: "Invalid or expired token!" });

    // Megkeressük a felhasználót a token alapján, és ellenőrizzük, hogy a token érvényes-e
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // A token lejárati idejének ellenőrzése
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // A felhasználó státuszának "offline"-ra állítása
    user.status = "offline";
    await user.save();

    return res.status(200).json({ message: "Account restored!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Jelszó visszaállítása
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password, passwordAgain } = req.body; // Token és új jelszavak

    // Ellenőrizzük, hogy a két jelszó megegyezik-e
    if (password !== passwordAgain) {
      return res.status(401).send({ error: "Passwords must match!" });
    }

    // Megkeressük a felhasználót a token alapján, és ellenőrizzük, hogy a token érvényes-e
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // Token lejárati idejének ellenőrzése
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // A jelszó titkosítása és mentése
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // Az új jelszó mentése és a token törlése
    user.passwordHash = passwordHash;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    return res.json({ message: "Password was set successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Felhasználó kijelentkeztetése
router.get("/logout/:id", async (req, res) => {
  try {
    const { id } = req.params; // Felhasználó azonosítója az URL-ből

    // Ellenőrizzük, hogy kaptunk-e ID-t
    if (!id) {
      res.status(400).send({ message: "No user ID was provided" });
    }

    const user = await User.findById(id); // Felhasználó lekérése az adatbázisból

    // Ellenőrizzük, hogy létezik-e a felhasználó
    if (!user) {
      res.status(404).send({ message: "User not found!" });
    }

    // A felhasználó státuszának "offline"-ra állítása
    user.status = "offline";
    await user.save();

    // Token törlése és kijelentkeztetés
    res.cookie("token", "", {
      httpOnly: false,
      sameSite: "None", // allow cross-site cookie
      secure: true, // cookie only over HTTPS
      expires: new Date(0),
    });
    res.send("User logged out successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
router.get("/loggedIn", async (req, res) => {
  try {
    const token = req.cookies.token; // Token lekérése a cookie-ból
    if (!token) return res.json(false);

    // Token érvényesítése
    jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).send(true);
  } catch (err) {
    res.json(false);
  }
});

// Bejelentkezett felhasználó adatainak lekérése
router.get("/loggedInUser", async (req, res) => {
  try {
    const token = req.cookies.token; // Token lekérése a cookie-ból

    // Ha nincs token, akkor nincs bejelentkezett felhasználó
    if (!token)
      return res.send("There is no logged in user matching this token!");

    const { user } = jwt.decode(token); // Token dekódolása

    const currentUser = await User.findById(user); // Felhasználó lekérése az adatbázisból

    // Bejelentkezett felhasználó státuszának "online"-ra állítása
    currentUser.status = "online";
    await currentUser.save();

    // Felhasználói adatok DTO formátumban történő visszaadása
    const UserDTO = {
      _id: currentUser._id,
      email: currentUser.email,
      username: currentUser.username,
      exp: currentUser.exp,
      lvl: currentUser.lvl,
      taskToday: currentUser.taskToday,
      avatar: currentUser.avatar,
      friendships: currentUser.friendships,
      clan: currentUser.clan,
      banner: currentUser.banner,
      description: "",
      status: currentUser.status,
      isAdmin: currentUser.isAdmin,
    };

    res.status(200).json(UserDTO);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

// Feladat hozzáadása a felhasználóhoz
router.put("/addTaskToday", async (req, res) => {
  try {
    const { user_id, task_id } = req.body; // Felhasználó és feladat azonosítók

    // Felhasználó frissítése a feladattal
    const user = await User.findByIdAndUpdate(
      user_id,
      {
        $push: { taskToday: task_id }, // Feladat hozzáadása a taskToday listához
      },
      { new: true } // Az új dokumentum visszaadása
    ).populate("taskToday", "title exp _length");

    res.status(200).json({
      message: "Task was added successfully!",
      task: user.taskToday, // Frissített taskToday lista
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to add task for today!" });
  }
});

// Feladat eltávolítása a felhasználótól
router.put("/removeTaskToday", async (req, res) => {
  try {
    const { user_id, task_id, exp } = req.body; // Felhasználó és feladat azonosítók, valamint az XP
    const { inProgress } = req.query; // Kérdés, hogy a feladat folyamatban van-e

    console.log(req.body);

    const user = await User.findById(user_id); // Felhasználó lekérése az adatbázisból

    // Ellenőrizzük, hogy létezik-e a felhasználó
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const mongoose = require("mongoose");
    const taskObjectId = new mongoose.Types.ObjectId(task_id); // Feladat azonosító objektummá alakítása

    // Feladat keresése a taskToday listában
    const index = user.taskToday.findIndex((id) => id.equals(taskObjectId));
    if (index !== -1) {
      user.taskToday.splice(index, 1); // Feladat eltávolítása a listából
    } else {
      return res.status(400).json({ error: "Task not found!" }); // Ha a feladat nem található
    }

    console.log(inProgress);

    // Ha a feladat nincs folyamatban, az XP csökkentése
    if (inProgress === "false") {
      user.exp -= exp;
    }

    // Felhasználó mentése az adatbázisba
    await user.save();

    // Frissített taskToday lista lekérése
    await user.populate("taskToday", "title exp _length");

    return res.status(200).json({
      message: "Task was deleted successfully!",
      task: user.taskToday, // Frissített taskToday lista
      newExp: user.exp, // Frissített XP
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" }); // Hibakezelés
  }
});

// Felhasználó felhasználónevének frissítése
router.put("/updateUsername", async (req, res) => {
  try {
    const { _id, username } = req.body; // Felhasználó azonosítója és az új felhasználónév

    console.log(_id, username);

    // Ellenőrizzük, hogy mindkét paraméter megvan-e
    if (!_id || !username) {
      return res
        .status(400)
        .send({ message: "No id or username was provided!" });
    }

    // Felhasználónév frissítése az adatbázisban
    const result = await User.findByIdAndUpdate(
      _id,
      { $set: { username: username } }, // Új felhasználónév beállítása
      { new: true } // Az új dokumentum visszaadása
    );

    console.log(result);

    if (result) {
      return res.status(200).send(result); // Sikeres frissítés
    } else {
      return res.status(404).send({ message: "User not found!" }); // Ha a felhasználó nem található
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" }); // Hibakezelés
  }
});

// Felhasználó avatárjának frissítése
router.put("/updateAvatar", async (req, res) => {
  try {
    const { _id, avatar } = req.body; // Felhasználó azonosítója és az új avatar

    console.log(_id, avatar);

    // Ellenőrizzük, hogy mindkét paraméter megvan-e
    if (!_id || !avatar) {
      return res.status(400).send({ message: "No ID or avatar was provided!" });
    }

    // Avatar frissítése az adatbázisban
    const result = await User.findByIdAndUpdate(
      _id,
      { $set: { avatar: avatar } }, // Új avatar beállítása
      { new: true } // Az új dokumentum visszaadása
    );

    console.log(result);

    if (result) {
      return res.status(200).send(result); // Sikeres frissítés
    } else {
      return res.status(404).send({ message: "User not found!" }); // Ha a felhasználó nem található
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" }); // Hibakezelés
  }
});

// Felhasználó bannerjének frissítése
router.put("/updateBanner", async (req, res) => {
  try {
    const { banner } = req.body; // Új banner
    const { user: _id } = jwt.decode(req.cookies.token); // Felhasználó azonosítója a tokenből

    // Ellenőrizzük, hogy mindkét paraméter megvan-e
    if (!_id || !banner) {
      return res.status(400).send({ message: "No ID or banner was provided!" });
    }

    // Banner frissítése az adatbázisban
    const result = await User.findByIdAndUpdate(
      _id,
      { $set: { banner: banner } }, // Új banner beállítása
      { new: true } // Az új dokumentum visszaadása
    );

    if (result) {
      return res.status(200).send(result); // Sikeres frissítés
    } else {
      return res.status(404).send({ message: "User not found!" }); // Ha a felhasználó nem található
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" }); // Hibakezelés
  }
});

// Új email cím beállítása egy adott felhasználónak
router.put("/newEmail/:id", async (req, res) => {
  try {
    const { id } = req.params; // Felhasználó azonosítója az URL-ből
    const { email } = req.body; // Új email cím a kérés törzséből

    // Ellenőrzés, hogy az azonosító és az email cím meg van-e adva
    if (!id || !email) {
      return res.status(400).send({ error: "Email is required!" });
    }

    // Felhasználó frissítése az új email címmel
    const result = await User.findByIdAndUpdate(id, { email });

    // Ha nem található a felhasználó, vagy nem sikerült frissíteni
    if (!result) {
      return res.status(400).send({ error: "Wrong user id or wrong email!" });
    }

    // Sikeres frissítés visszajelzése
    return res
      .status(200)
      .send({ message: "Email was changed successfully!", email });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Új jelszó beállítása egy adott felhasználónak
router.put("/newPassword/:id", async (req, res) => {
  try {
    const { id } = req.params; // Felhasználó azonosítója
    const { password, passwordAgain, currentPassword } = req.body; // Új jelszó és annak megerősítése

    // Ellenőrzés, hogy minden szükséges adat meg van-e adva
    if (!id || !password || !passwordAgain) {
      return res.status(400).send({ error: "Password is required!" });
    }
    console.log(password, passwordAgain, currentPassword);
    // Ellenőrzés, hogy a két jelszó egyezik-e
    if (password !== passwordAgain) {
      return res.status(401).send({ error: "Password must match!" });
    }

    // Felhasználó lekérése az adatbázisból
    const user = await User.findById(id);

    // Jelenlegi jelszó ellenőrzése
    const passwordCompare = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!passwordCompare) {
      return res.status(401).send({ error: "Wrong current password!" });
    }

    // Új jelszó titkosítása és mentése
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    user.passwordHash = passwordHash;
    await user.save();

    // Sikeres frissítés visszajelzése
    return res
      .status(200)
      .send({ message: "Password was changed successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Felhasználói fiók törlése (státusz "deleted"-re állítása)
router.put("/deleteAccount/:id", async (req, res) => {
  try {
    const { id } = req.params; // Felhasználó azonosítója

    // Token törlése a cookie-ból
    res.cookie("token", "", {
      httpOnly: false,
      sameSite: "None", // allow cross-site cookie
      secure: true, // cookie only over HTTPS
      expires: new Date(0),
    });

    // Felhasználó státuszának "deleted"-re állítása
    await User.findByIdAndUpdate(id, { status: "deleted" });

    return res.send({ message: "Account deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

// Napi feladatok befejezése (taskToday lista kiürítése)
router.delete("/finishDay/:id", async (req, res) => {
  try {
    const id = req.params.id; // Felhasználó azonosítója

    // Felhasználó frissítése: taskToday lista kiürítése
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { taskToday: [] } },
      { new: true }
    );

    // Ha a felhasználó nem található
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Sikeres frissítés visszajelzése
    return res
      .status(200)
      .json({ message: "Day finished!", task: user.taskToday });
  } catch (error) {
    console.log(err);
    res.status(500).send({ message: error.message });
  }
});

// Szintlépés beállítása egy adott felhasználónak
router.put("/lvlUp/:id", async (req, res) => {
  try {
    const id = req.params.id; // Felhasználó azonosítója
    const lvl = req.body.nextLVL; // Következő szint

    // Felhasználó szintjének frissítése
    await User.findByIdAndUpdate(id, { $set: { lvl } });

    res.status(200).send("Lvl set!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Felhasználó adatainak lekérése az azonosító alapján
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Felhasználó azonosítója

    // Felhasználó lekérése az adatbázisból
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).status("No user found");
    }

    const UserDTO = {
      _id: user._id,
      email: user.email,
      username: user.username,
      exp: user.exp,
      lvl: user.lvl,
      taskToday: user.taskToday,
      avatar: user.avatar,
      friendships: user.friendships,
      clan: user.clan,
      banner: user.banner,
      description: "",
      status: user.status,
      isAdmin: user.isAdmin,
    };

    // Ha a felhasználó megtalálható

    return res.status(200).send(UserDTO);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
