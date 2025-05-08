const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

// Új chat létrehozása vagy meglévő keresése két vagy több felhasználó között
async function createOrFindChat(req, res) {
  try {
    // Résztvevők lekérése a kérés törzséből
    const { participants } = req.body;

    // Ellenőrzés: legalább két felhasználó szükséges
    if (!participants || participants.length < 2) {
      return res.status(400).json({ message: "User IDs are required" });
    }

    // Ha három vagy több résztvevő van, csoportos chatet keresünk
    if (participants.length > 2) {
      const existingChat = await Chat.findOne({
        isGroup: true, // Csoportos chat
        participants: { $all: participants }, // Minden megadott résztvevő szerepel benne
      });

      // Ha már létezik ilyen csoportos chat, visszatérünk hibaüzenettel
      if (existingChat) {
        return res.status(400).json({ message: "Chatroom already exists" });
      }
    } else {
      // Két résztvevő esetén privát chatet keresünk
      const existingChat = await Chat.findOne({
        isGroup: false, // Privát chat
        participants: { $all: participants }, // Mindkét felhasználó résztvevő
      });

      // Ha már létezik ilyen privát chat, visszatérünk hibaüzenettel
      if (existingChat) {
        return res.status(400).json({ message: "Chatroom already exists" });
      }
    }

    // Új chat létrehozása, ha nem találtunk meglévőt
    const newChat = await Chat.create({
      isGroup: participants.length > 2, // Igaz, ha 3 vagy több résztvevő van
      participants, // Résztvevők tömbje
    });

    // Sikeres válasz küldése
    res.status(200).json({ message: "Chat Created!", chat: newChat });
  } catch (err) {
    // Hibakezelés
    console.error(err);
    res.status(500).json({ message: "Error creating/fetching chat", err });
  }
}

// Chat keresése két felhasználó ID-ja alapján
async function getChatByParticipants(req, res) {
  try {
    // Lekérdezzük a két felhasználó azonosítóját és az onlyId opciót a query paraméterekből
    const { user1, user2, onlyId } = req.query;

    // A két felhasználó azonosítóját tömbbe rakjuk
    const userIds = [user1, user2];

    // Megpróbáljuk lekérni a már létező chatet, amely mindkét felhasználót tartalmazza
    const result = await Chat.findOne({ participants: { $all: userIds } });

    if (result) {
      // Ha csak az ID-re van szükség, akkor csak azt küldjük vissza
      if (onlyId) {
        return res.send({ chatId: result._id });
      }

      // Egyébként visszaküldjük a teljes chat objektumot
      return res.send(result);
    } else {
      // Ha nem létezik a chat, akkor létrehozunk egy újat
      const newChat = await Chat.create({
        isGroup: false, // Mivel csak két résztvevő van, ez privát chat lesz
        participants: [user1, user2],
      });

      // Visszaküldjük az új chat ID-ját és egy üzenetet
      res.status(202).send({ message: "Chat created!", chatId: newChat._id });
    }
  } catch (error) {
    // Hibakezelés: hiba naplózása a konzolra
    console.error(error);
  }
}

// Üzenet küldésének kezelése
async function sendMessage(req, res) {
  try {
    // Lekérjük a küldő ID-ját, a chat ID-ját és az üzenet tartalmát a kérésből
    const { senderId, chatId, content } = req.body;

    // Létrehozzuk az új üzenetet az adatbázisban
    const newMessage = await Message.create({
      senderId,
      chatId,
      content,
    });

    // Ha valami hiba történt és az üzenet nem jött létre
    if (!newMessage) {
      return res.status(404).json({ error: "Something went wrong!" });
    }

    // Frissítjük a chatet az új üzenettel mint legutóbbi üzenet
    await Chat.findByIdAndUpdate(chatId, { latest: newMessage._id });

    // Visszaküldjük az új üzenetet
    res.status(200).json(newMessage);
  } catch (error) {
    // Hiba naplózása és hibaválasz küldése
    console.error(error);
    res.status(500).json({ message: "Error sending message", error });
  }
}

// Üzenetek lekérése egy adott chatből
async function getMessagesByChatId(req, res) {
  try {
    // Lekérjük a chat ID-ját az útvonal paraméterekből
    const { id } = req.params;

    // Lekérjük az adott chathez tartozó összes üzenetet, és feltöltjük a feladó adatait
    const result = await Message.find({ chatId: id }).populate(
      "senderId",
      "username avatar"
    );

    // Ha van eredmény, visszaküldjük
    if (result) {
      res.json(result);
    } else {
      // Ha nincs adat, visszaküldünk egy üzenetet
      res.status(202).send({ message: "no data" });
    }
  } catch (err) {
    // Hiba naplózása és hibaválasz küldése
    console.error(err);
    res.status(500).json({ error: err });
  }
}

// Felhasználó összes chatjának lekérése
async function getChatsByUserId(req, res) {
  try {
    // A felhasználó ID-ját lekérjük az útvonal paraméterekből
    const userId = req.params.id;

    // Lekérjük az összes chatet, amelyben a felhasználó részt vesz
    const chats = await Chat.find({
      participants: userId,
    })
      .populate("participants", "username avatar status") // Feltöltjük a résztvevő felhasználók adatokat
      .populate("latest", "senderId content"); // Feltöltjük a legújabb üzenet adatait

    // Ha nem találunk chatet, visszaküldünk egy 404-es hibát
    if (!chats) {
      return res.status(404).json({ error: "No chat was found" });
    }

    // Visszaküldjük a megtalált chatokat
    res.status(200).json(chats);
  } catch (error) {
    // Hibakezelés: hiba naplózása és hibaválasz küldése
    console.error(error);
    res.status(500).json({ message: "Error fetching chat rooms" });
  }
}

// Chat és üzenetek lekérése chat ID alapján
async function getChatAndMessagesById(req, res) {
  try {
    // A chat ID-ját lekérjük az útvonal paraméterekből
    const { id } = req.params;

    // Lekérjük a chat adatokat
    const chat = await Chat.findById(id).populate(
      "participants",
      "username avatar status"
    );

    // Lekérjük az adott chathez tartozó összes üzenetet
    const messages = await Message.find({ chatId: id }).populate(
      "senderId",
      "username avatar status"
    );

    // Ha nincs chat vagy üzenet, visszaküldünk egy 404-es hibát
    if (!chat || !messages) {
      return res.status(404);
    }

    // Visszaküldjük a chat adatokat és az üzeneteket
    res.status(200).json({ chat, messages });
  } catch (error) {
    // Hibakezelés: hiba naplózása és hibaválasz küldése
    console.error(error);
    res.status(500).json({ message: "Error fetching chat rooms" });
  }
}

module.exports = {
  createOrFindChat,
  getChatByParticipants,
  sendMessage,
  getMessagesByChatId,
  getChatsByUserId,
  getChatAndMessagesById,
};
