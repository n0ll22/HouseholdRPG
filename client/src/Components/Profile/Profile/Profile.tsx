import React, { useState } from "react";

import { FaEdit } from "react-icons/fa";
import UserBanner from "../Banner/UserBanner";
import { useOutletContext } from "react-router-dom";
import UserAvatar from "../Avatar/UserAvatar";
import { UserProp } from "../../../Tools/types";
import UserUsername from "../Username/UserUsername";
import UserDescription from "../Description/UserDescription";
import { Api } from "../../../Tools/QueryFunctions";

export interface EditUserProp {
  username: boolean;
  avatar: boolean;
  description: boolean;
  banner: boolean;
}

const Profile: React.FC = () => {
  const { pageWidth } = useOutletContext<{ pageWidth: number }>();

  const { loggedInUser } = useOutletContext<{ loggedInUser: UserProp }>();

  const icon = <FaEdit />;

  const [isEditing, setIsEditing] = useState<EditUserProp>({
    username: false,
    avatar: false,
    description: false,
    banner: false,
  });
  const [newUserName, setNewUserName] = useState(loggedInUser.username);
  const [editLogo, setEditLogo] = useState<EditUserProp>({
    username: false,
    avatar: false,
    description: false,
    banner: false,
  });

  // Új banner szerkesztésének kezelése
  const handleBannerEdit = () => {
    setIsEditing((prevState) => ({ ...prevState, banner: true }));
  };
  // Új banner API PUT hívása
  const handleBannerColor = async (banner: string) => {
    await Api().putBanner(banner); //API PUT hívás
  };

  //Új avatar szerkesztésének kezelése
  const handleAvatarEdit = () => {
    setIsEditing((prevState) => ({ ...prevState, avatar: true }));
  };

  // Új profilkép API PUT hívása
  const handleAvatarChange = async (avatar: string) => {
    const updateData = { avatar, _id: loggedInUser._id };
    //API hívás, adatok átadása a szervernek
    await Api().putAvatar(updateData);
  };

  // Új felhasználó név szerkesztésének kezelése
  const handleUsernameChange = () => {
    setIsEditing((prevState) => ({ ...prevState, username: true }));
  };

  // Fehasználónév input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewUserName(e.target.value);
  };

  // Enter leütéskor, vagy focus elveszítésénél PUT REQUEST kezelése
  const handleSave = async (e: React.KeyboardEvent | React.FocusEvent) => {
    if (e.type === "blur" || (e as React.KeyboardEvent).key === "Enter") {
      //input ellenőrzés
      setIsEditing((prevState) => ({ ...prevState, username: false }));
      if (newUserName === loggedInUser.username) {
        //Ha ugyanaz a felh. név mint előzőleg, visszatérés
        return;
      }
      if (newUserName && loggedInUser._id) {
        await Api().putUsername(loggedInUser._id, newUserName);
      }
    }
  };

  return (
    <main className="w-full p-10 animate-fadeInFast">
      <h1 className="border-l-4 pl-2 py-2 font-bold text-5xl mb-10">
        The Legend:
      </h1>

      {/*UserName Component*/}
      <UserUsername
        editLogo={editLogo}
        handleInputChange={handleInputChange}
        handleSave={handleSave}
        handleUsernameChange={handleUsernameChange}
        setEditLogo={setEditLogo}
        isEditing={isEditing}
        newUserName={newUserName}
        loggedInUser={loggedInUser}
      />
      {loggedInUser && (
        <div
          className={`flex flex-col ${
            pageWidth > 640 ? "" : "w-full items-center"
          }`}
        >
          <div className={`flex ${pageWidth > 640 ? "w-full" : "flex-col"}`}>
            {/*Avatar Component*/}
            <UserAvatar
              pageWidth={pageWidth}
              editLogo={editLogo}
              handleAvatarChange={handleAvatarChange}
              handleAvatarEdit={handleAvatarEdit}
              icon={icon}
              isEditing={isEditing}
              setEditLogo={setEditLogo}
              loggedInUser={loggedInUser}
            />
            {/*Banner Component*/}
            <UserBanner
              pageWidth={pageWidth}
              editLogo={editLogo}
              handleBannerColor={handleBannerColor}
              handleBannerEdit={handleBannerEdit}
              isEditing={isEditing}
              setEditLogo={setEditLogo}
              loggedInUser={loggedInUser}
            />
          </div>
          <div className="p-2">
            <UserDescription description={loggedInUser.description} />
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;
