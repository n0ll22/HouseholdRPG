import React, { useEffect } from "react";
import { FriendshipProp, QueryProps, UserProp } from "../../Tools/types.ts";
import { useNavigate, useOutletContext } from "react-router-dom";
import FriendRequest from "./FriendRequest.tsx";
import { SetQuery } from "../../QueryFunctions.tsx";
import socket from "../socket.ts";
import { FaTrash } from "react-icons/fa";
import { ImBlocked } from "react-icons/im";
import { useNotification } from "../Notification/Notification.tsx";

//Ez a react komponens a barátok listájának megjelenítéséért felelős
//Van lehetőség itt meglévő barátokat törölni, és blokkolni

//React komponens
const FriendList: React.FC = () => {
  //Kontextusból való adatátvétel
  const {
    friendships,
    setFriendshipsData,
    queries,
    setQueries,
    loggedInUser,
    pageWidth,
  } = useOutletContext<{
    queries: QueryProps; //keresés query
    setQueries: React.Dispatch<React.SetStateAction<QueryProps>>; // query beállítása
    friendships: FriendshipProp[]; // barátságok
    setFriendshipsData: React.Dispatch<
      //barátságok beállítása
      React.SetStateAction<FriendshipProp[] | null>
    >;
    loggedInUser: UserProp; // bejelentkezett aktuális felhasználó
    pageWidth: number;
  }>();
  //Értesítés hook
  const { notify } = useNotification();
  //navigációért felelős hook
  const navigate = useNavigate();

  //barát törlésének kezelése
  const handleDeleteFriend = (
    friendshipId: string,
    otherUser: FriendshipProp["otherUser"]
  ) => {
    socket.emit("answer_friendRequest", {
      id: friendshipId,
      status: "refused",
      senderId: otherUser,
      receiverId: loggedInUser,
    });
    notify("Friend deleted", null);
  };
  //barát blokkolásának lehetősége
  const handleBlockFriend = (
    friendshipId: string,
    otherUser: FriendshipProp["otherUser"]
  ) => {
    socket.emit("answer_friendRequest", {
      id: friendshipId,
      status: "blocked",
      senderId: otherUser,
      receiverId: loggedInUser,
    });
    notify("Friend Blocked", null);
  };

  //Websocket kezelése
  //barátkérések beérkezése és visszaküldése
  useEffect(() => {
    socket.on("receive_friendRequest_answer", (res) => {
      console.log(res);
    });

    return () => {
      socket.off("receive_friendRequestAnswer");
    };
  }, []);

  useEffect(() => {
    // Figyelje a socketet az online státusz változásáért
    socket.on("receive_status", (userStatus) => {
      console.log("User status updated:", userStatus);

      // Felhasználó online / offline állapotának beállítása
      setFriendshipsData((prevState) => {
        if (!prevState) return []; // Tartalom ellenőrzése
        // Új adat előűllítása
        const updatedData = prevState.map((friendship) => {
          if (friendship.otherUser._id === userStatus._id) {
            return {
              ...friendship,
              otherUser: {
                ...friendship.otherUser,
                status: userStatus.status, //Legyen az új státusz megadva
              },
            };
          }
          return friendship;
        });

        return updatedData; // Adjuk vissza a beállítási értéket
      });
    });

    // socket cleanup
    return () => {
      socket.off("receive_status");
    };
  }, [setFriendshipsData]);

  //JSX megjelenítése
  return (
    <main className="flex flex-col w-full items-start p-10 animate-fadeInFast">
      <h1 className="border-l-4 pl-2 py-2 font-bold text-5xl mb-10">
        Hall of Fame
      </h1>
      {friendships && ( // oldal megjelenítése, ha betöltött az adat
        <>
          {/* barátfelkérések */}
          <FriendRequest
            loggedInUserId={loggedInUser._id}
            setFriendshipsData={setFriendshipsData}
            friendships={friendships}
          />
          {/* keresés barátok közt */}
          <div
            className={`flex items-center justify-end  mb-4  ${
              pageWidth > 640 ? "space-x-4 w-full" : " flex-col w-full"
            }`}
          >
            <div className="w-full flex justify-center">
              <input
                className="p-2 w-full rounded-md border"
                type="text"
                id="search-username"
                name="search-username"
                placeholder="Search by username"
                value={queries.search}
                onChange={(e) =>
                  SetQuery(setQueries).handleQuerySearchChange(e)
                }
              />
            </div>
            {/* rendezés kiválasztása */}
            <select
              className="w-full p-2 border rounded"
              value={queries.sortBy}
              onChange={(e) => SetQuery(setQueries).handleQuerySortByChange(e)}
              name="user-sort"
            >
              <option value="username">Username</option>
              <option value="lvl">Level</option>
            </select>

            <select
              className="w-full p-2 border rounded"
              value={queries.order}
              onChange={(e) => SetQuery(setQueries).handleQueryOrderChange(e)}
              name="user-order"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            {/* oldalonkénti mennyiség */}
            <select
              className="w-full p-2 border rounded"
              value={queries.limit}
              onChange={(e) => SetQuery(setQueries).handleQueryLimitChange(e)}
              name="user-limit"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          {/* barátok táblázata */}
          <div className="w-full p-2 bg-white rounded-lg">
            <table className="table-auto w-full border-gray-300 shadow-lg rounded-lg">
              <thead className="border-b text-left">
                <tr className="">
                  <th
                    className={`${pageWidth > 640 ? "px-4 py-2" : "p-1"}`}
                  ></th>
                  <th className={`${pageWidth > 640 ? "px-4 py-2" : "p-1"}`}>
                    Username
                  </th>
                  {pageWidth > 640 && <th className="w-16 px-4 py-2">Level</th>}
                  <th
                    className={`${
                      pageWidth > 640 ? "w-16 px-4 py-2" : "w-10 p-1"
                    }`}
                  >
                    Options
                  </th>
                </tr>
              </thead>
              <tbody className="rounded-b-lg">
                {friendships //Barátok listázása táblába
                  .filter((f) => f.status === "accepted")
                  .map((c: FriendshipProp, index) => (
                    <tr key={index} className="hover:bg-gray-200/50 rounded-md">
                      <td
                        className={`${pageWidth > 640 ? "px-4 py-2" : "p-1"}`}
                      >
                        <div
                          className={`bg-center bg-cover  rounded-md ${
                            pageWidth > 640 ? "w-16 h-16" : "w-10 h-10"
                          }`}
                          style={{
                            backgroundImage: `url(/img/pfps/${c.otherUser.avatar})`,
                          }}
                        >
                          <div className="flex h-full w-full flex-row-reverse items-end">
                            <div
                              className={` ${
                                pageWidth > 640 ? "w-4 h-4" : "w-2 h-2"
                              } translate-x-1 translate-y-1 rounded-full ${
                                c.otherUser.status === "online"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={`${
                          pageWidth > 640 ? "px-4 py-2" : "p-1"
                        } font-medium`}
                        onClick={() => {
                          navigate("/users/" + c.otherUser._id); //kattintásra navigálás a barát oldalára
                        }}
                      >
                        {c.otherUser.username}
                      </td>
                      {pageWidth > 640 && (
                        <td
                          className={`${
                            pageWidth > 640 ? "px-4 py-2" : "p-1"
                          } text-center`}
                        >
                          {c.otherUser.lvl}
                        </td>
                      )}
                      <td className="h-20 w-full flex items-center justify-around">
                        <button></button>
                        <FaTrash
                          onClick={() => handleDeleteFriend(c._id, c.otherUser)} //barát törlésének kezelése
                        />
                        <ImBlocked
                          onClick={() => handleBlockFriend(c._id, c.otherUser)} //barát blokkolásának kezelése
                        />
                      </td>
                    </tr>
                  ))}
                {friendships.length === 0 && ( // ha a lista üres, akkor nincsenek barátok
                  <tr>
                    <td></td>
                    <td>You have no comrades</td>
                    <td></td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination beállítások */}
          <div className="flex w-full justify-center items-center my-4 space-x-4">
            <button
              className="p-2 border rounded bg-white cursor-pointer"
              onClick={() =>
                SetQuery(setQueries)
                  .handlePaginationChange()
                  .handlePerviousPage()
              }
              disabled={queries.page === 1}
            >
              Prev
            </button>
            <span>{queries.page}</span>
            <button
              className="p-2 border rounded bg-white cursor-pointer"
              onClick={() =>
                SetQuery(setQueries).handlePaginationChange().handlePerviousPage
              }
              disabled={
                queries.page === Math.ceil(friendships.length / queries.limit)
              }
            >
              Next
            </button>
          </div>
          <p>Total Users: {friendships?.length}</p>
        </>
      )}
    </main>
  );
};

export default FriendList;
