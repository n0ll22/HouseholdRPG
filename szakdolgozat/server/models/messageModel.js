// Betöltjük a mongoose csomagot a MongoDB-vel való munkához
const mongoose = require("mongoose");

// Létrehozzuk az üzenet (message) sémát
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId, // Az üzenetet küldő felhasználó ID-ja
      ref: "User", // Kapcsolat a "User" modellhez
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId, // Az a chat, amelyhez az üzenet tartozik
      ref: "Chat", // Kapcsolat a "Chat" modellhez
      required: true,
    },
    content: {
      type: String,
      required: true,
      // Az üzenet szöveges tartalma
    },
    seen: {
      type: Boolean,
      required: true,
      default: false,
      // Jelzi, hogy az üzenetet megtekintették-e
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
