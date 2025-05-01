import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import LoadingSpinner from "../../Components/LoadingSpinner/LoadingSpinner";
import { QueryProps, UserProp } from "../../Tools/types";
import socket from "../../Tools/socket";
import { useUser } from "../../Components/Auth/AuthContext/UserContext";
import { Api } from "../../Tools/QueryFunctions";

/*  
    Ez a react komponens felel az összes létező felhasználó megjelenítésének főkomponensének
    Itt hajtódik végre az adatok lekérése az adatbázisból
*/

const UsersPage: React.FC = () => {
  //  Aktuális bejelentkezett felhasználó
  const loggedInUser = useUser();

  //  Query objektum kereséshez
  const [queries, setQueries] = useState<QueryProps>({
    search: "",
    searchOn: "username",
    sortBy: "username",
    order: "asc",
    page: 1,
    limit: 10,
  });

  const [pageWidth, setPageWidth] = useState<number>(window.innerWidth);

  //  Felhasználói adatok állapota
  const [userData, setUserData] = useState<UserProp[] | null>(null);

  //  Felhasználói üzenet állapot objektuma
  const [message, setMessage] = useState<{
    error: string;
    message: string;
  }>({ error: "", message: "" });

  //  Felhasználók lekérése és online/offline státusz beállítása
  useEffect(() => {
    Api().getUsers(setUserData, setMessage, queries);

    socket.on("receive_status", () => {
      // setUserData(user)
    });
  }, [queries]); //Keresés esetén frissüljön

  useEffect(() => {
    window.addEventListener("resize", () => setPageWidth(window.innerWidth));

    return () => {
      window.removeEventListener("resize", () =>
        setPageWidth(window.innerWidth)
      );
    };
  });
  console.log(pageWidth);

  //JSX megjelenítés
  return (
    <>
      {userData ? ( //Adatok átadás a kontextusnak
        <Outlet
          context={{
            userData: userData,
            loggedInUser,
            queries,
            setQueries,
            pageWidth,
          }}
        />
      ) : (
        <div className="w-full h-screen flex items-center justify-center">
          <LoadingSpinner loading={!userData} />
        </div>
      )}
      {message?.error && <div>Error {message.error}</div>}
    </>
  );
};

export default UsersPage;
