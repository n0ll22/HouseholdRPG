// ----- Importálások -----
import React, { useEffect, useState } from "react";
import {
  ChatRoomProp,
  MessageProp,
  MessagePropSend,
  UserProp,
} from "../../Tools/types"; // Típusok
import ChatMessages from "./ChatMessages"; // Chat üzenetek kompnens
import { FaXmark } from "react-icons/fa6"; // react ikon
import { FaAngleUp } from "react-icons/fa"; //react ikon
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import { Api } from "../../QueryFunctions"; //API hívások

// ----- Rövid magyarázat -----
/**
 * Ez a React (Arrow) Function Component a chat szoba megjelenítéséért felelős. Itt kerül sor az üzenetek
 * elküldésére és fogadására, ami egy web-socket segítségével történik.
 */

// ----- Átadott változók típusai -----

interface Prop {
  _id: string | undefined;
  loggedInUser: UserProp;
}

// ------ React Komponens ------

/* Komponens átadott változói:
 *  - _id: chat szoba azonosító
 *  - loggedInUser: aktuális felhasználó adatai
 */
const ChatRoom: React.FC<Prop> = ({ _id, loggedInUser }) => {
  // Navigációhoz szükséges hook
  const nav = useNavigate();
  // Chat szoba useState változó
  const [chatRoom, setChatRoom] = useState<ChatRoomProp | null>(null);
  // Új üzenet useState változója
  const [newMessage, setNewMessage] = useState<MessagePropSend>({
    chatId: "",
    content: "",
    senderId: loggedInUser._id,
  });

  //Szoba azonosító változására futó useEffect
  //Ha van _id akkor csatlakozzunk a chat szoba websocket-éhez és kérjük le a szoba adatait
  useEffect(() => {
    if (_id) {
      socket.emit("join_chat", _id);
      Api().getChatById(_id, setChatRoom);
    }
  }, [_id]); //Feltétel (dependency): szoba azonosítója

  // Üzenet formázásának kezelése: ha entert nyom, elküldés, ha shift entert akkor sortörést alkalmaz
  const handleTextFormat = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(); // 👈 Call it directly
    }
  };

  // Üzenet küldésének kezelése
  const handleSendMessage = () => {
    // Ha nincs az üzenetnek tartalma, visszatérés
    if (!newMessage.content.trim()) return;

    // Üzenet előkészítése a küldéshez
    const finalMessage = {
      ...newMessage,
      chatId: _id,
    };

    //Üzenet elküldése websocketen keresztül
    socket.emit("send_message", finalMessage);

    // Input mező törlése
    setNewMessage((prev) => ({ ...prev, content: "" }));
  };

  // A jelenlegi és a többi felhasználó elkülönítése
  const otherUsers = chatRoom?.chat.participants.filter(
    (p) => p._id !== loggedInUser._id
  );

  // Üzenet fogadását szolgáló useEffect
  useEffect(() => {
    //Üzenet fogadásának metódusa
    const onReceiveMessage = (populatedMessage: MessageProp) => {
      console.log(populatedMessage);
      setChatRoom((prev) => {
        if (!prev) return prev;
        //Ha van adat, akkor adjuk a meglévő üzenetekhez az új üzenetet
        return {
          ...prev,
          messages: [...prev.messages, populatedMessage],
        };
      });
    };
    //Ha érkezik üzenet a websocket felől, a fogadás metódusa fusson le
    socket.on("receive_message", onReceiveMessage);

    //Ha nem fut a useEffect, kapcsolódjunk le a socket-ről
    return () => {
      socket.off("receive_message", onReceiveMessage);
    };
  }, []);

  //JSX megjelenítés
  return (
    <div className="bg-white p-4 rounded-lg w-full transition">
      {/* Ha van chat szoba kiválaszva, és megvannak a felhasználók adatai, akkor jelenítsük meg az adataikat */}
      {chatRoom &&
        otherUsers &&
        otherUsers?.length === 1 &&
        otherUsers?.map((otherUser, index) => (
          <div key={index} className="flex justify-between pb-4 border-b">
            <div className="flex items-center">
              {/*Címzett profilképe és felhasználóneve */}
              <img
                className="w-16 mr-2 rounded-md"
                src={`/img/pfps/${otherUser?.avatar}`}
                alt=""
              />
              <p className="font-semibold text-2xl">{otherUser?.username}</p>
            </div>
            {/* Chat bezárása: Az url ne tartalmazza az id-t, ezért ne legyen mit megjeleníteni. */}
            <button onClick={() => nav("/profile/chat")}>
              <FaXmark className="rounded border w-8 h-8 p-1" />
            </button>
          </div>
        ))}

      {/* Ha a szoba több felhasználóból áll mint 2, (azaz több a beszélőpartner mint 1), akkor Group Chat verzió megjelenítése */}
      {chatRoom && otherUsers && otherUsers?.length > 1 && (
        <div>Group Chat</div>
      )}

      {/* Ha minden adat a rendelkezésünkre áll, akkor jelenítsük meg az üzeneteket */}
      {chatRoom && otherUsers && (
        <ChatMessages
          messages={chatRoom.messages}
          loggedInUser={loggedInUser}
        />
      )}

      {/* Chat szoba betöltésének jelzése */}
      {chatRoom !== null && !chatRoom && <div>Loading chat...</div>}

      {/* Üzenet küldésének Form-ja. Közzététel során lefut az üzenet kezelésének metódusa */}
      <div className="w-full border-t  pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center border rounded-md"
        >
          {/* Textarea az üzenet bemeneti mezejének. Itt hívódik az üzenet formázásának metódusa */}
          <textarea
            onKeyDown={(e) => handleTextFormat(e)}
            value={newMessage.content}
            onChange={(e) =>
              setNewMessage((prev) => ({ ...prev, content: e.target.value }))
            }
            onClick={() => window.scrollTo({ top: document.body.scrollHeight })}
            name="chat-input"
            className="w-full h-10 p-2 resize-none"
          ></textarea>
          <button type="submit" className="">
            <FaAngleUp className="w-10 h-10 active:-translate-y-1 transition border-l" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
