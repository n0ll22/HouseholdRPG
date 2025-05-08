import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { MessageProp, UserProp } from "./Tools/types";
import { UserContext } from "./Components/Auth/AuthContext/UserContext";
import { Api } from "./Tools/QueryFunctions";
import socket from "./Tools/socket";
import AsideDetector from "./Components/Navigation/AsideDetector/AsideDetector";
import Social from "./Components/Social/Social";
import { Outlet } from "react-router-dom";
import {
  NotificationProvider,
  useNotification,
} from "./Components/Notification/Notification";

/* Ez a komponens a program fő komponense.
 */

axios.defaults.withCredentials = true;

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState<UserProp | null>(null);

  // Bejelentkezett felhasználó lekérése
  useEffect(() => {
    Api().getLoggedInUser(setLoggedInUser);
  }, []);

  // Bejelentkezett felhasználó regisztálása a socket-re
  useEffect(() => {
    if (loggedInUser?._id) {
      socket.emit("register_user", loggedInUser._id);
    }
  }, [loggedInUser?._id]);
  //JSX megjelenítése, Összes provider implementálása
  return (
    <UserContext.Provider value={loggedInUser}>
      <NotificationProvider>
        <NotificationHandler loggedInUser={loggedInUser} />
        <div
          data-testid="main_test"
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
            className={`${
              loggedInUser?._id ? "col-span-5" : "w-full"
            } xl:block`}
          >
            {loggedInUser?._id && <Social />}
            <Outlet />
          </div>
        </div>
      </NotificationProvider>
    </UserContext.Provider>
  );
}
//Külön kezelés az értesítéseknek, hogy lehessen inicializálni
function NotificationHandler({
  loggedInUser,
}: {
  loggedInUser: UserProp | null;
}) {
  //Értesítés hook meghívása
  const { notify } = useNotification();
  const notifiedMessageIds = useRef<string[]>([]);

  // Új üzenet kezelése
  useEffect(() => {
    //Új adatok lekérése a socket-től
    if (loggedInUser?._id) {
      const handleNewMessage = (populatedMessage: MessageProp) => {
        if (notifiedMessageIds.current.includes(populatedMessage._id)) return;
        //Új üzenet id-ja
        notifiedMessageIds.current.push(populatedMessage._id);

        // Értesítés küldése
        notify(
          `New message from ${populatedMessage.senderId.username}`,
          `/profile/chat/${populatedMessage.chatId}`
        );

        // Üzenetek tárolásának korlátozása
        if (notifiedMessageIds.current.length > 100) {
          notifiedMessageIds.current = notifiedMessageIds.current.slice(-50);
        }
      };
      //új üzenetek észlelése
      socket.on("newMessage", handleNewMessage);

      return () => {
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [loggedInUser, notify]);

  return null;
}
