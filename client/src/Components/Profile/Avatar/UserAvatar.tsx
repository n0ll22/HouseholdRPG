import React, { Dispatch, SetStateAction } from "react";
import { EditUserProp } from "../Profile/Profile"; //Felhasználói adat szerkesztés típusa
import AvatarSelector from "../../AvatarSelector/AvatarSelector"; //Profilkép kiválasztó komponens
import { UserProp } from "../../../Tools/types"; //Típus

/*  ----- Rövid magyarázat -----
    Ez a React komponens a jelenlegi felhasználó profilképének megjelenítéséért és 
    szerkesztéséért felel.
*/

// ----- Átadott változók típusai -----

interface Props {
  setEditLogo: Dispatch<SetStateAction<EditUserProp>>;
  handleAvatarChange: (avatar: string) => void;
  handleAvatarEdit: () => void;
  loggedInUser: UserProp;
  editLogo: { avatar: boolean; banner: boolean };
  isEditing: { avatar: boolean; banner: boolean };
  icon: JSX.Element;
  pageWidth: number;
}

// React Komponens

const UserAvatar: React.FC<Props> = ({
  pageWidth,
  loggedInUser, // Aktuális felhasználó
  editLogo, // Avatar szerkszetésének állapota
  isEditing, // Szerkesztés folyamata
  icon, // szerkesztés ikon
  setEditLogo, // szerkesztés állapot beállítása
  handleAvatarChange, // profilkép választásának kezelése
  handleAvatarEdit,
}) => {
  //JSX komponens
  return (
    <div
      className={`${
        pageWidth > 640 ? "w-40 h-40" : "h-64 w-64 rounded-t-lg"
      } bg-cover bg-center flex-shrink-0`}
      style={{
        backgroundImage: `url("/img/pfps/${loggedInUser.avatar}")`,
      }}
      onMouseEnter={() =>
        // Amíg az egér rajta van a div-en addig jelenjen meg a szerkesztés ikonja (alábbi div)
        setEditLogo((prevState) => ({
          ...prevState,
          avatar: true,
        }))
      }
      onMouseLeave={() =>
        //Ha távozik az egér a div-ről, akkor tűnjön el az ikon (alábbi div)
        setEditLogo((prevState) => ({
          ...prevState,
          avatar: false,
        }))
      }
    >
      {editLogo.avatar && ( //Az esetben jelenik meg, ha az egér a profilképen van (onMouseEnter)
        <div
          className={` ${
            editLogo.avatar ? "opacity-100" : "opacity-10"
          } text-8xl flex justify-center z-20 items-center hover:bg-gray-900/50 text-white w-full h-full cursor-pointer transition-all duration-100`}
          onClick={handleAvatarEdit} //Kattintásra jelenítse meg a szerkesztő felületet
        >
          {icon}
        </div>
      )}
      {/* Ha a szerkesztés folyamatban van, akkor jelenjen meg a szerkesztő komponens */}
      {isEditing.avatar && (
        <AvatarSelector handleAvatarChange={handleAvatarChange} />
      )}
    </div>
  );
};

export default UserAvatar;
