const mongoose = require("mongoose");

// Létrehozzuk a Process (folyamat) séma definícióját
const ProcessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // A folyamatot indító felhasználó azonosítója
    ref: "User", // Kapcsolat a "User" modellhez (idegen kulcs)
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId, // Az adott feladathoz tartozó azonosító
    ref: "Task", // Kapcsolat a "Task" modellhez
  },
  startTime: {
    type: Date, // A folyamat kezdési ideje
    default: Date.now, // Alapértelmezett érték: az aktuális idő
  },
  duration: {
    type: Number, // A folyamat időtartama másodpercben
  },
  progress: {
    type: Number,
    default: 0, // A folyamat előrehaladása százalékban (0-100%)
  },
  completed: {
    type: Boolean,
    default: false, // Mutatja, hogy a folyamat be van-e fejezve
  },
});

const Process = mongoose.model("Process", ProcessSchema);

module.exports = Process;
