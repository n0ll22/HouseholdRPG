// ----- Importok -----
import React, { Dispatch, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChatProp,
  FriendshipProp,
  Participant,
  UserProp,
} from "../../Tools/types";
import socket from "../../Tools/socket";

// ----- Rövid magyarázat -----
/* Ez a React (Array) Function Component a létező chat szobák megjelenítéséért felel.
 * Amennyiben hozzáadaásra kerül egy új szoba az is itt fog megjelenni a websocket-nek
 * köszönhetően. A listázott szobák megnyitásával átirányódik az URL a megfelelő
 * szoba azonosítójára.
 */

// ----- átadott változók típusai -----

interface Props {
  chatRooms: ChatProp[];
  loggedInUser: UserProp;
  setChatDropdown: Dispatch<React.SetStateAction<boolean>>;
  setChatRooms: Dispatch<React.SetStateAction<ChatProp[]>>;
}

// ----- React Komponens -----

/* React Komponens átadott változói
 *  - chatRooms: összes chat szoba, amivel a felhasználó rendelkezik
 *  - loggedInUser: jelenlegi felhasználó adatai
 *  - setChatDropdown: set useState, ami beállítja a lenyíló menü állapotát (igazra vagy hamisra)
 *  - setChatRooms: set useState, ami hozzáadja az új chat szobát a változóhoz
 */

const ChatRoomList: React.FC<Props> = ({
  chatRooms,
  loggedInUser,
  setChatDropdown,
  setChatRooms,
}) => {
  //Record típusu useState létrehozása olvasatlan üzenetekhez
  const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>(
    {}
  );

  //Navigációhoz szükséges hook
  const nav = useNavigate();

  // Beérkező üzenetek és felhasználó státuszának fogadása
  // Új üzenet elküldése
  useEffect(() => {
    //Új üzenet a küldésének kezelése
    const handleNewMessage = ({
      chatId,
      senderId,
      content,
    }: {
      chatId: string;
      senderId: string;
      content: string;
    }) => {
      //Ha nem mi vagyunk a küldő, akkor legyen olvasatlan az üzenet
      if (senderId !== loggedInUser._id) {
        setUnreadMessages((prev) => ({ ...prev, [chatId]: true }));
      }

      //A chat szobák esetén be kell állítani a szoba id-nak megfelelően mi volt az utolsó üzenet

      setChatRooms((prev) =>
        prev.map(
          (chatRoom) =>
            chatRoom._id === chatId //Ha a megkapott chat id és a meglévő chat id megegyezik
              ? {
                  ...chatRoom,
                  // Akkor legyen a legutóbb üzenet beállítva
                  latest: {
                    ...chatRoom.latest,
                    senderId,
                    content,
                  },
                }
              : chatRoom //Ha nincs találat, akkor ne változzon semmi.
        )
      );
    };

    //Felhasználó státuszának kezelése
    const handleReceiveStatus = (user: Participant) => {
      //minden szoba esetén a résztevevők id-ja alapján állítsuk be az új állapotot (offline, online)
      setChatRooms((prevRooms) =>
        prevRooms.map((room) => {
          const updatedParticipants = room.participants.map(
            (p) => (p._id === user._id ? { ...p, ...user } : p) //Ha kapott user azonosító megfelel valamely résztvevő azonosítójával, akkor adjuk át az új adatokat
          );
          return { ...room, participants: updatedParticipants }; //Adjuk vissza a frissített résztvevők objektumát
        })
      );
    };

    //Socketek használata a fent említett metódusok meghívásával
    socket.on("newMessage", handleNewMessage);
    socket.on("receive_status", handleReceiveStatus);

    //Ha nem használjuk a useEffect-et akkor kapcsolódjunk le a socket-ekről
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("receive_status");
    };
  }, [loggedInUser, setChatRooms]); //a useEffect szoba vagy felhasználó változására hívódik

  //Utolára küldö fél felhasználónevének kikeresésée
  const getUsername = (chatRoom: ChatProp) => {
    //Chat szoba létezésének ellenőrzése
    if (chatRoom) {
      //Chat szoba küldőjének id-jének kikeresése
      const senderId = chatRoom.latest?.senderId;

      //Vizsgálat, hogy senderID egy objektum, nem null és "username" mező meglelhető a senderId-ban
      if (
        typeof senderId === "object" &&
        senderId !== null &&
        "username" in senderId
      ) {
        //ha igaz, adja vissza a senderId "username" mezejét mint Participant típus
        return (senderId as Participant).username;
      }
      //Térjen vissza a megfelelő felhasználóvévvel
      return (
        chatRoom.participants.find(
          // Az otherUser típusú résztvevőknek id-je meg kell feleljen a küldő id-jével
          (p: FriendshipProp["otherUser"]) => p._id === senderId
          // Ha megtalálta, akkor adja vissza a felhasználónév mezőt, hiba esetén pedig Ismeretlen felhasználót
        )?.username || "Unknown"
      );
    }
  };

  //JSX megjelenítés
  return (
    <div className="py-2" onClick={() => setChatDropdown(false)}>
      {/* Chat szobák kilistázása */}
      {chatRooms.map((chatRoom, index) => {
        //Csak olyan résztvevők megjelenítése akik nem a jelenlegi felhasználó
        const participant = chatRoom.participants.find(
          (p) => p._id !== loggedInUser._id
        );
        if (!participant) return null;

        return (
          <div
            key={index} //uuid
            className="hover:bg-slate-200 cursor-pointer rounded-lg flex items-center py-2"
            onClick={() => {
              nav(`/profile/chat/${chatRoom._id}`); //navigálás a chat szobához, url tartalmazza a chat id-ját
            }}
          >
            {/* Fél profilképe */}
            <div
              style={{
                backgroundImage: `url(/img/pfps/${participant.avatar})`,
              }}
              className="rounded-md mx-2 w-16 h-16 bg-center bg-cover"
            >
              <div className="flex flex-row-reverse w-full h-full items-end">
                {/* Fél státusza */}
                <div
                  className={`w-4 h-4 translate-x-1 translate-y-1 rounded-full ${
                    participant.status === "online"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
              </div>
            </div>
            {/* Utolsó üzenet adatai: Küldő neve, üzenet tartalma */}
            <div>
              <div className="flex items-center">
                <p className={unreadMessages[chatRoom._id] ? "font-bold" : ""}>
                  {participant.username}
                </p>
              </div>

              {chatRoom.latest && (
                <p className="text-sm text-gray-500">
                  <span className="font-bold">{getUsername(chatRoom)}:</span>{" "}
                  {/* Méretnek megfelelően, hosszabb üzenetek levágása, formázása */}
                  {chatRoom.latest.content.length > 15
                    ? `${chatRoom.latest.content.slice(0, 12)}...`
                    : chatRoom.latest.content}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatRoomList;
