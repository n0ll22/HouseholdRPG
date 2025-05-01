const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // A chat neve (jelenleg nincs implementálva, optional mező)
    },
    isGroup: {
      type: Boolean,
      required: true,
      // Megmondja, hogy a chat csoportos-e (több emberes) vagy privát (2 emberes)
    },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // A chat résztvevői
    ],

    latest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      // A chathez tartozó legutóbbi üzenet ID-ja (kapcsolódik a Message modellhez)
    },
  },
  { timestamps: true }
);

// Exportáljuk a Chat modellt, hogy máshol is használhassuk
module.exports = mongoose.model("Chat", chatSchema);
