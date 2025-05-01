// ----- Importálások ------
import { useEffect, useState, useCallback } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { ChatProp, FriendshipProp, MessageProp } from "../../Tools/types.ts"; //Típusok
import ChatRoom from "./ChatRoom"; //chat szoba komponens
import ChatRoomList from "./ChatRoomList"; // chat szoba lista komponens
import NewChat from "./NewChat.tsx"; // Új chat komponens
import { FaUser } from "react-icons/fa6"; // react ikon
import socket from "../socket";
import { Api } from "../../QueryFunctions.tsx"; //API hívások
import { useUser } from "../Auth/AuthContext/UserContext.tsx"; // jelenlegi felhasználó lekérése

/*
  ------ Rövid magyarázat ------
  Ez a React Arrow Function Component a beszélgetés aloldal megvalósításáért felel. Itt találhatóak azok a
  metódusok amelyek megjelenítésért felelősek, és szűrt adatokat ad át a kisebb komponensek részére.
*/

// ------ React Arrow Function Component ------

const Chat: React.FC = () => {
  // A chat szoba azonosítójávan lekérdezése az URL-ből
  const { id } = useParams();
  // Kontextus használata barátságok lekérdezésére
  const { friendships } = useOutletContext<{
    friendships: FriendshipProp[];
  }>();
  // Jelenlegi felhasználó adatai
  const loggedInUser = useUser();

  // useState hook-ok

  // Összes chat szoba tárolása
  const [chatRooms, setChatRooms] = useState<ChatProp[]>([]);
  // Új chat létrehozásának input-ja
  const [newChatInput, setNewChatInput] = useState("");
  // Ablak szélességének tárolása
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  // Chat szoba lenyíló listának megjelenítése mobile módban
  const [showDropdown, setShowDropdown] = useState(false);

  // Csak olyan barátságok kiszűrése amelyek már elfogadottak
  const friends = friendships
    ? friendships
        ?.filter((f) => f.status === "accepted")
        .map((f) => f.otherUser)
    : [];

  // Átméretezés során aktuális ablakméret tárolásának kezelő metódusa
  const handleResize = useCallback(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  // Lenyíló listát kezelő metódus
  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  // useEffect, amely az átméretezés hatására fut le
  useEffect(() => {
    // Átméretezés figyelése
    window.addEventListener("resize", handleResize);

    // Átméretezés figyelésének kikapcsolása ha nem fut a useEffect
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // useEffect, amely a szerver oldali adatok összegyűjtését és a web-socket adatok érzékelését szolgálja
  useEffect(() => {
    //Amennyiben van felhasználói adat, gyűjtse össze az oldal a felhasználó kapcsolatait
    if (loggedInUser) {
      Api().getByParticipants(loggedInUser, setChatRooms);
    }

    //Új chat szoba érzékelése, és tárolása
    socket.on("receive_new_chat", (chatRoom: ChatProp) => {
      setChatRooms((prev) => [...prev, chatRoom]);
    });

    //Új üzenet érzékelése, majd üzenet beállítása mint "legutóbbi üzenet"
    socket.on("newMessage", (message: MessageProp) => {
      setChatRooms((prev) =>
        prev.map((room) =>
          room._id === message.chatId
            ? { ...room, latestMessage: message.content }
            : room
        )
      );
    });

    //Socketek kikapcsolása ha nem fut a useEffect
    return () => {
      socket.off("receive_new_chat");
      socket.off("newMessage");
    };
  }, []);

  //Képernyőméret folyamatos figyelése. Ha nagyobb mint 1080 pixel, akkor asztali üzemmód lesz az oldalon
  const isDesktop = windowWidth > 1080;

  //JSX megjelenítés
  return (
    <main
      className={`animate-fadeInFast p-10 ${
        isDesktop ? "grid grid-cols-4 space-x-2" : "flex flex-col"
      }`}
    >
      {/* Amennyiben van bejentkezett felhasználói adat (tehát nem null az értéke), komponensek megjelenítése.
        A megjelenítés módja az isDesktop alapján történik */}
      {isDesktop && loggedInUser ? (
        <div className="col-span-1">
          {/* Chat szobák és új chat beviteli mező megjelenítése */}
          <h1 className="border-l-4 pl-2 py-2 font-bold text-5xl mb-10">
            Chats
          </h1>
          {/* Új chat komponens */}
          <NewChat
            newChatInput={newChatInput}
            setNewChatInput={setNewChatInput}
            loggedInUser={loggedInUser}
            friends={friends}
            chatRooms={chatRooms}
          />
          {/* Amennyiben üres az új chat mező, chat lista megjelenítése */}
          {!newChatInput && (
            <ChatRoomList
              chatRooms={chatRooms}
              setChatRooms={setChatRooms}
              loggedInUser={loggedInUser}
              setChatDropdown={setShowDropdown}
            />
          )}
        </div>
      ) : (
        //Ellenkező esetben jelenítsük meg mobile módban az oldalt
        <div
          className="my-2 p-2 flex w-fit justify-center border border-black rounded-md hover:bg-black hover:text-white transition cursor-pointer"
          onClick={toggleDropdown}
        >
          <div className="flex items-center">
            <FaUser className="w-8 h-8 mr-2" /> <span>Chats</span>
          </div>
        </div>
      )}

      {/* Mobile mód esetén ha rákattintottak a lenyíló listára, akkor chat list és új chat mező megjelenítése */}
      {!isDesktop && showDropdown && loggedInUser && (
        <div
          className="absolute w-full z-10 left-0 p-2 bg-gray-100 overflow-y-auto"
          style={{ top: "220px", height: "calc(100vh - 220px)" }}
        >
          <NewChat
            newChatInput={newChatInput}
            setNewChatInput={setNewChatInput}
            loggedInUser={loggedInUser}
            friends={friends}
            chatRooms={chatRooms}
          />
          {!newChatInput && (
            <ChatRoomList
              chatRooms={chatRooms}
              setChatRooms={setChatRooms}
              loggedInUser={loggedInUser}
              setChatDropdown={setShowDropdown}
            />
          )}
        </div>
      )}

      {/* kiválasztott chat szoba megjelenítése */}
      <div
        className={`${isDesktop ? "col-span-3" : "flex w-full"}`}
        style={{ height: isDesktop ? "calc(100vh - 16rem)" : "" }}
      >
        {/* Ha van kiválasztott szoba és van felhasználói adat akkor chat szoba megjelenítése */}
        {id && loggedInUser ? (
          <ChatRoom _id={id} loggedInUser={loggedInUser} />
        ) : (
          <div className="text-center w-full my-auto text-gray-500 text-lg">
            Select a room to start chatting
          </div>
        )}
      </div>
    </main>
  );
};

export default Chat; //Chat exportálása a többi komponens részére
