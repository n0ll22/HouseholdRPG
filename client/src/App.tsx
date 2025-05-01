import axios from "axios";
import { Outlet } from "react-router-dom";
import AsideDetector from "./Components/Navigation/AsideDetector/AsideDetector";
import Social from "./Components/Social/Social";
import socket from "./Tools/socket";
import { useEffect, useRef, useState } from "react";
import { UserProp } from "./Tools/types";
import { UserContext } from "./Components/Auth/AuthContext/UserContext";
import {
  NotificationProvider,
  useNotification,
} from "./Components/Notification/Notification";
import { Api } from "./Tools/QueryFunctions";

//import { generatelevels } from "./level_generator";

axios.defaults.withCredentials = true;

//Az értesítés rendszer miatt szükséges külön funtiont létrehozni
function AppContent({ loggedInUser }: { loggedInUser: UserProp | null }) {
  const { notify } = useNotification();
  const notifiedMessageIds = useRef<string[]>([]);

  //új értesítés kezelése új üzenet érkezésekor
  useEffect(() => {
    if (loggedInUser?._id) {
      const handleNewMessage = (populatedMessage: any) => {
        if (notifiedMessageIds.current.includes(populatedMessage._id)) return;

        notifiedMessageIds.current.push(populatedMessage._id);
        if (populatedMessage.senderId._id !== loggedInUser._id)
          notify(
            `${populatedMessage.senderId.username}: ${populatedMessage.content}`,
            `/profile/chat/${populatedMessage.chatId}`
          );

        // Értsítések megjelenítésének megakadályozása
        if (notifiedMessageIds.current.length > 100) {
          notifiedMessageIds.current = notifiedMessageIds.current.slice(-50);
        }
      };

      socket.on("newMessage", handleNewMessage);

      return () => {
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [loggedInUser]);

  return (
    <div
      className={`${
        loggedInUser?._id ? "grid grid-cols-6 xl:block" : "flex w-full"
      }`}
    >
      {loggedInUser?._id && (
        <div className="col-span-1">
          <AsideDetector />
        </div>
      )}
      <div
        className={`${loggedInUser?._id ? "col-span-5" : "w-full"} xl:block`}
      >
        {loggedInUser?._id && <Social />}
        <Outlet />
      </div>
    </div>
  );
}

//React Komponens

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState<UserProp | null>(null);
  //generatelevels();

  //bejelentkezett felhasználó lekérése
  useEffect(() => {
    Api().getLoggedInUser(setLoggedInUser);
  }, []);

  //fehasználó regisztrálása a socket-re
  useEffect(() => {
    if (loggedInUser?._id) {
      socket.emit("register_user", loggedInUser._id);
    }
  }, [loggedInUser?._id]);
  //Összes provider beágyazása
  return (
    <NotificationProvider>
      <UserContext.Provider value={loggedInUser}>
        <AppContent loggedInUser={loggedInUser} />
      </UserContext.Provider>
    </NotificationProvider>
  );
}
