import React, { Dispatch, SetStateAction } from "react";
import { UserProp } from "../../../Tools/types";
import BannerSelector from "./BannerSelector";
import { EditUserProp } from "../Profile/Profile";

interface Props {
  setEditLogo: Dispatch<SetStateAction<EditUserProp>>;
  handleBannerColor: (banner: string) => void;
  handleBannerEdit: () => void;
  loggedInUser: UserProp;
  editLogo: { avatar: boolean; banner: boolean };
  isEditing: { avatar: boolean; banner: boolean };
  pageWidth: number;
}

const UserBanner: React.FC<Props> = ({
  loggedInUser,
  editLogo,
  isEditing,
  pageWidth,
  setEditLogo,
  handleBannerColor,
  handleBannerEdit,
}) => {
  return (
    <div
      className={`${
        editLogo.banner ? `${loggedInUser.banner} ` : `${loggedInUser.banner} `
      } flex w-full cursor-pointer ${
        pageWidth > 640 ? "" : "flex-col rounded-b-lg"
      }`}
      onMouseEnter={() => {
        setEditLogo((prevState) => ({
          ...prevState,
          banner: true,
        }));
      }}
      onMouseLeave={() => {
        setEditLogo((prevState) => ({
          ...prevState,
          banner: false,
        }));
      }}
      onClick={handleBannerEdit}
    >
      {isEditing.banner && (
        <BannerSelector
          handleBannerColor={handleBannerColor}
          isActive={isEditing.banner}
        />
      )}

      <p
        className={`${
          pageWidth > 640 ? "ml-10 mt-10" : "p-2 w-64"
        } text-white drop-shadow`}
      >
        LVL: {loggedInUser.lvl}
      </p>
      <p
        className={`${
          pageWidth > 640 ? "ml-10 mt-10" : "p-2 w-64"
        } text-white drop-shadow`}
      >
        Today's Tasks: {loggedInUser.taskToday.length || 0}
      </p>
    </div>
  );
};

export default UserBanner;
