// ----- Importok -----
import React, { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { FaCheck } from "react-icons/fa6"; // Pipás ikon az új chat létrehozásához
import { ChatProp, FriendshipProp, UserProp } from "../../Tools/types"; // Típusok importálása
import NewChatList from "./NewChatList"; // Részelem: új chathez tartozó ismerősök listája
import socket from "../socket";

// ----- Átadott változók típusa -----
type Props = {
  loggedInUser: UserProp;
  chatRooms: ChatProp[];
  friends?: FriendshipProp["otherUser"][];
  newChatInput: string;
  setNewChatInput: Dispatch<SetStateAction<string>>;
};

// ----- React Komponens -----
const NewChat: React.FC<Props> = ({
  loggedInUser, // jelenlegi felhasználó
  friends = [], // barátok
  newChatInput, // bemeneti érték
  setNewChatInput, // bemeneti érték megváltoztatása
  chatRooms, // chat szobák
}) => {
  // Kiválasztott résztvevők azonosítóinak tömbje
  const [participantIds, setParticipantIds] = useState<string[]>([]);

  // Lista láthatóságának állapota
  const [showList, setShowList] = useState({ input: false, selected: false });

  // Résztvevő hozzáadása
  const addParticipant = (id: string) => {
    // Csak akkor adjuk hozzá, ha még nincs benne a listában
    if (!participantIds.includes(id)) {
      setParticipantIds([...participantIds, id]);
      setNewChatInput(""); // Input mező törlése
      setShowList({ input: false, selected: true }); // Lista frissítése
    }
  };

  // Résztvevő eltávolítása
  const removeParticipant = (id: string) => {
    // Töröljük a kiválasztott résztvevőt a tömbből
    setParticipantIds(participantIds.filter((pid) => pid !== id));
  };

  // új chat létrehozása
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // Alapértelmezett űrlap viselkedés tiltása

    const allIds = [...participantIds, loggedInUser._id]; // Minden kiválasztott + saját ID

    socket.emit("new_chat", allIds); // Chat létrehozásának kérése a szerver felé

    // Állapot visszaállítása alapértelmezettre
    setParticipantIds([]);
    setNewChatInput("");
    setShowList({ input: false, selected: true });
  };

  // JSX megjelenítés
  return (
    <form className="w-full border-b" onSubmit={handleSubmit}>
      {/* Felső sáv: bemeneti mező és pipás gomb */}
      <div className="flex justify-between w-full">
        <input
          className="p-2 rounded-md h-10 w-4/5 border border-black"
          type="text"
          value={newChatInput}
          name="new-chat-input"
          placeholder="New Chat"
          onChange={(e) => setNewChatInput(e.target.value)} // Input mező frissítése
          onClick={() => setShowList({ input: true, selected: true })} // Lista megjelenítése
          onBlur={() => {
            // Blur esemény után késleltetés, hogy ne zárja be idő előtt a listát
            setTimeout(() => {
              setShowList({ selected: false, input: true });
            }, 100);
          }}
        />
        {/* Csak akkor jelenjen meg a küldés gomb, ha van kiválasztott résztvevő */}
        {participantIds.length > 0 && (
          <button
            type="submit"
            className="flex border border-black items-center justify-center w-10 h-10 text-2xl rounded-md hover:bg-green-400 hover:text-white transition"
          >
            <FaCheck />
          </button>
        )}
      </div>

      {/* Résztvevők és barátok listája */}
      <NewChatList
        isVisible={showList} // Láthatóság állapota
        input={newChatInput} // Input mező tartalma
        friends={friends} // Barátok listája
        participantIds={participantIds} // Kiválasztott résztvevők
        chatRooms={chatRooms} // Jelenlegi chatek a duplikációk ellenőrzéséhez
        handleAdd={addParticipant} // Hozzáadás handler
        handleRemove={removeParticipant} // Törlés handler
      />
    </form>
  );
};

export default NewChat;
