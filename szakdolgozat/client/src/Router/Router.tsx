import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import React, { useContext } from "react";
import App from "../App";
import AuthContext from "../Components/Auth/AuthContext/AuthContext";
import MainPage from "../Pages/MainPage/MainPage";
import Login from "../Components/Auth/Login/Login";
import TaskCounterPage from "../Pages/TaskCounterPage/TaskCounterPage";
import TaskManagerPage from "../Pages/TaskManagerPage/TaskManagerPage";
import EditTask from "../Components/TaskManager/EditTask/EditTask";
import ListTask from "../Components/TaskManager/ListTask/ListTask";
import AddTask from "../Components/TaskManager/AddTask/AddTask";
import EditTaskDetail from "../Components/TaskManager/EditTaskDetail/EditTaskDetail";
import UsersPage from "../Pages/UsersPage/UsersPage";
import ProfilePage from "../Pages/ProfilePage/ProfilePage";
import Profile from "../Components/Profile/Profile/Profile";
import Register from "../Components/Auth/Register/Register";
import UserList from "../Components/Users/UserList";
import FriendList from "../Components/Users/FriendList";
import Chat from "../Components/Chat/Chat";
import UserProfile from "../Components/Profile/Profile/UserProfile";
import TaskTutorial from "../Components/TaskManager/ListTask/TaskTutorial";
import Options from "../Components/Profile/Options/Options";
import RestoreAccount from "../Components/Auth/Restore/RestoreAccount";
import RestorePassword from "../Components/Auth/Restore/RestorePassword";
import ResetPassword from "../Components/Auth/ResetPassword/ResetPassword";
import ReactivateAccount from "../Components/Auth/ReactivateAccount/ReactivateAccount";
import useCookieConsent from "../Hooks/useCookieConsent";
import CookiePolicy from "../Components/Auth/CookiePoilcy/CookiePolicy";
// A Router komponens a böngésző útvonalkezeléséért felelős.
// Itt található, hogy milyen útvonalakon lehet navigálni az alkalmazásban.

const Router: React.FC = () => {
  // Az AuthContext és a Cookie Consent hook használata
  const auth = useContext(AuthContext); // Az autentikációs állapot lekérése a kontextusból
  const { consent, accept } = useCookieConsent(); // Cookie beleegyezés kezelése

  if (!auth) return <p>Error: AuthContext not available</p>; // Ha nincs AuthContext, hibaüzenet
  const { loggedIn, loading } = auth; // Kivesszük az autentikációs adatokat: bejelentkezve van-e és töltődik-e

  if (loading) return <p>Loading...</p>; // Ha az autentikációs adatokat töltjük, mutatjuk a betöltés üzenetet
  if (consent === null) return <p>Loading...</p>; // Ha a cookie beleegyezés még nem töltődött be, akkor is betöltés üzenet

  const router = createBrowserRouter([
    // A böngésző router konfigurálása
    {
      path: "/", // Az alapértelmezett útvonal
      element: (
        <>
          {/* Cookie banner jelenik meg, ha nincs beleegyezés és nem a cookie oldalon vagyunk */}
          {!consent && !window.location.href.includes("cookie") && (
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-4 z-50">
              <p className="mb-2">
                This site uses cookies, and you can't continue without it. You
                can learn more about how we use cookies by reading our Cookie
                Policy.
              </p>
              <div className="flex justify-between items-center">
                <Link
                  reloadDocument
                  to="/cookie"
                  className="text-blue-600 underline"
                >
                  View our Cookie Policy
                </Link>
                <button
                  onClick={accept} // Ha rákattintunk az "Accept" gombra, elfogadjuk a cookie használatát
                  className="ml-4 bg-white text-black border-2 border-black px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Accept
                </button>
              </div>
            </div>
          )}

          {/* Fő alkalmazás tartalom, amely el lesz homályosítva, ha nincs beleegyezés */}
          <div
            className={`transition duration-300 ${
              !consent && !window.location.href.includes("cookie")
                ? "blur-sm pointer-events-none select-none"
                : ""
            }`}
          >
            <App /> {/* Az alap alkalmazás komponens */}
          </div>
        </>
      ),
      errorElement: <h1>Page Not Found</h1>, // Hibaoldal, ha nincs illeszkedő útvonal
      children:
        loggedIn && consent // Ha be van jelentkezve és van cookie beleegyezés
          ? [
              { index: true, element: <MainPage /> }, // Alapértelmezett kezdőoldal
              { path: "cookie", element: <CookiePolicy /> }, // Cookie szabályzat oldal
              { path: "taskComplete", element: <TaskCounterPage /> }, // Feladatok számláló oldal
              {
                path: "taskManager", // Feladatkezelő oldal
                element: <TaskManagerPage />,
                children: [
                  { path: "list", element: <ListTask /> }, // Feladatlista
                  { path: "list/tutorial/:id", element: <TaskTutorial /> }, // Feladat tutorial
                  { path: "edit", element: <EditTask /> }, // Feladat szerkesztése
                  { path: "edit/:id", element: <EditTaskDetail /> }, // Feladat szerkesztésének részletei
                  { path: "add", element: <AddTask /> }, // Új feladat hozzáadása
                ],
              },
              {
                path: "users", // Felhasználók oldala
                element: <UsersPage />,
                children: [
                  { path: "list", element: <UserList /> }, // Felhasználók listája
                  { path: ":id", element: <UserProfile /> }, // Felhasználói profil megtekintése
                ],
              },
              {
                path: "profile", // Profil oldal
                element: <ProfilePage />,
                children: [
                  { path: "info", element: <Profile /> }, // Profil információk
                  { path: "comrades", element: <FriendList /> }, // Barátok listája
                  { path: "chat/:id?", element: <Chat /> }, // Csevegés
                  { path: "options", element: <Options /> }, // Beállítások
                ],
              },
            ]
          : [
              { index: true, path: "/", element: <Login /> }, // Bejelentkezés oldal, ha nincs bejelentkezve
              { path: "register", element: <Register /> }, // Regisztráció oldal
              { path: "cookie", element: <CookiePolicy /> }, // Cookie szabályzat oldal
            ],
    },
    { path: "restoreAccount", element: <RestoreAccount /> }, // Fiók visszaállítása
    { path: "restorePassword", element: <RestorePassword /> }, // Jelszó visszaállítása
    { path: "reset-password/:token", element: <ResetPassword /> }, // Jelszó visszaállító token
    {
      path: "reactivate-account/:token", // Fiók újraaktiválása
      element: <ReactivateAccount />,
    },
  ]);

  return <RouterProvider router={router} />; // Az útvonalak beállítása és biztosítása a RouterProvider-rel
};

export default Router; // A komponens exportálása
