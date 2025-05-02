import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Auth/AuthContext/useAuth";
import { useUser } from "../../Auth/AuthContext/UserContext";
import { Api } from "../../../Tools/QueryFunctions";

interface Props {
  setInteracted: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<Props> = ({ setInteracted }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUser();
  const { loggedIn, getLoggedIn } = useAuth();
  getLoggedIn();

  const handleLogout = async () => {
    if (user) {
      await Api().getLogout(user._id);

      getLoggedIn();
      navigate("/");

      window.location.reload();
    }
  };

  return (
    <aside className="self-start h-screen sticky top-0 col-span-1 xl:col-span-2 border-r shadow-lg">
      <div className="w-full flex flex-col justify-center items-center">
        <div
          className="w-40 h-28 grid place-items-center text-center"
          style={{
            backgroundImage: "url('/img/flag-logo.png')",
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <h1 className="text-2xl font-bold text-gray-100">Household</h1>
          <h1 className="text-5xl font-bold text-red-500">D&D</h1>
        </div>
      </div>

      <h2 className="py-4 text-2xl text-center font-semibold mb-10">
        Welcome <span>{user?.username}!</span>
      </h2>

      {loggedIn && (
        <>
          <Link reloadDocument to="/">
            <h3
              className={`text-lg px-4 py-2 hover:bg-gray-200 transition ${
                location.pathname === "/" ? "font-bold" : ""
              }`}
              onClick={() => setInteracted(true)}
            >
              Home
            </h3>
          </Link>

          <Link reloadDocument to="/taskComplete">
            <h3
              className={`text-lg px-4 py-2 hover:bg-gray-200 transition ${
                location.pathname === "/taskComplete" ? "font-bold" : ""
              }`}
              onClick={() => setInteracted(true)}
            >
              Complete Task
            </h3>
          </Link>
          {user?.isAdmin && user ? (
            <Link to="/taskManager/list">
              <h3
                className={`text-lg px-4 py-2 hover:bg-gray-200 transition ${
                  location.pathname.includes("taskManager") ? "font-bold" : ""
                }`}
                onClick={() => setInteracted(true)}
              >
                Task Manager
              </h3>
            </Link>
          ) : (
            <Link to="/taskManager/list">
              <h3
                className={`text-lg px-4 py-2 hover:bg-gray-200 transition ${
                  location.pathname.includes("taskManager") ? "font-bold" : ""
                }`}
                onClick={() => setInteracted(true)}
              >
                All Tasks
              </h3>
            </Link>
          )}
          <Link to="/users/list">
            <h3
              className={`text-lg px-4 py-2 hover:bg-gray-200 transition ${
                location.pathname.includes("users") ? "font-bold" : ""
              }`}
              onClick={() => setInteracted(true)}
            >
              Users
            </h3>
          </Link>

          <Link to="/profile/info">
            <h3
              className={`text-lg px-4 py-2 hover:bg-gray-200 transition ${
                location.pathname.includes("profile") ? "font-bold" : ""
              }`}
              onClick={() => setInteracted(true)}
            >
              Profile
            </h3>
          </Link>

          <Link to="/profile/chat">
            <h3
              className={`text-lg px-4 py-2 hover:bg-gray-200 transition ${
                location.pathname.includes("profile") ? "font-bold" : ""
              }`}
              onClick={() => setInteracted(true)}
            >
              Chat
            </h3>
          </Link>
          <div className="absolute -z-10 top-0 left-0 h-screen w-full flex items-end justify-center">
            <p
              onClick={handleLogout}
              className={`text-gray-600 hover:bg-black hover:text-gray-100 hover:border-white cursor-pointer -translate-y-12 transition border border-gray-400 rounded-lg p-2 `}
            >
              Logout
            </p>
          </div>
        </>
      )}
      {!loggedIn && (
        <div className="w-full flex flex-col items-center mt-10">
          <div>You're not logged in!</div>
          <Link to="/" className="">
            <div
              className={` text-center border my-2 rounded-xl w-fit p-1 hover:bg-gray-200 transition ${
                location.pathname === "/login" ? "font-bold text-gray-600" : ""
              }`}
            >
              Login
            </div>
          </Link>
          <div>or</div>
          <Link to="/register" className="">
            <div
              className={` text-center border my-2 rounded-xl w-fit p-1 hover:bg-gray-200 transition ${
                location.pathname === "/register"
                  ? "font-bold text-gray-600"
                  : ""
              }`}
            >
              Sign Up
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
