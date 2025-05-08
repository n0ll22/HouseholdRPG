const mongoose = require("mongoose");

// Létrehozzuk a barátság (friendship) séma definícióját
const friendshipSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId, // A barátság kérést küldő felhasználó azonosítója
      ref: "User", // Kapcsolat a "User" modellhez
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId, // A barátság kérést fogadó felhasználó azonosítója
      ref: "User", // Kapcsolat a "User" modellhez
      required: true,
    },
    status: {
      type: String, // A barátság státusza szöveges formában
      enum: ["pending", "accepted", "blocked", "none"], // Csak ezek közül az értékek közül lehet választani
      default: "pending", // Alapértelmezett státusz: függőben
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId, // Ha valaki letiltja a másikat, itt tároljuk annak a felhasználónak az azonosítóját
      ref: "User", // Kapcsolat a "User" modellhez
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Friendship", friendshipSchema);
