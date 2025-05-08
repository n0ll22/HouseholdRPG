const Friendship = require("../models/friendshipModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const queryOptions = require("../middleware/queryOptions");

// Összes barátság lekérése
async function getAllFriendships(req, res) {
  try {
    // Lekérjük az összes barátságot, és feltöltjük a senderId és receiverId mezőket (felhasználói adatok)
    const result = await Friendship.find().populate(
      ["senderId", "receiverId"], // A senderId és receiverId mezők feltöltése
      "username avatar lvl" // A szükséges mezők (username, avatar, lvl) a felhasználói adatokat tartalmazzák
    );

    // Ha nincs barátság, akkor 204-es státusz kóddal üzenetet küldünk
    if (result.length === 0) {
      return res.status(204).send({ message: "No friendship was found!" });
    }

    // Ha találtunk barátságokat, visszaküldjük azokat 200-as státusszal
    return res.status(200).send(result);
  } catch (err) {
    // Hibakezelés: hiba naplózása és 500-as státusz kódú válasz küldése
    console.error(err);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

// Barátság létrehozása
async function createFriendship(req, res) {
  try {
    // A kérés törzséből kinyerjük a küldő és a fogadó felhasználó ID-ját
    const { senderId, receiverId } = req.body;

    // Új barátság létrehozása "pending" státusszal
    const friendship = new Friendship({
      senderId,
      receiverId,
      status: "pending",
    });

    // A barátság mentése az adatbázisba
    await friendship.save();

    // Ellenőrizzük, hogy sikerült-e elmenteni a barátságot
    const result = await Friendship.findById(friendship._id);

    if (!result) {
      // Ha nem találtuk meg, hibát küldünk
      return res.status(404).send("Couldn't create new friendship!");
    }

    // Frissítjük mindkét felhasználó barátságainak listáját
    await User.findByIdAndUpdate(senderId, {
      $push: { friendships: friendship._id },
    });
    await User.findByIdAndUpdate(receiverId, {
      $push: { friendships: friendship._id },
    });

    // Visszaküldjük a sikeres választ
    return res.status(201).send("Friendship created!");
  } catch (err) {
    // Hibakezelés: hiba naplózása és 500-as státusz kódú válasz küldése
    console.error(err);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

// Egy adott barátság lekérése két felhasználó ID-ja alapján
async function getOneFriendship(req, res) {
  try {
    // A kérésből kinyerjük a két felhasználó ID-ját
    const { user1, user2 } = req.query;

    // Ellenőrizzük, hogy mindkét felhasználó ID-ja meg van-e adva
    if (!user1 || !user2) {
      return res.status(400).send({ error: "Invalid or empty data" });
    }

    // Megkeressük a barátságot az adatbázisban, amely megfelel az egyik felhasználó (senderId) és a másik (receiverId) párosításának
    const result = await Friendship.findOne({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).populate(["senderId", "receiverId"], "username avatar lvl");

    // Ha nem találunk barátságot, válasz küldése
    if (!result) {
      return res.status(204).send({ message: "No friendship was found!" });
    }

    // Az eredmény alapján frissítjük a barátságot
    const updatedFriendship = {
      _id: result._id,
      __v: result.__v,
      currentUser: result.receiverId,
      otherUser: result.senderId,
      senderId: result.senderId._id,
      status: result.status,
    };

    // Visszaküldjük a barátság adatait
    return res.status(200).send(updatedFriendship);
  } catch (err) {
    // Hibakezelés: hiba naplózása és 500-as státusz kódú válasz küldése
    console.error(err);
    return res.status(500).send({ err: "Internal Server Error" });
  }
}

// Lekérdezi a blokkolt barátságokat egy felhasználó ID-ja alapján
async function getBlockedFriendships(req, res) {
  try {
    // A kérésből kinyerjük a felhasználó ID-ját
    const { id } = req.params;

    // Megkeressük az összes blokkolt barátságot, ahol a felhasználó a receiver vagy sender
    const result = await Friendship.find({
      $or: [
        { receiverId: new mongoose.Types.ObjectId(id) },
        { senderId: new mongoose.Types.ObjectId(id) },
      ],
      status: "blocked", // Csak a blokkolt barátságokat vesszük figyelembe
    }).populate("receiverId senderId", "username avatar"); // Felhasználói információk lekérése

    // A válaszban csak a szükséges adatokat küldjük vissza, és meghatározzuk, hogy ki a blokkoló fél
    const filteredData = result.map((item) => {
      if (item.senderId._id.toString() === id) {
        return {
          currentUser: item.senderId, // A jelenlegi felhasználó (sender)
          otherUser: item.receiverId, // A másik felhasználó (receiver)
          senderId: item.senderId._id, // A sender ID-ja
          status: item.status, // A barátság státusza
          blockedBy: item.blockedBy, // Ki blokkolta a másik felhasználót
          _id: item._id, // Barátság ID-ja
        };
      } else if (item.receiverId._id.toString() === id) {
        return {
          currentUser: item.receiverId, // A jelenlegi felhasználó (receiver)
          otherUser: item.senderId, // A másik felhasználó (sender)
          senderId: item.senderId._id, // A sender ID-ja
          status: item.status, // A barátság státusza
          blockedBy: item.blockedBy, // Ki blokkolta a másik felhasználót
          _id: item._id, // Barátság ID-ja
        };
      }
      return null; // Ha egyik fél sem egyezik, visszaadunk null-t
    });

    // A blokkolt barátságokat tartalmazó választ visszaküldjük
    return res.status(200).json(filteredData);
  } catch (err) {
    // Hibakezelés: hiba naplózása és 500-as státusz kódú válasz küldése
    console.error(err);
    return res.status(500).json({ error: err });
  }
}

// Felhasználó összes barátságának lekérése barátság ID-k alapján
async function getAllFriendshipsForUser(req, res) {
  try {
    // Kinyerjük a barátság ID-kat és a felhasználó ID-ját
    const { friendshipIds } = req.body;
    const { id } = req.params;
    const queries = req.query;

    // Lekérjük a lekérdezési paramétereket (pl. limit és skip)
    const { skip, limit } = queryOptions(queries);

    // Megkeressük a barátságokat az ID-k alapján
    const result = await Friendship.find({
      _id: { $in: friendshipIds }, // Csak azok a barátságok, amelyek szerepelnek az ID listában
    }).populate(["senderId", "receiverId"], "username avatar lvl status"); // Felhasználói adatok lekérése

    // Ha nem találunk barátságokat
    if (!result || result.length === 0) {
      return res.status(204).send({ message: "No friendship was found!" });
    }

    // Adatok szűrése, hogy csak a releváns barátságok maradjanak
    const filteredData = result
      .map((item) => {
        // Ha a jelenlegi felhasználó a sender, akkor a receiver lesz az "otherUser"
        if (item.senderId?._id?.toString() === id && item.receiverId) {
          return {
            currentUser: item.senderId, // Jelenlegi felhasználó (sender)
            otherUser: item.receiverId, // Másik felhasználó (receiver)
            senderId: item.senderId._id, // Sender ID
            status: item.status, // Barátság státusza
            _id: item._id, // Barátság ID
          };
        } else if (item.receiverId?._id?.toString() === id && item.senderId) {
          return {
            currentUser: item.receiverId, // Jelenlegi felhasználó (receiver)
            otherUser: item.senderId, // Másik felhasználó (sender)
            senderId: item.senderId._id, // Sender ID
            status: item.status, // Barátság státusza
            _id: item._id, // Barátság ID
          };
        }
        return null; // Ha nem található egyezés, visszaadunk null-t
      })
      .filter(
        (item) => item !== null && item.otherUser && item.otherUser.username // Kiszűrjük a null értékeket és a hiányzó username-eket
      )
      .filter(
        (f) =>
          f.otherUser.username
            .toLowerCase()
            .includes(queries.search.toLowerCase()) // Keresés a felhasználónevek között
      )
      .sort((a, b) => {
        // Rendezés a felhasználónevek alapján
        const comparison = a.otherUser.username
          .toLowerCase()
          .localeCompare(b.otherUser.username.toLowerCase());
        return queries.order === "desc" ? -comparison : comparison; // Növekvő vagy csökkenő rendezés
      })
      .slice(skip, skip + limit); // Limitáljuk az eredményeket a lekérdezett tartományra

    // Visszaküldjük a szűrt barátságokat
    return res.status(200).send(filteredData);
  } catch (err) {
    // Hibakezelés: hiba naplózása és 500-as státusz kódú válasz küldése
    console.error(err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

// Barátság lekérése ID alapján
async function getFriendshipById(req, res) {
  try {
    // Kinyerjük az ID-t a URL-ből
    const id = req.params.id;

    // Megkeressük a barátságot az ID alapján, és lekérjük a felhasználói adatokat is (senderId, receiverId)
    const result = await Friendship.findById(id).populate(
      ["senderId", "receiverId"], // Felhasználói adatokat töltünk be
      "username avatar lvl status" // Milyen adatokat töltünk be a felhasználókról
    );

    // Ha nem találunk barátságot az ID alapján
    if (!result) {
      return res.status(204).send({ message: "No friendship was found!" });
    }

    // Visszaadjuk a barátságot, ha megtaláltuk
    return res.status(200).send(result);
  } catch (err) {
    // Hibakezelés: hiba naplózása és 500-as státusz kódú válasz küldése
    console.error(err);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

module.exports = {
  getAllFriendships,
  createFriendship,
  getOneFriendship,
  getBlockedFriendships,
  getAllFriendshipsForUser,
  getFriendshipById,
};
