const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cp = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const nodemailer = require("nodemailer");
const socket = require("./socket");
const path = require("path");

// Környezeti változók betöltése
dotenv.config();

// MongoDB adatbázis kapcsolat létrehozása
mongoose
  .connect(process.env.MONGODB_CON) // A kapcsolat URL-jét a környezeti változókban tároljuk
  .then(() => console.log("Connected to MongoDB")); // Sikeres kapcsolat esetén üzenet

// Express alkalmazás inicializálása
const app = express();
const server = http.createServer(app); // HTTP szerver létrehozása az Express alkalmazásból

// Middleware-ek beállítása
app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
  })
); // CORS engedélyezése a megadott kliens URL-re
app.use(cp()); // Cookie-k kezelése
app.use(express.json()); // JSON formátumú kérések feldolgozása

// WebSocket inicializálása
socket(server);

// Útvonalak (Routes) beállítása
app.use("/user", require("./routers/userRouter")); // Felhasználói útvonalak
app.use("/task", require("./routers/taskRouter")); // Feladatokhoz kapcsolódó útvonalak
app.use("/chat", require("./routers/chatRouter")); // Chat funkciókhoz kapcsolódó útvonalak
app.use("/friendship", require("./routers/friendshipRouter")); // Barátságokhoz kapcsolódó útvonalak

// Alapértelmezett útvonal
app.get("/", (req, res) => {
  res.status(200).send({ message: "SERVER RESPONSE OK" }); // Egyszerű válasz az alapértelmezett GET kérésre
});
//Hibabejelentő végpont
app.post("/api/report-bug", async (req, res) => {
  const { email, description } = req.body; //beérkező adatok
  //Adatok ellenőrzése
  if (!email || !description) {
    return res.status(400).json({ error: "Hiányzó mezők." });
  }
  //email elküldése a szerver email-re
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Hibajelentő" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Új hibajelentés érkezett",
      html: `
        <h3>Bejelentő: ${email}</h3>
        <p><strong>Leírás:</strong></p>
        <pre>${description}</pre>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Sikeresen elküldve" });
  } catch (err) {
    console.error("Hiba az email küldésnél:", err);
    res.status(500).json({ error: "Sikertelen küldés" });
  }
});

app.use(express.static(path.join(__dirname, "client/build")));
//buildeléshez szükséges
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

// 404-es hiba kezelése
app.use((req, res, next) => {
  res.status(404).send("Page not found"); // Ha az útvonal nem létezik, 404-es hibaüzenet
});

// Szerver indítása
const PORT = process.env.PORT || 8000; // A portot a környezeti változókban tároljuk, vagy alapértelmezés szerint 8000
server.listen(PORT, () => {
  console.log(`Server started. Listening on port ${PORT}`); // Üzenet a sikeres indításról
});
