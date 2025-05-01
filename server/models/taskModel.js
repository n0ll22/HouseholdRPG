// Betöltjük a mongoose csomagot a MongoDB-vel való munkához
const mongoose = require("mongoose");

// Létrehozzuk a feladat (task) sémát
const taskSchema = new mongoose.Schema({
  title: {
    type: String, // A feladat címe (pl. "Bejelentkezés készítése")
    required: true,
  },
  description: {
    type: String, // A feladat leírása részletesebben
    required: true,
  },
  exp: {
    type: Number, // Tapasztalati pontok száma, amit a feladat elvégzése után kap a felhasználó
    required: true,
  },
  tutorial: {
    type: Array, // A feladathoz kapcsolódó oktatóanyag(ok), pl. lépések, képek, videók URL-jei
    required: true,
  },
  _length: {
    type: Number, // A feladat hossza, pl. hány perc, vagy hány lépés
    required: true,
    min: 1, // Minimum érték 1 (nem lehet nulla vagy negatív)
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
