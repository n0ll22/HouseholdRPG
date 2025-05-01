const Friendship = require("../models/friendshipModel");
const auth = require("../middleware/auth");
const User = require("../models/userModel");
const queryOptions = require("../queryOptions");
const router = require("express").Router();
const mongoose = require("mongoose");

// Elfogadott barátságok lekérése
router.get("/getAccepted", auth, async (req, res) => {
  try {
    const { friendshipIds } = req.query; // Az elfogadott barátságok ID-jainak lekérése a query paraméterekből

    // Az ID-k alapján lekérjük a barátságokat
    const result = await Friendship.find({
      _id: { $in: friendshipIds },
    }).populate(["senderId", "receiverId"], "username avatar lvl"); // A felhasználói adatok feltöltése

    // Csak az "accepted" státuszú barátságok szűrése
    const filteredResult = result.filter((r) => r.status === "accepted");

    if (!result) {
      return res.status(204).send({ message: "No friendship was found!" }); // Ha nincs találat, üres válasz
    }

    return res.status(200).send(filteredResult); // Az elfogadott barátságok visszaküldése
  } catch (err) {
    console.error(err); // Hiba naplózása
    return res.status(500).send({ message: "Internal Server Error" }); // Szerverhiba válasz
  }
});

// Függőben lévő barátságok lekérése
router.get("/getPending", auth, async (req, res) => {
  try {
    const { friendshipIds } = req.query; // Függőben lévő barátságok ID-jainak lekérése

    // Az ID-k alapján lekérjük a barátságokat
    const result = await Friendship.find({
      _id: { $in: friendshipIds },
    }).populate(["senderId", "receiverId"], "username avatar lvl");

    // Csak a "pending" státuszú barátságok szűrése
    const filteredResult = result.filter((r) => r.status === "pending");

    if (!result) {
      return res.status(204).send({ message: "No friendship was found!" }); // Ha nincs találat, üres válasz
    }

    return res.status(200).send(filteredResult); // A függőben lévő barátságok visszaküldése
  } catch (err) {
    console.error(err); // Hiba naplózása
    return res.status(500).send({ message: "Internal Server Error" }); // Szerverhiba válasz
  }
});

// Összes barátság lekérése
router.get("/", auth, async (req, res) => {
  try {
    // Az összes barátság lekérése az adatbázisból
    const result = await Friendship.find().populate(
      ["senderId", "receiverId"],
      "username avatar lvl"
    );

    if (result.length === 0) {
      return res.status(204).send("No friendship was found!"); // Ha nincs találat, üres válasz
    }

    return res.status(200).send(result); // Az összes barátság visszaküldése
  } catch (err) {
    console.error(err); // Hiba naplózása
    return res.status(500).send({ message: "Internal Server Error" }); // Szerverhiba válasz
  }
});

// Új barátság létrehozása
router.post("/", auth, async (req, res) => {
  try {
    const { senderId, receiverId } = req.body; // A kérés törzséből lekérjük a küldő és fogadó felhasználók ID-ját

    // Új barátság objektum létrehozása
    const friendship = new Friendship({
      senderId,
      receiverId,
      status: "pending", // Alapértelmezett státusz: "pending"
    });

    await friendship.save(); // Az új barátság mentése az adatbázisba

    const result = await Friendship.findById(friendship._id); // Az újonnan létrehozott barátság lekérése

    if (!result) {
      return res.status(404).send("Couldn't create new friendship!"); // Ha nem sikerült létrehozni, hibaüzenet
    }

    // A barátság hozzáadása a felhasználókhoz
    await User.findByIdAndUpdate(senderId, {
      $push: { friendships: friendship._id },
    });
    await User.findByIdAndUpdate(receiverId, {
      $push: { friendships: friendship._id },
    });

    return res.status(201).send("Friendship created!"); // Sikeres válasz
  } catch (err) {
    console.error(err); // Hiba naplózása
    return res.status(500).send({ message: "Internal Server Error", err }); // Szerverhiba válasz
  }
});

// Egy adott barátság lekérése két felhasználó között
router.get("/getOneFriendship", auth, async (req, res) => {
  try {
    const { user1, user2 } = req.query; // A két felhasználó ID-jának lekérése a query paraméterekből

    if (!user1 || !user2) {
      return res.status(400).send({ message: "Invalid or empty data" }); // Ha hiányzik valamelyik ID, hibaüzenet
    }

    // Barátság keresése a két felhasználó között
    const result = await Friendship.findOne({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).populate(["senderId", "receiverId"], "username avatar lvl");

    if (!result) {
      return res.status(204).send({ message: "No friendship was found!" }); // Ha nincs találat, üres válasz
    }

    // A barátság adatok formázása
    const updatedFriendship = {
      _id: result._id,
      __v: result.__v,
      currentUser: result.receiverId,
      otherUser: result.senderId,
      senderId: result.senderId._id,
      status: result.status,
    };

    return res.status(200).send(updatedFriendship); // A barátság adatok visszaküldése
  } catch (err) {
    console.error(err); // Hiba naplózása
    return res.status(500).send({ message: "Internal Server Error" }); // Szerverhiba válasz
  }
});

// Blokkolt barátságok lekérése
router.get("/getBlocked/:id", auth, async (req, res) => {
  try {
    const { id } = req.params; // A felhasználó ID-jának lekérése az útvonal paraméterből

    // Blokkolt barátságok keresése, ahol a felhasználó küldő vagy fogadó
    const result = await Friendship.find({
      $or: [
        { receiverId: new mongoose.Types.ObjectId(id) },
        { senderId: new mongoose.Types.ObjectId(id) },
      ],
      status: "blocked", // Csak a "blocked" státuszú barátságok
    }).populate("receiverId senderId", "username avatar"); // Felhasználói adatok feltöltése

    // Az eredmények formázása, hogy a "currentUser" mindig az aktuális felhasználó legyen
    const filteredData = result.map((item) => {
      if (item.senderId._id.toString() === id) {
        return {
          currentUser: item.senderId,
          otherUser: item.receiverId,
          senderId: item.senderId._id,
          status: item.status,
          blockedBy: item.blockedBy,
          _id: item._id,
        };
      } else if (item.receiverId._id.toString() === id) {
        return {
          currentUser: item.receiverId,
          otherUser: item.senderId,
          senderId: item.senderId._id,
          status: item.status,
          blockedBy: item.blockedBy,
          _id: item._id,
        };
      }
      return null; // Ha az ID nem egyezik, null-t ad vissza
    });

    return res.status(200).json(filteredData); // A blokkolt barátságok visszaküldése
  } catch (err) {
    console.error(err); // Hiba naplózása
    return res.status(500).json({ error: err }); // Szerverhiba válasz
  }
});

// Összes barátság lekérése egy felhasználó számára
router.post("/getAllFriendshipForUser/:id", auth, async (req, res) => {
  try {
    const { friendshipIds } = req.body; // A barátságok ID-jainak lekérése a kérés törzséből
    const { id } = req.params; // A felhasználó ID-jának lekérése az útvonal paraméterből
    const queries = req.query; // Query paraméterek (keresés, rendezés, lapozás)

    console.log("Queries", queries); // Debugging log
    console.log("Body", friendshipIds); // Debugging log
    console.log("Params", id); // Debugging log

    const { skip, limit } = queryOptions(queries); // Lapozási paraméterek feldolgozása

    // Barátságok keresése az ID-k alapján
    const result = await Friendship.find({
      _id: { $in: friendshipIds },
    }).populate(["senderId", "receiverId"], "username avatar lvl status");

    if (!result || result.length === 0) {
      return res.status(204).send({ message: "No friendship was found!" }); // Ha nincs találat, üres válasz
    }

    console.log(result); // Debugging log

    // Az eredmények szűrése és rendezése
    const filteredData = result
      .map((item) => {
        if (item.senderId?._id?.toString() === id && item.receiverId) {
          return {
            currentUser: item.senderId,
            otherUser: item.receiverId,
            senderId: item.senderId._id,
            status: item.status,
            _id: item._id,
          };
        } else if (item.receiverId?._id?.toString() === id && item.senderId) {
          return {
            currentUser: item.receiverId,
            otherUser: item.senderId,
            senderId: item.senderId._id,
            status: item.status,
            _id: item._id,
          };
        }
        return null; // Ha az ID nem egyezik, null-t ad vissza
      })
      .filter(
        (item) => item !== null && item.otherUser && item.otherUser.username
      ) // Csak az érvényes adatokat tartja meg
      .filter((f) =>
        f.otherUser.username
          .toLowerCase()
          .includes(queries.search.toLowerCase())
      ) // Keresés a felhasználónevek között
      .sort((a, b) => {
        const comparison = a.otherUser.username
          .toLowerCase()
          .localeCompare(b.otherUser.username.toLowerCase());
        return queries.order === "desc" ? -comparison : comparison; // Rendezés növekvő vagy csökkenő sorrendben
      })
      .slice(skip, skip + limit); // Lapozás

    console.log(filteredData); // Debugging log

    return res.status(200).send(filteredData); // A szűrt és rendezett adatok visszaküldése
  } catch (err) {
    console.error(err); // Hiba naplózása
    return res.status(500).send({ message: "Internal Server Error" }); // Szerverhiba válasz
  }
});

// Egy adott barátság lekérése ID alapján
router.get("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id; // A barátság ID-jának lekérése az útvonal paraméterből
    const result = await Friendship.findById(id).populate(
      ["senderId", "receiverId"],
      "username avatar lvl status"
    ); // A barátság és a kapcsolódó felhasználói adatok lekérése

    if (!result) {
      return res.status(204).send({ message: "No friendship was found!" }); // Ha nincs találat, üres válasz
    }

    return res.status(200).send(result); // A barátság adatok visszaküldése
  } catch (err) {
    console.error(err); // Hiba naplózása
    return res.status(500).send({ message: "Internal Server Error" }); // Szerverhiba válasz
  }
});

module.exports = router;
