import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Api } from "../../Tools/QueryFunctions";
import { useUser } from "../Auth/AuthContext/UserContext";

//Ez a react komponens a profilkép ikon megjelenítéséért felel
//Kattintásra lenyíl egy menü

//Átadott változók típusa
interface Props {
  avatar: string;
}
// React Komponens
const ProfileIcon: React.FC<Props> = ({ avatar }) => {
  //A profilkép menü állapota
  const [profileTab, setProfileTab] = useState<boolean>(false);
  //navigációhoz szükséges hook
  const nav = useNavigate();
  const user = useUser();

  //Profilkép megjelenítésének kezelése
  const handleTab = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    switch (e.currentTarget.id) {
      case "profile_icon":
        setProfileTab((prev) => !prev);
        return;
      case "nav_to_profile":
        nav("/profile/info");
        setProfileTab(false);
        return;
      case "open_messages":
        nav("/profile/chat");
        return;
      case "logout":
        await Api().getLogout(user!._id);
        nav("/");
        window.location.reload();
        return;
    }
  };

  return (
    <>
      <div
        className={`fixed right-4 top-4 w-14 h-14 bg-gray-100 rounded-lg
        cursor-pointer flex items-center justify-center hover:bg-gray-300
        transition-all shadow-md bg-cover bg-center`}
        id="profile_icon"
        style={{
          backgroundImage: `url("/img/pfps/${avatar}")`,
        }}
        onClick={(e) => handleTab(e)} // menü megjelenítésének kezelése
      ></div>
      {/* Az esetben jelenjen meg, ha rákattinottak az ikonra */}
      {profileTab ? (
        <div
          className="absolute z-30 top-20 right-4 rounded-md bg-white w-64 transition-all space-y-2"
          onMouseLeave={() => setProfileTab(false)}
          id="profile_tab"
        >
          <p
            className="hover:bg-gray-200 p-2 rounded-md"
            id="nav_to_profile"
            onClick={(e) => handleTab(e)} // navigálás a profilra
          >
            Profile
          </p>
          <p
            id="open_messages"
            className="hover:bg-gray-200 p-2 rounded-md"
            onClick={(e) => handleTab(e)} // navigálás az üzenetekhez
          >
            Messages
          </p>
          <p
            id="logout"
            className="hover:bg-gray-200 p-2 rounded-md"
            onClick={(e) => handleTab(e)}
          >
            Logout
          </p>
        </div>
      ) : null}
    </>
  );
};

export default ProfileIcon;
