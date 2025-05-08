import React, { useEffect, useState } from "react";
import useGet from "../../Hooks/useGet";
import LoadingSpinner from "../../Components/LoadingSpinner/LoadingSpinner";
import {
  apiUrl,
  FriendshipProp,
  QueryProps,
  UserProp, //Típusok  importjai
} from "../../Tools/types";
import { Link, Outlet } from "react-router-dom";
import { Api } from "../../Tools/QueryFunctions";
import { useNotification } from "../../Components/Notification/Notification";

/*Ez az oldal a profil aloldal fő komponense. Ez tartja össze az összes olyan
komponenst, amely a profil megjelenítéséhez szükséges. Még itt lelhető olyan 
function, amely adatlekéréssel foglalkozik.
*/

//React komponens
const ProfilePage: React.FC = () => {
  //Keresés query állapot objektum
  const [queries, setQueries] = useState<QueryProps>({
    search: "",
    searchOn: "username",
    sortBy: "username",
    order: "asc",
    page: 1,
    limit: 10,
  });
  //Aktuális felhasználó adatlekérés
  const {
    data: loggedInUser,
    //pending: loggedInUserPending,
    //error: loggedInUserError,
  } = useGet<UserProp>(apiUrl + "/user/loggedInUser");
  //Barátságok állapotváltozója
  const [friendshipsData, setFriendshipsData] = useState<
    FriendshipProp[] | null
  >(null);
  //felhadsználó üzenet állapota
  const [message, setMessage] = useState<{
    error: string;
    message: string;
  }>({ message: "", error: "" });
  //Kiválasztott aloldal állapotváltozó
  const [selectedPage, setSelectedPage] = useState(window.location.pathname);

  const [pageWidth, setPageWidth] = useState(window.innerWidth);

  //Értesítés hook
  const { notify } = useNotification();

  //barátságok lekérése query alapján
  useEffect(() => {
    if (loggedInUser) {
      Api().getFriendshipsByIds(
        loggedInUser._id,
        loggedInUser.friendships,
        setFriendshipsData,
        setMessage,
        queries
      );
    }
  }, [loggedInUser, queries]);

  //üzenet megjeleníése értesítésként, amennyiben van
  useEffect(() => {
    if (message.message || message.error) {
      notify(message.message ? message.message : message.error, "");
    }
  }, [message]);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setPageWidth(window.innerWidth);
    });
    return () => {
      window.removeEventListener("resize", () => {
        setPageWidth(window.innerWidth);
      });
    };
  }, []);

  return (
    <>
      {/* Itt lehet navigálni az aloldalak között... */}

      <div className={`flex  w-full justify-center`}>
        <div
          className={`flex space-x-4 ${
            pageWidth > 640 ? "mt-20" : "w-72 mt-16 overflow-x-auto py-4"
          }`}
        >
          <Link to="info">
            <button
              onClick={() => setSelectedPage("info")}
              className={`w-28 p-2 rounded-md border border-black hover:bg-black hover:text-white transition ${
                selectedPage.includes("info")
                  ? "bg-black text-white"
                  : "bg-none"
              }`}
            >
              Your Info
            </button>
          </Link>
          <Link to="comrades">
            <button
              onClick={() => setSelectedPage("comrades")}
              className={`w-28 p-2 rounded-md border border-black hover:bg-black hover:text-white transition ${
                selectedPage.includes("comrades")
                  ? "bg-black text-white"
                  : "bg-none"
              }`}
            >
              Comrades
            </button>
          </Link>
          <Link to="chat">
            <button
              onClick={() => setSelectedPage("chat")}
              className={`w-28 p-2 rounded-md border border-black hover:bg-black hover:text-white transition ${
                selectedPage.includes("chat")
                  ? "bg-black text-white"
                  : "bg-none"
              }`}
            >
              Chat
            </button>
          </Link>
          <Link to="options">
            <button
              onClick={() => setSelectedPage("options")}
              className={`w-28 p-2 rounded-md border border-black hover:bg-black hover:text-white transition ${
                selectedPage.includes("options")
                  ? "bg-black text-white"
                  : "bg-none"
              }`}
            >
              Options
            </button>
          </Link>
        </div>
      </div>
      {/* Kontext átadása a többi route-nak */}
      {loggedInUser && friendshipsData ? (
        <Outlet
          context={{
            loggedInUser,
            friendships: friendshipsData,
            queries,
            setQueries,
            setFriendshipsData,
            pageWidth,
          }}
        />
      ) : null}
      {/* ha nincs még barát adat akkor betöltés */}
      {(!friendshipsData || !loggedInUser) && (
        <div className="w-full flex items-center justify-center">
          <LoadingSpinner loading={true} />
        </div>
      )}
      {/* hiba megjelenítése */}
      <div data-testid="error">{message.error}</div>
    </>
  );
};

export default ProfilePage;
