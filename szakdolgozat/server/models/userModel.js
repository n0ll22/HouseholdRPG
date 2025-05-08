const mongoose = require("mongoose");

// Létrehozzuk a felhasználó (user) sémát
const userSchema = new mongoose.Schema({
  email: {
    type: String, // Felhasználó e-mail címe
    required: true, // Kötelező mező
  },
  username: {
    type: String, // Felhasználónév
    required: true,
  },
  passwordHash: {
    type: String, // Jelszó hash-elve (nem sima szövegként tárolva)
    required: true,
  },
  exp: {
    type: Number, // Felhasználó tapasztalati pontjai
    required: true,
  },
  lvl: {
    type: Number, // Felhasználó szintje (level)
    required: true,
  },
  avatar: {
    type: String, // Avatar URL vagy fájlnév
    required: true,
  },
  taskToday: {
    type: [mongoose.Schema.Types.ObjectId], // Az aznapi feladatok id-jai
    ref: "Task", // Kapcsolódik a "Task" modellhez
    required: true,
  },
  friendships: [
    {
      type: mongoose.Schema.Types.ObjectId, // Barátságok id-jai
      ref: "Comrade", // Kapcsolódik egy másik modellhez (elvileg "Friendship"-nek kéne lennie?)
      required: false,
    },
  ],
  description: {
    type: String, // Profil leírás (bio)
    required: false,
  },
  banner: {
    type: String, // Profilbanner URL vagy fájlnév
    required: true,
  },
  status: {
    type: String, // Felhasználó státusza
    required: true,
    enum: ["online", "offline", "deleted"], // Csak ezek közül az értékek közül választhat
  },
  socketId: String, // Aktuális Socket.IO kapcsolat id-je (realtime kommunikációhoz)
  resetToken: String, // Jelszó visszaállító token
  resetTokenExpiry: Date, // Jelszó visszaállító token lejárati dátuma
  isAdmin: {
    type: Boolean, // Adminisztrátor jogosultság-e
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
