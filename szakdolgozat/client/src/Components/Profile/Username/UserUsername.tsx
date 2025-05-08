import React, { MouseEventHandler } from "react";
import { UserProp } from "../../../Tools/types";
import { FaEdit } from "react-icons/fa";
import { EditUserProp } from "../Profile/Profile";

//Rövid magyarázat:
/* Ez a react komponens lehetővé teszi, hogy szerkeszthető és megjeleíthető legyen a
 * az aktuálisan bejelentkezett felhasználó neve.
 */

// Átadott változók típusa
interface Props {
  handleSave: (e: React.KeyboardEvent) => void; // adatok mentésének kezelése
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // név bemeneti mezejének kezelése
  handleUsernameChange: MouseEventHandler<HTMLHeadingElement>; // új felahsználónév kezelése
  setEditLogo: React.Dispatch<React.SetStateAction<EditUserProp>>; // szerkesztési logo beállítása
  editLogo: { username: boolean }; //szerkesztés állapota
  newUserName: string; // új felhasználónév adata
  loggedInUser: UserProp; // bejelentkezett aktuális felhasználó adatai
  isEditing: { username: boolean }; //szerkesztés folyamata
}

const UserUsername: React.FC<Props> = ({
  handleSave,
  handleInputChange,
  handleUsernameChange,
  setEditLogo,
  editLogo,
  newUserName,
  isEditing,
  loggedInUser,
}) => {
  // JSX Megjelenítése

  return (
    loggedInUser && (
      <>
        {isEditing.username ? ( //ha szerkesztés folyamtban van, csak akkor jelenjen meg
          <input
            type="text"
            value={newUserName}
            onChange={handleInputChange} //új érték beállítása
            onBlur={() => handleSave} // kurzor elhagyásra mentés
            onKeyDown={handleSave} // enter leütésre mentsen
            className="text-4xl w-fit font-bold mb-10"
            id="username-input"
            autoFocus
          />
        ) : (
          <h2
            onClick={handleUsernameChange} //kattintásra szerkesztés mód
            className="flex w-fit text-4xl font-bold mb-10 rounded-lg cursor-pointer hover:bg-gray-200 transition-all"
            id="username"
            onMouseEnter={() =>
              setEditLogo((prevState) => ({
                // szerkesztés ikon megjelenítése
                ...prevState,
                username: true,
              }))
            }
            onMouseLeave={() =>
              // szerkesztés ikon eltüntetése
              setEditLogo((prevState) => ({
                ...prevState,
                username: false,
              }))
            }
          >
            {newUserName}

            <div
              className={`${
                editLogo.username
                  ? "opacity-100 translate-x-2"
                  : "opacity-0 -translate-x-4"
              } transition-all`}
            >
              <FaEdit />
            </div>
          </h2>
        )}
      </>
    )
  );
};

export default UserUsername;
