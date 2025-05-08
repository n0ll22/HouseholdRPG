const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const queryOptions = require("../middleware/queryOptions");
const mongoose = require("mongoose");

// Felhasználók lekérdezése az adatbázisból
async function getUsers(req, res) {
  try {
    // A lekérdezési paraméterek kinyerése a kérésből
    const queries = req.query;
    const { query, sortOptions, skip, limit, page } = queryOptions(queries); // A lekérdezési opciók feldolgozása

    // Felhasználók számának lekérdezése a megadott feltételek alapján
    const totalUsers = await User.countDocuments(query);

    // Felhasználók lekérdezése a megadott feltételek, rendezés, kihagyás és limit alapján
    const allUsers = await User.find(query)
      .sort(sortOptions) // Rendezési opciók alkalmazása
      .skip(skip) // Adatok kihagyása az oldalszámozás miatt
      .limit(parseInt(limit)); // Limit alkalmazása

    // Az eredmény visszaküldése JSON formátumban
    res.json({
      users: allUsers, // Lekérdezett felhasználók
      totalUsers, // Összes felhasználó száma
      totalPages: Math.ceil(totalUsers / limit), // Összes oldal száma
      currentPage: parseInt(page), // Aktuális oldal
    });
  } catch (err) {
    console.error(err); // Hibák naplózása
    res.status(500).send({ error: "An internal server error has occurred..." }); // Hibaüzenet küldése
  }
}

// Felhasználó regisztrációja
async function registerUser(req, res) {
  try {
    // A regisztrációhoz szükséges mezők kinyerése a kérés törzséből
    const { username, password, passwordAgain, email } = req.body;

    // Ellenőrzés: minden mező ki van-e töltve
    if (!username || !password || !passwordAgain || !email) {
      return res.status(400).json({ error: "Fill all required fields!" });
    }

    // Ellenőrzés: a jelszó legalább 8 karakter hosszú legyen
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters!" });
    }

    // Ellenőrzés: a két jelszó egyezzen
    if (password !== passwordAgain) {
      return res.status(400).json({ error: "Passwords must match!" });
    }

    // Ellenőrzés: van-e már ilyen felhasználónév az adatbázisban
    const existingUser = await User.findOne({ username });
    if (existingUser?.username) {
      return res.status(400).json({ error: "Username already taken!" });
    }

    // Só létrehozása és jelszó hashelése
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // Új felhasználó létrehozása alapértelmezett értékekkel
    await User.create({
      email,
      username,
      passwordHash,
      exp: 0, // kezdő tapasztalat
      lvl: 1, // kezdő szint
      avatar: "default.jpg", // alapértelmezett profilkép
      taskToday: [], // napi feladatok kezdetben üres
      banner: "bg-red-400", // alapértelmezett szín
      friendships: [], // barátlista kezdetben üres
      status: "online", // alapértelmezett státusz
      isAdmin: false, // nem adminisztrátor
    });

    // Frissen létrehozott felhasználó lekérése
    const newUser = await User.findOne({ username });

    // JWT token létrehozása a felhasználó azonosítójával
    const token = jwt.sign({ user: newUser.id }, process.env.JWT_SECRET);

    // Token beállítása HTTP-only sütiként
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    // Sikeres válasz visszaküldése
    res.send("Logged In!");
  } catch (err) {
    console.error(err);
    // Hibakezelés szerveroldali hiba esetén
    return res
      .status(500)
      .send({ error: "An internal server error has occurred..." });
  }
}

// Felhasználó bejelentkeztetése
async function loginUser(req, res) {
  try {
    // A kérésből kivesszük a felhasználónevet és jelszót
    const { username, password } = req.body; // Felhasználónév és jelszó a kérés törzséből

    // Ellenőrizzük, hogy mindkét mező ki van-e töltve
    if (!username || !password) {
      return res.status(400).json({ error: "Fill all required fields!" });
    }

    // Felhasználó keresése az adatbázisban felhasználónév alapján
    const existingUser = await User.findOne({ username });

    // Ha nem található, hibát küldünk vissza
    if (!existingUser) {
      return res.status(401).json({ error: "Incorrect username or password!" });
    }

    // A megadott jelszó összehasonlítása a hash-elt jelszóval
    const passwordCompare = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    // Ha a jelszó nem egyezik, hibát küldünk vissza
    if (!passwordCompare) {
      return res.status(401).json({ error: "Incorrect username or password!" });
    }

    // Ha a fiók törölt állapotban van, nem engedjük bejelentkezni
    if (existingUser.status === "deleted") {
      return res.status(401).json({ error: "This account is deleted!" });
    }

    // Sikeres bejelentkezés esetén frissítjük a felhasználó státuszát "online"-ra
    existingUser.status = "online";
    await existingUser.save();

    // JWT token létrehozása a felhasználó azonosítójával
    const token = jwt.sign({ user: existingUser.id }, process.env.JWT_SECRET);

    // Token sütibe helyezése (biztonságos, csak HTTPS és HTTP-only)
    res.cookie("token", token, {
      httpOnly: true, // ne legyen elérhető a frontendről JavaScript segítségével
      sameSite: "None", // más domainről is működjön (pl. frontend-backend külön domainen)
      secure: true, // csak HTTPS-en küldhető el
    });

    // Sikeres válasz
    return res.send("Logged In!");
  } catch (err) {
    // Ha valami hiba történt, szerverhibát küldünk vissza
    console.error(err);
    res.status(500).send({
      error: "Internal Server Error",
    });
  }
}

// Jelszó visszaállítása
async function restorePassword(req, res) {
  try {
    // A kérés törzséből kivesszük az email címet
    const { email } = req.body; // Email cím a kérés törzséből

    // Megkeressük a felhasználót az email cím alapján
    const user = await User.findOne({ email }); // Felhasználó keresése az email alapján

    // Ha nincs ilyen email-című felhasználó, hibát küldünk vissza
    if (!user)
      return res
        .status(404)
        .json({ error: "No user was found with this email address!" });

    // Véletlenszerű token generálása, amit a jelszó visszaállításához használunk
    const token = crypto.randomBytes(32).toString("hex");
    // Token lejárati idő beállítása (15 perc)
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // Token 15 percig érvényes

    // A generált token és lejárati idő mentése a felhasználóhoz
    user.resetToken = token;
    user.resetTokenExpiry = tokenExpiry;

    // Felhasználó adatainak mentése
    await user.save();

    // Visszaállító link létrehozása
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // Email küldéshez szükséges beállítások
    const transporter = nodemailer.createTransport({
      service: "gmail", // Gmail SMTP szolgáltatás használata
      auth: {
        user: process.env.EMAIL_USER, // A fiók felhasználóneve
        pass: process.env.EMAIL_PASS, // A fiók jelszava
      },
    });

    // Email küldése a felhasználónak
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`, // Feladó
      to: email, // Címzett email címe
      subject: "Jelszó visszaállítása", // Tárgy
      html: `<p>Kattints <a target="_blank" href="${resetLink}">ide</a> a jelszó visszaállításához. A link 15 percig érvényes.</p>`, // HTML tartalom
    });

    // Sikeres email küldés után válasz
    return res.json({
      message: "Recovery email has been sent to your email address!",
    });
  } catch (err) {
    // Hiba esetén szerverhiba válasz küldése
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// Fiók újraaktiválása
async function restoreAccount(req, res) {
  try {
    // A kérés törzséből kivesszük az email címet
    const { email } = req.body; // Email cím a kérés törzséből

    // Megkeressük a felhasználót az email cím alapján
    const user = await User.findOne({ email }); // Felhasználó keresése az email alapján

    // Ha nincs ilyen email-című felhasználó, hibát küldünk vissza
    if (!user)
      return res
        .status(404)
        .json({ error: "No user was found with this email address!" });

    // Véletlenszerű token generálása, amit a fiók újraaktiválásához használunk
    const token = crypto.randomBytes(32).toString("hex");
    // Token lejárati idő beállítása (15 perc)
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // Token 15 percig érvényes

    // A generált token és lejárati idő mentése a felhasználóhoz
    user.resetToken = token;
    user.resetTokenExpiry = tokenExpiry;

    // Felhasználó adatainak mentése
    await user.save();

    // Aktiváló link létrehozása
    const resetLink = `${process.env.CLIENT_URL}/reactivate-account/${token}`;

    // Email küldéshez szükséges beállítások
    const transporter = nodemailer.createTransport({
      service: "gmail", // Gmail SMTP szolgáltatás használata
      auth: {
        user: process.env.EMAIL_USER, // A fiók felhasználóneve
        pass: process.env.EMAIL_PASS, // A fiók jelszava
      },
    });

    // Email küldése a felhasználónak
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`, // Feladó
      to: email, // Címzett email címe
      subject: "Fiók újraaktiválása", //Tárgy
      html: `<p>Kattints <a target="_blank" href="${resetLink}">ide</a> a fiók újraaktiválásához. A link 15 percig érvényes.</p>`, // HTML tartalom
    });

    // Sikeres email küldés után válasz
    return res.json({
      message: "Recovery email was sent to your email address!",
    });
  } catch (err) {
    // Hiba esetén szerverhiba válasz küldése
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function reactivateAccount(req, res) {
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
}

async function resetPassword(req, res) {
  try {
    const { token, password, passwordAgain } = req.body; // Token és új jelszavak
    console.log(token, passwordAgain, password);
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
}

// A bejelentkezett státusz lekérése
async function getLoggedInStatus(req, res) {
  try {
    // Ellenőrizzük, hogy van-e érvényes token a cookie-ban
    const token = req.cookies.token;
    if (!token) return res.json(false); // Ha nincs token, akkor nincs bejelentkezett felhasználó

    // A token érvényességének ellenőrzése
    jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).send(true); // Ha érvényes a token, akkor visszaküldjük a státuszt
  } catch (err) {
    res.json(false); // Ha bármilyen hiba van, visszaküldjük, hogy nem vagyunk bejelentkezve
  }
}

// A bejelentkezett felhasználó adatainak lekérése
async function getLoggedInUser(req, res) {
  try {
    // Ellenőrizzük, hogy van-e érvényes token
    const token = req.cookies.token;
    if (!token) {
      return res.send("There is no logged in user matching this token!"); // Ha nincs token, válaszolunk, hogy nincs bejelentkezett felhasználó
    }

    // Kinyerjük a felhasználó adatait a tokenből
    const { user } = jwt.decode(token);
    const currentUser = await User.findById(user); // A felhasználó adatainak lekérése az adatbázisból

    // Beállítjuk a felhasználó státuszát 'online'-ra
    currentUser.status = "online";
    await currentUser.save(); // Elmentjük a változtatásokat

    // A felhasználói adatokat DTO formátumban készítjük el
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

    res.status(200).json(UserDTO); // Visszaküldjük a felhasználó adatokat
  } catch (err) {
    console.log(err);
    res.status(400).send(err); // Hiba esetén válasz küldése
  }
}

// Új feladat hozzáadása a mai napi feladatokhoz
async function addTaskToday(req, res) {
  try {
    const { user_id, task_id } = req.body; // Felhasználó és feladat ID-ja a kérés törzséből

    // A felhasználó frissítése, hozzáadjuk a feladatot a taskToday mezőhöz
    const user = await User.findByIdAndUpdate(
      user_id,
      {
        $push: { taskToday: task_id }, // Feladat hozzáadása a taskToday tömbhöz
      },
      { new: true } // Az új állapotú felhasználót kérjük vissza
    ).populate("taskToday", "title exp _length"); // A taskToday tömb eleminek részletes adatai

    res.status(200).json({
      message: "Task was added successfully!", // Válasz üzenet, hogy a feladat sikeresen hozzá lett adva
      task: user.taskToday, // Visszaadjuk a frissített taskToday listát
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to add task for today!" }); // Hibakezelés, ha nem sikerült a feladat hozzáadása
  }
}

// Felhasználó kijelentkezése
async function logoutUser(req, res) {
  try {
    const { id } = req.params; // Felhasználó ID-ja a kérés paramétereiből

    // Ellenőrizzük, hogy van-e felhasználói ID
    if (!id) {
      return res.status(400).send({ message: "No user ID was provided" }); // Ha nincs ID, hibát küldünk
    }

    // Keresés a felhasználó adatbázisban az ID alapján
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ message: "User not found!" }); // Ha nincs ilyen felhasználó, hibát küldünk
    }

    // Beállítjuk a felhasználó státuszát offline-ra
    user.status = "offline";
    await user.save(); // Mentjük a frissített felhasználót

    // A cookie törlése a felhasználó kijelentkezésével
    res.cookie("token", "", {
      httpOnly: false, // A cookie ne legyen HTTP-only
      sameSite: "None", // Lehetővé tesszük a cross-site cookie használatát
      secure: true, // Csak HTTPS-en keresztül küldjük a cookie-t
      expires: new Date(0), // A cookie érvényességét nullára állítjuk, hogy lejárjon
    });

    res.send("User logged out successfully"); // Válasz a sikeres kijelentkezésről
  } catch (err) {
    console.error(err); // Hibák naplózása
    res.status(500).json({ error: "Internal Server Error" }); // Belső szerver hiba válasz
  }
}

// Feladat eltávolítása a "taskToday" listából
async function removeTaskToday(req, res) {
  try {
    const { user_id, task_id, exp } = req.body; // Felhasználó ID, feladat ID és tapasztalati pontok a kérés törzséből
    const { inProgress } = req.query; // A kérésben szereplő "inProgress" lekérdezés

    // Keresés a felhasználó adatbázisban az ID alapján
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found!" }); // Ha nincs ilyen felhasználó, hibát küldünk
    }

    // Átalakítjuk a task_id-t ObjectId típusra
    const taskObjectId = new mongoose.Types.ObjectId(task_id);

    // Megkeressük a feladat indexét a taskToday tömbben
    const index = user.taskToday.findIndex((id) => id.equals(taskObjectId));

    // Ha nem találjuk, hibát küldünk
    if (index !== -1) {
      user.taskToday.splice(index, 1); // Ha találjuk, eltávolítjuk a feladatot
    } else {
      return res.status(400).json({ error: "Task not found!" });
    }

    // Ha a feladat már nincs folyamatban, csökkentjük az exp-t
    if (inProgress === "false") {
      user.exp -= exp;
    }

    // Mentjük a felhasználót az új taskToday listával és exp értékkel
    await user.save();

    // A taskToday tömböt betöltjük, hogy visszaadhassuk a frissített adatokat
    await user.populate("taskToday", "title exp _length");

    // Válasz küldése a sikeres eltávolításról
    return res.status(200).json({
      message: "Task was deleted successfully!",
      task: user.taskToday, // A frissített taskToday listát küldjük vissza
      newExp: user.exp, // Az új exp értéket is visszaküldjük
    });
  } catch (error) {
    console.error(error); // Hibák naplózása
    return res.status(500).json({ error: "Internal Server Error" }); // Belső szerver hiba válasz
  }
}

async function updateAvatar(req, res) {
  try {
    // Felhasználó keresése az ID alapján
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Avatar frissítése
    user.avatar = avatar;
    await user.save();

    return res.status(200).json({ message: "Avatar updated successfully" });
  } catch (error) {
    console.error(err);
    return res.status(500).json({ error: "Error updating avatar" });
  }
}

async function updateUsername(req, res) {
  try {
    const { _id, username } = req.body;

    if (!_id || !username) {
      return res
        .status(400)
        .send({ message: "No id or username was provided!" });
    }

    const result = await User.findByIdAndUpdate(
      _id,
      { $set: { username } },
      { new: true }
    );

    if (result) {
      return res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "User not found!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

// Banner frissítése
async function updateBanner(req, res) {
  try {
    const { banner } = req.body; // Az új banner a kérés törzséből
    const { user: _id } = jwt.decode(req.cookies.token); // A bejelentkezett felhasználó ID-ja a cookie-ból

    // Ellenőrizzük, hogy megadták-e a felhasználói ID-t és a banner-t
    if (!_id || !banner) {
      return res.status(400).send({ message: "No ID or banner was provided!" }); // Ha valamelyik mező hiányzik, hibát küldünk
    }

    // Frissítjük a banner-t az adatbázisban
    const result = await User.findByIdAndUpdate(
      _id,
      { $set: { banner } }, // Az új banner beállítása
      { new: true } // Az új dokumentumot küldjük vissza
    );

    // Ha sikerült frissíteni, visszaküldjük a frissített felhasználót
    if (result) {
      return res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "User not found!" }); // Ha a felhasználó nem található, hibát küldünk
    }
  } catch (error) {
    console.error(error); // Hibák naplózása
    return res.status(500).send({ message: "Internal Server Error" }); // Belső szerver hiba válasz
  }
}

// Email frissítése
async function updateEmail(req, res) {
  try {
    const { id } = req.params; // A felhasználó ID-ja az URL-ből
    const { email } = req.body; // Az új email a kérés törzséből

    // Ellenőrizzük, hogy mindkét mező meg van-e adva
    if (!id || !email) {
      return res.status(400).send({ error: "Email is required!" }); // Ha valamelyik mező hiányzik, hibát küldünk
    }

    // Frissítjük az email-t a felhasználó adatbázisában
    const result = await User.findByIdAndUpdate(id, { email });

    // Ha nem találjuk a felhasználót vagy hiba történt, hibát küldünk
    if (!result) {
      return res.status(400).send({ error: "Wrong user id or wrong email!" });
    }

    // Ha sikerült frissíteni, visszaküldjük a sikerüzenetet
    return res
      .status(200)
      .send({ message: "Email was changed successfully!", email });
  } catch (err) {
    console.error(err); // Hibák naplózása
    res.status(500).send({ error: "Internal Server Error" }); // Belső szerver hiba válasz
  }
}

// Jelszó frissítése
async function updatePassword(req, res) {
  try {
    const { id } = req.params; // A felhasználó ID-ja az URL-ből
    const { password, passwordAgain, currentPassword } = req.body; // Az új és a régi jelszó a kérés törzséből

    // Ellenőrizzük, hogy az ID és a jelszavak meg vannak-e adva
    if (!id || !password || !passwordAgain) {
      return res.status(400).send({ error: "Password is required!" }); // Ha valami hiányzik, hibát küldünk
    }

    // Ellenőrizzük, hogy az új jelszavak megegyeznek-e
    if (password !== passwordAgain) {
      return res.status(401).send({ error: "Password must match!" }); // Ha nem egyeznek, hibát küldünk
    }

    // Keresés a felhasználó jelszavának ellenőrzéséhez
    const user = await User.findById(id);

    // Ellenőrizzük, hogy a megadott régi jelszó helyes-e
    const passwordCompare = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!passwordCompare) {
      return res.status(401).send({ error: "Wrong current password!" }); // Ha a régi jelszó nem egyezik, hibát küldünk
    }

    // Új jelszó hash-elése
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // Jelszó frissítése
    user.passwordHash = passwordHash;
    await user.save();

    // Ha sikerült a jelszó frissítése, sikerüzenetet küldünk
    return res
      .status(200)
      .send({ message: "Password was changed successfully!" });
  } catch (err) {
    console.error(err); // Hibák naplózása
    res.status(500).send({ error: "Internal Server Error" }); // Belső szerver hiba válasz
  }
}

// Fiók törlése
async function deleteAccount(req, res) {
  try {
    const { id } = req.params; // Felhasználó ID-ja

    // Token eltávolítása a sütikből
    res.cookie("token", "", {
      httpOnly: false,
      sameSite: "None", // Engedélyezi a cross-site sütiket
      secure: true, // Csak HTTPS-en elérhető cookie
      expires: new Date(0), // Az érvényesség lejáratát beállítjuk
    });

    // A felhasználó státuszának "deleted"-re állítása
    await User.findByIdAndUpdate(id, { status: "deleted" });

    return res.send({ message: "Account deleted" }); // Visszaküldjük a törlésről szóló üzenetet
  } catch (error) {
    console.error(error); // Hibák naplózása
    return res.status(500).send({ error: "Internal Server Error" }); // Belső szerver hiba válasz
  }
}

// Nap befejezése
async function finishDay(req, res) {
  try {
    const id = req.params.id; // Felhasználó ID-ja

    // A felhasználó taskToday listájának törlése
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { taskToday: [] } }, // A feladatokat üres listára cseréljük
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" }); // Ha nem találjuk a felhasználót, hibát küldünk
    }

    return res
      .status(200)
      .json({ message: "Day finished!", task: user.taskToday }); // A nap befejezése után visszaküldjük az új taskToday listát
  } catch (error) {
    console.error(error); // Hibák naplózása
    res.status(500).send({ message: error.message }); // Belső szerver hiba válasz
  }
}

// Szintnövelés
async function lvlUp(req, res) {
  try {
    const id = req.params.id; // Felhasználó ID a URL-ből
    const lvl = req.body.nextLVL; // következő szint a törzsből
    //Felhasználó frissítése
    await User.findByIdAndUpdate(id, { $set: { lvl } });

    res.status(200).send("Lvl set!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}

//Felhasználók lekérése id alapján
async function getUserById(req, res) {
  try {
    const { id } = req.params; // Felhasználó ID-ja

    const user = await User.findById(id); // Felhasználó keresése ID alapján

    if (!user) {
      return res.status(404).send("No user found"); // Ha nincs találat, 404-es hibát küldünk
    }

    // Felhasználói adatokat tartalmazó objektum
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
      description: "", // Leírás mező, jelenleg üres
      status: user.status,
      isAdmin: user.isAdmin,
    };

    // Visszaküldjük a felhasználói adatokat 200-as státusszal
    return res.status(200).send(UserDTO);
  } catch (error) {
    console.error(error); // Hiba naplózása
    return res.status(500).send({ message: "Internal Server Error" }); // Ha hiba történik, 500-as hibát küldünk
  }
}

module.exports = {
  getUsers,
  registerUser,
  loginUser,
  restorePassword,
  restoreAccount,
  reactivateAccount,
  resetPassword,
  getLoggedInStatus,
  getLoggedInUser,
  addTaskToday,
  logoutUser,
  removeTaskToday,
  updateUsername,
  updateAvatar,
  updateBanner,
  updateEmail,
  updatePassword,
  deleteAccount,
  finishDay,
  lvlUp,
  getUserById,
};
