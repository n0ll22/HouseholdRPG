const { Server } = require("socket.io");
const Chat = require("./models/chatModel");
const Message = require("./models/messageModel");
const User = require("./models/userModel");
const Friendship = require("./models/friendshipModel");
const onlineUsers = {}; // Az online felhasználók tárolása
const disconnectTimeouts = {}; // Időzítések tárolása a felhasználók leválasztásához
require("dotenv").config();

const socket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL], // vagy írd be ide a konkrét címet
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 15000,
  });

  // Új kapcsolat kezelése
  io.on("connection", async (socket) => {
    console.log("A user connected:", socket.id);

    // Felhasználó leválasztása
    socket.on("disconnect", async (reason) => {
      console.log(`Socket ${socket.id} disconnected. Reason: ${reason}`);

      // Megkeressük a sockethez tartozó felhasználót
      const user = await User.findOne({ socketId: socket.id });

      if (user) {
        // Időzítés beállítása a "offline" státuszra váltáshoz
        disconnectTimeouts[user._id] = setTimeout(async () => {
          // Ellenőrizzük, hogy a felhasználó még mindig le van-e csatlakozva
          const freshUser = await User.findById(user._id);
          if (freshUser?.socketId === "" || freshUser?.socketId === socket.id) {
            freshUser.status = "offline"; // Állapot "offline"-ra állítása
            freshUser.socketId = ""; // Socket ID törlése
            await freshUser.save();

            // Mindenkinek elküldjük a státusz frissítését
            io.emit("receive_status", {
              username: freshUser.username,
              avatar: freshUser.avatar,
              status: freshUser.status,
              _id: freshUser._id,
            });
          }

          // Időzítés törlése
          delete disconnectTimeouts[user._id];
        }, 5000); // 5 másodperc
      }
    });

    // Felhasználó regisztrálása
    socket.on("register_user", async (userId) => {
      try {
        if (userId) {
          onlineUsers[userId] = socket.id; // Felhasználó socket ID-jának mentése
          const user = await User.findByIdAndUpdate(userId, {
            status: "online", // Állapot "online"-ra állítása
            socketId: socket.id, // Socket ID mentése
          });

          io.emit("receive_status", user); // Mindenkinek elküldjük a státusz frissítését
        }
      } catch (err) {
        console.error("Error during registration:", err);
      }

      console.log(onlineUsers); // Az online felhasználók listájának kiírása
    });

    // Barátkérés küldése
    socket.on("send_friendRequest", async ({ senderId, receiverId }) => {
      try {
        // Ellenőrizzük, hogy a barátkérés már létezik-e
        const alreadyAdded = await Friendship.findOne({
          senderId,
          receiverId,
        });
        //ha blokkolt, üzenetküldés
        if (alreadyAdded?.status === "blocked") {
          return socket.emit("friendRequest_error", {
            message:
              "User blocked! If you blocked the other user, you can unblock it in the Options tab",
          });
        }
        //ha visszautasított, error
        if (alreadyAdded && alreadyAdded.status !== "refused") {
          return socket.emit("friendRequest_error", {
            message: "Already sent!",
          });
        }

        // Új barátkérés létrehozása
        const friendship = new Friendship({
          senderId,
          receiverId,
          status: "pending", // Állapot "függőben"
        });
        await friendship.save();

        // Felhasználók frissítése a barátkérés azonosítójával
        await User.findByIdAndUpdate(receiverId, {
          $push: { friendships: friendship._id },
        });
        await User.findByIdAndUpdate(senderId, {
          $push: { friendships: friendship._id },
        });

        // Barátkérés adatok lekérése
        const friendRequest = await Friendship.findById(friendship._id)
          .populate(["senderId", "receiverId"], "username avatar lvl")
          .lean();

        const sender = friendRequest.senderId._id;

        // Adatok összeállítása
        const finalData = {
          currentUser: {
            //aktuális felhasználó adatai
            _id: friendRequest.receiverId._id,
            avatar: friendRequest.receiverId.avatar,
            username: friendRequest.receiverId.username,
            lvl: friendRequest.receiverId.lvl,
          },
          otherUser: {
            //másik fél adatai
            _id: friendRequest.senderId._id,
            avatar: friendRequest.senderId.avatar,
            username: friendRequest.senderId.username,
            lvl: friendRequest.senderId.lvl,
          },
          sender,
          _id: friendRequest._id, // Barátkérés azonosítója
          status: friendRequest.status, // Állapot
        };

        // Értesítés a címzettnek, ha online
        const receiverSocket = onlineUsers[receiverId];
        if (receiverSocket) {
          io.to(receiverSocket).emit("receive_friendRequest", finalData);
        }

        // Értesítés a küldőnek a sikeres küldésről
        socket.emit("friendRequest_sent", friendRequest);
      } catch (err) {
        console.error(err);
        socket.emit("friendRequest_error", {
          message: "Failed to send friend request.",
        });
      }
    });

    // Barátkérés visszavonása
    socket.on(
      "unsend_friendRequest",
      async ({ chatId, loggedInUserId, userId }) => {
        try {
          console.log(chatId, loggedInUserId, userId); // A barátkérés adatai a konzolra kerülnek

          // Barátkérés törlése az adatbázisból
          await Friendship.findByIdAndDelete(chatId);

          // A barátkérés eltávolítása a felhasználók kapcsolatai közül
          await User.findByIdAndUpdate(loggedInUserId, {
            $pull: { friendships: chatId },
          });

          await User.findByIdAndUpdate(userId, {
            $pull: { friendships: chatId },
          });

          const deleteData = {
            _id: chatId, // A törölt barátkérés azonosítója
          };

          // Értesítés a felhasználóknak a barátkérés visszavonásáról
          const loggedInSocket = onlineUsers[loggedInUserId];
          const otherSocket = onlineUsers[userId];

          //Törolt adat visszaküldése egyik félnek
          if (loggedInSocket) {
            io.to(loggedInSocket).emit(
              "receive_unsent_friendRequest",
              deleteData
            );
          }
          //Törolt adat visszaküldése másik félnek
          if (otherSocket) {
            io.to(otherSocket).emit("receive_unsent_friendRequest", deleteData);
          }
        } catch (error) {
          console.error("Unsend friend request error:", error); // Hiba naplózása
        }
      }
    );

    // Barátkérés válasz
    socket.on(
      "answer_friendRequest",
      async ({ id, status, senderId, receiverId }) => {
        try {
          console.log("answer data: ", id, status, senderId, receiverId); // A válasz adatai a konzolra kerülnek

          // A barátkérés állapotának frissítése az adatbázisban állapttól függően
          switch (status) {
            case "accepted":
              await Friendship.findByIdAndUpdate(id, { status });
              break;
            case "refused":
              await Friendship.findByIdAndDelete(id);
              await User.updateMany(
                { friendships: id },
                { $pull: { friendships: id } }
              );
              break;
            case "blocked":
              await Friendship.findByIdAndUpdate(id, {
                status,
                blockedBy: receiverId,
              });
              break;
          }

          // A frissített barátkérés adatok lekérése
          const result = await Friendship.findById(id).populate(
            ["senderId", "receiverId"],
            "username avatar lvl"
          );

          const senderSocket = onlineUsers[senderId._id];
          const receiverSocket = onlineUsers[receiverId._id];

          if (status === "refused") {
            // Értesítés a barátkérés elutasításáról
            if (senderSocket) {
              io.to(senderSocket).emit("receive_friendRequest_answer", {
                _id: id,
                status,
              });
            }

            if (receiverSocket) {
              io.to(receiverSocket).emit("receive_friendRequest_answer", {
                _id: id,
                status,
              });
            }
          } else {
            // A frissített barátkérés adatok összeállítása
            const updatedFriendship = {
              _id: result._id,
              __v: result.__v,
              currentUser: result.receiverId,
              otherUser: result.senderId,
              status: result.status,
            };

            // Értesítés a frissített barátkérésről
            if (senderSocket) {
              io.to(senderSocket).emit(
                "receive_friendRequest_answer",
                updatedFriendship
              );
            }

            if (receiverSocket) {
              io.to(receiverSocket).emit(
                "receive_friendRequest_answer",
                updatedFriendship
              );
            }
          }
        } catch (err) {
          console.error("Error answering friend request:", err); // Hiba naplózása
        }
      }
    );

    // Üzenetküldés
    socket.on("send_message", async ({ chatId, senderId, content }) => {
      try {
        console.log("Chat: " + chatId); // A chat azonosítója a konzolra kerül
        const message = new Message({ senderId, chatId, content });
        await message.save();

        // A legutóbbi üzenet frissítése a chatben
        await Chat.findByIdAndUpdate(chatId, { latest: message._id });

        // Az üzenet adatok lekérése
        const populatedMessage = await Message.findById(message._id)
          .populate("senderId", "username avatar")
          .lean();
        console.log("send_message:", populatedMessage); // Az elküldött üzenet adatai

        // Az üzenet továbbítása a chat szobában lévő felhasználóknak
        io.to(chatId).emit("receive_message", populatedMessage);

        // (Opcionális) Általános értesítés küldése másoknak
        io.emit("newMessage", populatedMessage);
      } catch (err) {
        console.error("Error sending message:", err); // Hiba naplózása
      }
    });

    // Chat szoba csatlakozás
    socket.on("join_chat", async (chatId) => {
      console.log("User connected to chat room: ", chatId); // A chat szoba azonosítója a konzolra kerül
      socket.join(chatId); // A felhasználó csatlakozik a chat szobához
    });

    // Create a new chat
    socket.on("new_chat", async (participantIds) => {
      try {
        console.log(participantIds); // A résztvevők azonosítói a konzolra kerülnek
        if (!participantIds || participantIds.length < 2) {
          return console.error("No Ids"); // Hiba, ha nincs elég résztvevő
        }

        if (participantIds.length > 2) {
          // Csoportos chat ellenőrzése
          const existingChat = await Chat.findOne({
            isGroup: true,
            participants: { $all: participantIds },
          });

          if (existingChat) {
            return console.error("Group chat already exists!"); // Hiba, ha a csoportos chat már létezik
          }
        } else {
          // Privát chat ellenőrzése
          const existingChat = await Chat.findOne({
            isGroup: false,
            participants: { $all: participantIds },
          });

          if (existingChat) {
            return console.error("Private chat already exists!"); // Hiba, ha a privát chat már létezik
          }
        }

        // Új chat létrehozása
        const newChat = await Chat.create({
          isGroup: participantIds.length > 2,
          participants: participantIds,
        });

        // A résztvevők adatainak betöltése
        await newChat.populate("participants", "username avatar");

        // Az új chat elküldése a kliensnek
        socket.emit("receive_new_chat", newChat);
      } catch (err) {
        console.error(err); // Hiba naplózása
      }
    });
  });
};

module.exports = socket;
