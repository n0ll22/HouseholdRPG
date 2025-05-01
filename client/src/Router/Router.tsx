import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
import TaskTutorial from "../Components/TaskManager/TaskTutorial";
import Options from "../Components/Profile/Options/Options";
import RestoreAccount from "../Components/Auth/Restore/RestoreAccount";
import RestorePassword from "../Components/Auth/Restore/RestorePassword";
import ResetPassword from "../Components/Auth/ResetPassword/ResetPassword";
import ReactivateAccount from "../Components/Auth/ReactivateAccount/ReactivateAccount";

//Ez a komponens felelős a böngésző ótvonalkezelésért
//Itt található milyen útvonalokon lehet navigálni az böngészőn belül

const Router: React.FC = () => {
  //Bejelentkezés állapota
  const auth = useContext(AuthContext);

  if (!auth) {
    return <p>Error: AuthContext not available</p>;
  }

  const { loggedIn, loading } = auth;

  if (loading) {
    return <p>Loading...</p>;
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      errorElement: <h1>Page Not Found</h1>,
      children: loggedIn //Ha be van jelentkezve, akkor ezek a route-ok legyenek elérhetők
        ? [
            { index: true, element: <MainPage /> },
            { path: "taskComplete", element: <TaskCounterPage /> },
            {
              path: "taskManager",
              element: <TaskManagerPage />,
              children: [
                { path: "list", element: <ListTask /> },
                {
                  path: "list/tutorial/:id",
                  element: <TaskTutorial />,
                },
                { path: "edit", element: <EditTask /> },
                {
                  path: "edit/:id",
                  element: <EditTaskDetail />,
                },
                { path: "add", element: <AddTask /> },
              ],
            },
            {
              path: "users",
              element: <UsersPage />,
              children: [
                { path: "list", element: <UserList /> },
                { path: ":id", element: <UserProfile /> },
              ],
            },
            {
              path: "profile",
              element: <ProfilePage />,
              children: [
                { path: "info", element: <Profile /> },
                { path: "comrades", element: <FriendList /> },
                {
                  path: "chat/:id?",
                  element: <Chat />,
                },
                { path: "options", element: <Options /> },
              ],
            },
          ]
        : [
            //Ellenkező esetben legyenek ezek elérhetőek:
            { index: true, path: "/", element: <Login /> },
            { path: "register", element: <Register /> },
            { path: "restoreAccount", element: <RestoreAccount /> },
            { path: "restorePassword", element: <RestorePassword /> },
            { path: "reset-password/:token", element: <ResetPassword /> },
            {
              path: "reactivate-account/:token",
              element: <ReactivateAccount />,
            },
          ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
