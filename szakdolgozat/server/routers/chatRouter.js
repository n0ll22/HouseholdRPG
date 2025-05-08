const express = require("express");
const { auth } = require("../middleware/auth");
const {
  createOrFindChat,
  getChatByParticipants,
  sendMessage,
  getMessagesByChatId,
  getChatsByUserId,
  getChatAndMessagesById,
} = require("../controllers/chatController");

const router = express.Router();

// Új chat létrehozása vagy meglévő keresése két felhasználó között
router.post("/", auth, createOrFindChat);

// Chat keresése két felhasználó ID-ja alapján
router.get("/getOneByParticipants", auth, getChatByParticipants);

// Üzenet küldésének route-ja
router.post("/messages", auth, sendMessage);

// Üzenetek lekérése egy adott chatból
router.get("/messages/:id", auth, getMessagesByChatId);

// Felhasználó összes chatjának lekérése
router.get("/getByParticipants/:id", auth, getChatsByUserId);

// Chat és üzenetek lekérése chat ID alapján
router.get("/:id", auth, getChatAndMessagesById);

module.exports = router;
