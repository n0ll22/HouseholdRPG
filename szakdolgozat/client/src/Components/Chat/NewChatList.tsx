// ----- Importálások -----

import React from "react";
import { ChatProp, FriendshipProp } from "../../Tools/types"; // Típusok

// ----- Átadott változó típusok -----

type Props = {
  input: string;
  friends?: FriendshipProp["otherUser"][];
  participantIds: string[];
  isVisible: { input: boolean; selected: boolean };
  chatRooms: ChatProp[];
  handleAdd: (id: string) => void;
  handleRemove: (id: string) => void;
};

// ----- React Komponens -----
// React komponens átadott változói
const NewChatList: React.FC<Props> = ({
  input, //beviteli mező
  friends = [], //barátok (comrades)
  participantIds, //chat résztvevők azonosítói
  isVisible, // keresés láthatósága
  handleAdd, // chat résztvevő hozzáadasának kezelése
  handleRemove, // chat résztvevő törlésének kezelése
  chatRooms,
}) => {
  //Azon barátok akiket kiválasztottunk beszélgetésre
  const selectedFriends = friends.filter((f) => participantIds.includes(f._id));
  //Azon barátok szűrése akikkel már van chat szoba
  const filteredFriends = friends.filter(
    (f) =>
      !participantIds.includes(f._id) && //ha van ilyen id
      f.username.toLowerCase().includes(input.toLowerCase()) //megegyezik a kereséssel akkor szűrjük ki őket
  );
  //Résztvevők id-jének kiszűrése
  const chatRoomParticipants = chatRooms
    .map((c) => c.participants)
    .flat()
    .map((f) => f._id);

  //JSX Komponens
  return (
    <div className="py-2">
      <div className="flex flex-wrap space-x-2 w-full">
        {/* Kiválasztott barátok listázása */}
        {selectedFriends.map((f, index) => (
          <div
            key={index}
            className="border p-2 rounded-lg cursor-pointer border-black"
            onClick={() => handleRemove(f._id)} //Törlés kezelése
          >
            {f.username}
          </div>
        ))}
      </div>

      {isVisible.selected && (
        <div className="bg-white rounded-md" id="newChatList">
          {/* Kiszűrt barátok megjelenítése, listázása */}
          {filteredFriends &&
            filteredFriends
              .filter((f) => !chatRoomParticipants.includes(f._id)) // csak olyanok megjelenítése aki nem a jelenlegi felhasználó
              .map((f, index) => (
                <div
                  key={index}
                  onClick={() => handleAdd(f._id)} //résztvevő hozzáadása
                  className="flex hover:bg-gray-200 rounded-md cursor-pointer"
                >
                  <img
                    className="h-10 w-10 rounded-md"
                    src={`/img/pfps/${f.avatar}`}
                    alt=""
                  />
                  <p key={f._id} className="p-2 ">
                    {f.username}
                  </p>
                </div>
              ))}
        </div>
      )}
    </div>
  );
};

export default NewChatList;
