import React, { useEffect, useState } from "react";
import { FriendshipProp } from "../../Tools/types";
import { FaCheck } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import socket from "../../Tools/socket";
//Átadott értékek típusai

interface Props {
  friendships: FriendshipProp[];
  setFriendshipsData: React.Dispatch<
    React.SetStateAction<FriendshipProp[] | null>
  >;
  loggedInUserId: string;
}

const FriendRequest: React.FC<Props> = ({
  friendships, //barátok
  setFriendshipsData, //barátok beállítása
  loggedInUserId,
}) => {
  //Lenyíló lista állapota barátfelkérésekhez
  const [dropdown, setDropdown] = useState<boolean>(false);

  console.log(friendships);

  //Websocket kezelése useEffect-tel
  useEffect(() => {
    // Handle incoming friend request
    const onReceiveRequest = (newRequest: FriendshipProp) => {
      console.log(newRequest);
      setFriendshipsData((prev) => [...(prev || []), newRequest]);
    };

    // Handle friend request cancellation
    const onUnsentRequest = (deleteData: FriendshipProp) => {
      console.log(deleteData);
      setFriendshipsData((prev) =>
        (prev || []).filter((f) => f._id !== deleteData._id)
      );
    };

    // Handle response to friend request
    const onAnswer = (updatedFriendship: FriendshipProp) => {
      if (updatedFriendship.status === "refused") {
        return onUnsentRequest(updatedFriendship);
      }
      setFriendshipsData((prev) =>
        (prev || []).map((f) =>
          f._id === updatedFriendship._id ? updatedFriendship : f
        )
      );
    };

    // Listen to WebSocket events
    socket.on("receive_friendRequest", onReceiveRequest);
    socket.on("receive_unsent_friendRequest", onUnsentRequest);
    socket.on("receive_friendRequest_answer", onAnswer);

    // Cleanup WebSocket listeners on unmount
    return () => {
      socket.off("receive_friendRequest", onReceiveRequest);
      socket.off("receive_unsent_friendRequest", onUnsentRequest);
      socket.off("receive_friendRequest_answer", onAnswer);
    };
  }, [setFriendshipsData]);

  //Barátfelkérés kezelése
  const handleFriendRequest = async (
    id: string,
    status: string,
    senderId: FriendshipProp["otherUser"],
    receiverId: FriendshipProp["currentUser"]
  ) => {
    //barátfelkérés socket hallgatása
    socket.emit("answer_friendRequest", { id, status, senderId, receiverId });
  };
  //JSX megjelenítése
  return (
    <div className="mb-10 w-full">
      {friendships && friendships.find((c) => c.status == "pending") ? ( //függőben lévő felkérés esetén megjelenítés
        <>
          <button
            className="p-2 bg-white rounded-md border"
            onClick={() => setDropdown(!dropdown)}
          >
            Pending Requests
          </button>
          {dropdown && ( // gombnyomás hatására felkérések listázása
            <div className="my-2 p-2 rounded-lg space-y-2 bg-white">
              {friendships.map(
                (friendship, index) =>
                  friendship.status === "pending" ? (
                    <div
                      key={index}
                      className={`grid grid-cols-[auto_auto_1fr] md:grid-cols-3 space-x-2 items-center w-fit`}
                    >
                      <div className="flex items-center w-52">
                        <img
                          src={`/img/pfps/${friendship.otherUser.avatar}`}
                          className="w-10 h-10 mr-2 rounded-md"
                        />
                        <p>{friendship.otherUser.username}</p>
                      </div>

                      <p className="w-20">{`LVL: ${friendship.otherUser.lvl}`}</p>
                      <div className="space-x-2 flex">
                        {friendship.senderId === loggedInUserId ? null : (
                          <FaCheck
                            className="w-8 h-8 border border-green-500 p-1 rounded-md bg-green-300 
                      hover:bg-green-400 text-white active:translate-y-1 active:bg-green-800 transition"
                            onClick={() =>
                              handleFriendRequest(
                                // felkérés elfogadása
                                friendship._id,
                                "accepted",
                                friendship.otherUser,
                                friendship.currentUser
                              )
                            }
                          />
                        )}

                        <FaX
                          className="w-8 h-8 border border-red-500 p-1 rounded-md bg-red-300 
                      hover:bg-red-400 text-white active:translate-y-1 active:bg-red-800 transition"
                          onClick={() =>
                            handleFriendRequest(
                              //elkérés elutasítása
                              friendship._id,
                              "refused",
                              friendship.otherUser,
                              friendship.currentUser
                            )
                          }
                        />
                      </div>
                    </div>
                  ) : null //ha nincs felkérés, tűnjön el a lista
              )}
            </div>
          )}
        </>
      ) : (
        <div>No pending requests</div>
      )}
    </div>
  );
};

export default FriendRequest;
