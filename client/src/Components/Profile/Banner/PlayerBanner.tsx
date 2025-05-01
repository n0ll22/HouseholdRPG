import React, { useState } from "react";
import { FriendshipProp } from "../../../Tools/types"; // Típusok
import { RiBeerLine } from "react-icons/ri"; // react ikon
import { FaMessage } from "react-icons/fa6"; // react ikon
import { IoMdPersonAdd } from "react-icons/io"; // react ikon
import { ImBlocked } from "react-icons/im"; // react ikon
import { useNotification } from "../../Notification/Notification";

// ------ Átadott változó típusok -------

interface Props {
  bannerColor: string;
  username: string;
  taskTodayCount: number;
  lvl: number;
  friendship: FriendshipProp | null | undefined;
  handleSendFriendRequest: () => void;
  handleUnsendFriendRequest: (loggedInUserId: string) => void;
  handleNavigationToChat: () => void;
}

const UserBanner: React.FC<Props> = ({
  friendship, // Barátság a másik felhasználóval
  bannerColor, // Banner színe (tailwind szín)
  username, // másik user felhasználóneve
  lvl, // másik user szintje
  taskTodayCount, // másik felhasználó ma megtett feladatok mennyisége
  handleSendFriendRequest, //barátfelkérés köldése
  handleUnsendFriendRequest, //barátfelkérés visszavonása
  handleNavigationToChat, //barát chat szoba megjelenítése
}) => {
  //Barátság visszavonása állapotváltozója
  const [unfriendPopUp, setUnfriendPopUp] = useState(false);
  const { notify } = useNotification();
  //JSX megjelenítése
  return (
    <div
      className={` 
                ${bannerColor} 
             flex w-full justify-between flex-wrap`}
    >
      <div className="p-10 flex space-x-10">
        <p className="text-white drop-shadow">LVL: {lvl}</p>
        <p className="text-white drop-shadow">
          Today's Tasks: {taskTodayCount}
        </p>
      </div>
      {/* Megjelenítés módja, ha barátok a felhasználók */}
      {friendship?.status === "accepted" && (
        <div className="p-10 flex flex-col space-y-2">
          <button
            onClick={() => setUnfriendPopUp(true)} // Visszavonás lehetőségének megadása
            className=" h-8 w-32 border drop-shadow rounded bg-white cursor-default"
          >
            <span className="w-full flex justify-around items-center">
              Comrades
              <RiBeerLine />
            </span>
          </button>
          <button
            onClick={() => handleNavigationToChat()} // Navigálás kezelése
            className=" h-8 w-32 border drop-shadow rounded bg-white cursor-default"
          >
            <span className="w-full flex justify-around items-center">
              Open Chat
              <FaMessage />
            </span>
          </button>
        </div>
      )}
      {/* Megjelenítés módja, ha folyamatban barátfelkérés */}
      {friendship?.status === "pending" && (
        <div className="p-10">
          <button
            onClick={() => handleUnsendFriendRequest(friendship._id)} //Barátkérés visszavonásának kezelése
            className=" h-8 w-32 border drop-shadow rounded bg-white hover:bg-gray-200 active:translate-y-1 transition"
          >
            Pending
          </button>
        </div>
      )}
      {/* Megjelenítés módja, ha visszautasították már egyszer a felahsználót*/}
      {friendship?.status === "refused" ||
        (friendship?.status === undefined && (
          <div className="p-10">
            <button
              className=" h-8 w-32 border drop-shadow rounded bg-white hover:bg-gray-200 active:translate-y-1 transition"
              onClick={handleSendFriendRequest} //barátfelkérés kezelése
            >
              <span className="w-full flex justify-around items-center">
                Add Friend
                <IoMdPersonAdd />
              </span>
            </button>
          </div>
        ))}
      {/* Megjelenítés módja, ha blokkolt a felhasználó */}
      {friendship?.status === "blocked" && (
        <div className="p-10">
          <button
            className=" h-8 w-32 border drop-shadow rounded bg-white hover:bg-gray-200 active:translate-y-1 transition"
            onClick={() => notify("User is blocked", null)}
          >
            <span className="w-full flex justify-around items-center">
              Blocked
              <ImBlocked />
            </span>
          </button>
        </div>
      )}
      {/* Barátfelkérés visszavonásának megerősítése */}
      {unfriendPopUp && friendship && (
        <div className="absolute top-0 left-0 w-screen h-screen bg-gray-900/50">
          <div className="flex w-full h-full items-center justify-center">
            <div className="bg-white text-center p-4 rounded-lg space-y-10">
              <h2 className="text-2xl font-bold">Are you sure?</h2>
              <p>
                Do you really wish to delete{" "}
                <span className="font-semibold">{username}</span> from you
                comrades?
              </p>
              <div className="flex w-full justify-center space-x-10 text-center">
                <p
                  onClick={() => {
                    handleUnsendFriendRequest(friendship._id); //Megerősítés után barátság visszavonásának kezelése
                    setUnfriendPopUp(false); //Pop-up elrejtése
                  }}
                  className="cursor-pointer w-12 py-1 rounded-md border border-red-500 bg-red-300 text-white font-bold"
                >
                  Yes
                </p>
                <p
                  onClick={() => setUnfriendPopUp(false)} //Pop elrejtése, ne történjen semmi meggondolás esetén
                  className="cursor-pointer w-12 py-1 rounded-md border border-green-500 bg-green-300 text-white font-bold"
                >
                  No
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBanner;
