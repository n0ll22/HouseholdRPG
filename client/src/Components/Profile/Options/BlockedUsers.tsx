import React from "react";
import { FriendshipProp } from "../../../Tools/types";
import { FaTrash } from "react-icons/fa";

// Ez a react komponens megjeleníti a blokkolt felhasználókat

// ----- Átadott változók típusa -----

interface Props {
  blockedUsers: FriendshipProp[];
  loggedInUserId: string;
  handleUnblockUser: (id: string, otherUserId: string) => void;
}

// ----- React komponens  -----

const BlockedUsers: React.FC<Props> = ({
  blockedUsers, // letiltott felhasználók
  loggedInUserId, // aktuális felhasználó id-je
  handleUnblockUser, // letiltott felhasználó feloldásának kezelése
}) => {
  //JSX megjelenítése
  return (
    <div className="py-10">
      <h2 className="text-2xl font-bold border-l-4 pl-2 mb-5">Blocked Users</h2>
      <div className="space-y-2">
        {/* Blokkolt felhasználók listázása */}
        {blockedUsers.length > 0 ? (
          blockedUsers
            .filter((f) => f.blockedBy === loggedInUserId) // csak olyan blokkolt felhasználók, akiket a felhasználó blokkolt
            .map((f) => (
              <div className="flex items-center">
                <img
                  className="w-10 h-10 rounded-md mr-2"
                  src={`public/img/pfps/${f.otherUser.avatar}`}
                  alt=""
                />
                <p className="w-64">{f.otherUser.username}</p>
                <FaTrash
                  onClick={() => handleUnblockUser(f._id, f.otherUser._id)} //blokkolás feloldás kezeléses
                  className="border-l w-10 h-5"
                />
              </div>
            ))
        ) : (
          <div>No blocked users</div>
        )}
      </div>
    </div>
  );
};

export default BlockedUsers;
