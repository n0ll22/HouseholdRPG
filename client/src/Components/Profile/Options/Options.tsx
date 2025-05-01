import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FriendshipProp } from "../../../Tools/types"; // Típusok
import { useAuth } from "../../Auth/AuthContext/useAuth"; //Bejelentkezett felhasználó hitelesítés
import BlockedUsers from "./BlockedUsers"; //Letiltott felhasználók komponens
import ChangeEmail from "./ChangeEmail"; //Email megváltoztatás komponens
import ChangePassword from "./ChangePassword"; // Jelszó megváltoztatás komponens
import { Api } from "../../../QueryFunctions"; //API hívások
import socket from "../../socket"; //Websocket
import { useUser } from "../../Auth/AuthContext/UserContext"; //
import { useNotification } from "../../Notification/Notification";

// React Komponens

const Options: React.FC = (): JSX.Element => {
  //-----Állapotváltozók------
  // aktuális felhasználó
  const user = useUser();
  // bejelentkezés állapota
  const { getLoggedIn } = useAuth();
  // figyelmeztetés komponens állapot
  const [warning, setWarning] = useState<JSX.Element | null>(null);
  //letiltott felhasználók
  const [blockedUsers, setBlockedUsers] = useState<FriendshipProp[]>([]);
  //új email objektum
  const [newEmail, setNewEmail] = useState<{ input: string; render: string }>({
    input: "",
    render: "",
  });

  const { pageWidth } = useOutletContext<{ pageWidth: number }>();

  //új jelszó objektum
  const [newPassword, setNewPassword] = useState<{
    currentPassword: string;
    password: string;
    passwordAgain: string;
  }>({
    currentPassword: "",
    password: "",
    passwordAgain: "",
  });
  // Üzenet objektum a felhasználó tájékoztatására
  const [message, setMessage] = useState<{ message: string; error: string }>({
    message: "",
    error: "",
  });
  //Navigáció hook
  const nav = useNavigate();
  const { notify } = useNotification();
  // Felhasználó tiltásának feloldásának kezelése
  const handleUnblockUser = (id: string, receiverId: string) => {
    if (user) {
      socket.emit("answer_friendRequest", {
        id,
        status: "refused",
        senderId: user._id,
        receiverId,
      });
      setBlockedUsers((prev) => prev.filter((p) => p.blockedBy !== user._id));
    }
  };

  // Új jelszó beállításának kezelése
  const handleNewPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (user) {
      await Api().putPassword(user._id, newPassword, setMessage); //API PUT hívás, amely elküldi az új jelszót
    }
  };

  // Új email beállításának kezelése
  const handleNewEmail = async (e: FormEvent) => {
    e.preventDefault();

    if (user && newEmail.input) {
      await Api().putEmail(user._id, newEmail.input, setMessage, setNewEmail); //API PUT hívás, amely elküldi az új emailt
    }
  };

  // Fiók "törlés" kezelése
  const handleDeleteAccount = async () => {
    if (user) {
      await Api().deleteAccount(user._id, getLoggedIn, setMessage); //Fiók törölt állapot küldése
      nav("/");

      window.location.reload();
    }
  };

  //Figyelmeztetés JSX megjelenítés kezelése
  const handleWarining = () => {
    //görgessünk rögtön az oldal tetjére
    window.scrollTo({ top: 0, behavior: "instant" });
    document.body.style.overflow = "hidden"; // or 'scroll'

    setWarning(
      <div className="absolute top-0 left-0 w-full h-full bg-gray-900/50">
        <div className="flex w-full h-full items-center justify-center">
          <div className="bg-white text-center p-4 rounded-lg space-y-10">
            <h2 className="text-2xl font-bold">Are you sure?</h2>
            <p>Do you really wish to delete your account?</p>
            <div className="flex w-full justify-center space-x-10 text-center">
              <p
                onClick={() => {
                  handleDeleteAccount(); //Fiók törlés kezelése és görgetés alaphelyzetbe állítása
                  document.body.style.overflow = "auto";
                }} //Törlés kezelése kattintásra
                className="cursor-pointer w-12 py-1 rounded-md border border-red-500 bg-red-300 text-white font-bold"
              >
                Yes
              </p>
              <p
                onClick={() => {
                  setWarning(null); //Fiók törlése megszakítva, görgetés visszaállítása
                  document.body.style.overflow = "auto";
                }}
                className="cursor-pointer w-12 py-1 rounded-md border border-green-500 bg-green-300 text-white font-bold"
              >
                No
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  //Kezdeti adatok (blokkolt felhasználók) lekérdezése
  useEffect(() => {
    if (user) {
      Api().getBlockedUsers(user._id, setBlockedUsers);

      setNewEmail((prev) => ({ ...prev, render: user.email }));
    }
  }, [user]);

  useEffect(() => {
    if (message.error) return notify(message.error, null);
    if (message.message) return notify(message.message, null);
  }, [message]);

  //blokkolt felhasználó feloldása, websocket küldése
  useEffect(() => {
    socket.on("receive_friendRequest_answer", handleUnblockUser);

    return () => {
      socket.off("receive_friendRequest_answer");
    };
  }, []);
  // JSX megjelenítése
  return (
    <main
      className={`flex flex-col  items-start  animate-fadeInFast ${
        pageWidth > 640 ? "p-10 w-full" : "p-2 w-72"
      }`}
    >
      <h1 className="border-l-4 pl-2 py-2 font-bold text-5xl mb-10">Options</h1>

      <div className="divide-y-2">
        {/* ha van bejelentkezett felhasználó, jelenítsük meg a többi komponenst */}
        {user && (
          <div className={`${pageWidth > 640 ? "" : "w-72"}`}>
            <BlockedUsers //Blokkolt felhasználók komponense
              blockedUsers={blockedUsers}
              handleUnblockUser={handleUnblockUser}
              loggedInUserId={user._id}
            />

            <ChangeEmail // Új email komponens
              email={newEmail}
              setEmail={setNewEmail}
              handleNewEmail={handleNewEmail}
            />

            <ChangePassword // új jelszó komponens
              password={newPassword}
              setPassword={setNewPassword}
              handleNewPassword={handleNewPassword}
            />
          </div>
        )}
        <div className="py-10">
          <button
            onClick={handleWarining} // fiók törlés esetén figyelmeztetés
            className="p-2  border bg-white rounded-md hover:text-white hover:bg-red-500 transition"
          >
            Delete Account
          </button>
        </div>
      </div>
      {warning && warning}
    </main>
  );
};

export default Options;
