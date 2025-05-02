const express = require("express");
const { auth, authAdmin } = require("../middleware/auth"); // Auth middleware a védelemhez
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

// Router példányosítása
const router = express.Router();

// Új chat létrehozása vagy meglévő keresése két felhasználó között
router.post("/", auth, async (req, res) => {
  try {
    const { participants } = req.body; // A résztvevő felhasználók

    // Ha nincs elegendő résztvevő, válaszolunk hibaüzenettel
    if (!participants || participants.length < 2) {
      return res.status(400).json({ message: "User IDs are required" });
    }

    // Ha több mint 2 résztvevő van, akkor grupchatot keresünk
    if (participants.length > 2) {
      const existingChat = await Chat.findOne({
        isGroup: true,
        participants: { $all: participants }, // Az összes résztvevőnek szerepelnie kell
      });

      // Ha már létezik ilyen chat, hibát küldünk
      if (existingChat) {
        return res.status(400).json({ message: "Chatroom already exists" });
      }
    } else {
      // Két felhasználó esetén egy sima chatet keresünk
      const existingChat = await Chat.findOne({
        isGroup: false,
        participants: { $all: participants }, // Az összes résztvevőnek szerepelnie kell
      });

      // Ha már létezik, hibát küldünk
      if (existingChat) {
        return res.status(400).json({ message: "Chatroom already exists" });
      }
    }

    // Új chat létrehozása, ha még nem létezik
    const newChat = await Chat.create({
      isGroup: participants.length > 2, // Ha több mint 2 résztvevő van, grupchat
      participants,
    });

    res.status(200).json({ message: "Chat Created!", chat: newChat });
  } catch (err) {
    console.error(err); // Hiba esetén logolás
    res.status(500).json({ message: "Error creating/fetching chat", err });
  }
});

// Chat keresése két felhasználó ID-ja alapján
router.get("/getOneByParticipants", auth, async (req, res) => {
  try {
    const { user1, user2, onlyId } = req.query; // Két felhasználó ID-ja és az, hogy csak az ID-t kérjük-e

    const userIds = [user1, user2]; // Az összes résztvevő ID-ja

    // Chat keresése a két felhasználó között
    const result = await Chat.findOne({ participants: { $all: userIds } });

    // Ha találunk chatet, válaszolunk vele
    if (result) {
      if (onlyId) {
        return res.send({ chatId: result._id }); // Ha csak az ID kell
      }
      return res.send(result); // Ha az egész chatet visszaadjuk
    } else {
      // Ha nincs chat, új chatot hozunk létre
      const newChat = await Chat.create({
        isGroup: false,
        participants: [user1, user2],
      });

      res.status(202).send({ message: "Chat created!", chatId: newChat._id });
    }
  } catch (error) {
    console.error(error); // Hiba logolása
  }
});

// Üzenet küldésének route-ja
router.post("/messages", auth, async (req, res) => {
  try {
    const { senderId, chatId, content } = req.body; // Üzenet küldője, chat ID és tartalom

    // Új üzenet létrehozása
    const newMessage = await Message.create({
      senderId,
      chatId,
      content,
    });
    if (!newMessage) {
      return res.status(404).json({error: "Something went wrong!"})
    }

    // A chat legutóbbi üzenetének frissítése
    await Chat.findByIdAndUpdate(chatId, { latest: newMessage._id });

    res.status(200).json(newMessage); // Válasz a létrehozott üzenettel
  } catch (error) {
    console.error(error); // Hiba logolása
    res.status(500).json({ message: "Error sending message", error });
  }
});

// Üzenetek lekérése egy adott chatból
router.get("/messages/:id", auth, async (req, res) => {
  try {
    const { id } = req.params; // A chat ID-ja

    // Üzenetek lekérése a chat ID alapján
    const result = await Message.find({ chatId: id }).populate(
      "senderId",
      "username avatar" // A küldő felhasználó adatai
    );

    // Ha találunk üzeneteket, visszaküldjük
    if (result) {
      res.json(result);
    } else {
      res.status(202).send({ message: "no data" }); // Ha nincs üzenet, visszaküldünk egy üzenetet
    }
  } catch (err) {
    console.error(err); // Hiba logolása
    res.status(500).json({ error: err }); // Hiba válasz
  }
});

// Felhasználó összes chatjának lekérése
router.get("/getByParticipants/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id; // A felhasználó ID-ja

    // Keresés az összes olyan chatban, ahol a felhasználó résztvevő
    const chats = await Chat.find({
      participants: userId,
    })
      .populate("participants", "username avatar status")
      .populate("latest", "senderId content");

    if (!chats) {
      return res.status(404).json({ error: "No chat was found" });
    }

    res.status(200).json(chats); // Visszaküldjük a chateket
  } catch (error) {
    console.error(error); // Hiba logolása
    res.status(500).json({ message: "Error fetching chat rooms" }); // Hiba válasz
  }
});

// Chat és üzenetek lekérése chat ID alapján
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params; // Chat ID

    // Keresés a chat ID alapján, a résztvevők adataival
    const chat = await Chat.findById(id).populate(
      "participants",
      "username avatar status"
    );

    // Üzenetek lekérése a chat ID alapján
    const messages = await Message.find({ chatId: id }).populate(
      "senderId",
      "username avatar status"
    );

    // Ha nincs chat vagy üzenet, 404-es hiba
    if (!chat || !messages) {
      return res.status(404);
    }

    res.status(200).json({ chat, messages }); // Visszaküldjük a chatet és az üzeneteket
  } catch (error) {
    console.error(error); // Hiba logolása
    res.status(500).json({ message: "Error fetching chat rooms" }); // Hiba válasz
  }
});

// Route exportálása
module.exports = router;
