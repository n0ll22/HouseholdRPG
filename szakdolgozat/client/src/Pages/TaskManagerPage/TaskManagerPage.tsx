import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import LoadingSpinner from "../../Components/LoadingSpinner/LoadingSpinner";
import { QueryProps, TaskProp } from "../../Tools/types";
import { useUser } from "../../Components/Auth/AuthContext/UserContext";
import { Api } from "../../Tools/QueryFunctions";
import SearchAndPagination from "../../Components/SearchAndPagination/SearchAndPagintaion";

/* Ez a react komponens az admin házimunka kezelő aloldal főkomponense
 * Itt található a legtöbb API kérés, ami a házimunkák adatait kéri le.
 *
 */

const TaskManagerPage: React.FC = () => {
  //Keresés query objektum
  const [queries, setQueries] = useState<QueryProps>({
    searchOn: "title",
    search: "",
    sortBy: "title",
    order: "asc",
    page: 1,
    limit: 6,
  });

  const location = useLocation();

  const [message, setMessage] = useState<{
    message: string;
    error: string;
  }>({ message: "", error: "" });

  const [taskData, setTaskData] = useState<{
    totalTasks: number;
    totalPages: number;
    currentPage: number;
  } | null>(null);

  //Aktuális bejelentkezett felhasználó
  const loggedInUser = useUser();

  const [tasks, setTasks] = useState<TaskProp[] | null>(null);

  // Update pathname handling to ensure it works correctly
  const [pathname, setPathname] = useState<string>(location.pathname);

  useEffect(() => {
    setPathname(location.pathname);
  }, [location.pathname]);

  //Keresés kezelése
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueries((prev) => ({ ...prev, search: e.target.value }));
  };

  useEffect(() => {
    Api().getTaskWithQuery(queries, setTasks, setTaskData, setMessage);
    console.log(taskData);
  }, [queries]);

  console.log(message, tasks);

  //JSX megjelenítés
  return (
    <>
      {/* Ez az oldalrész csak adminok számára megtekinthető */}
      {loggedInUser?.isAdmin ? (
        <>
          {/* Aloldlak megjelenítése és navigálása */}
          <div className="flex pt-20 px-10 items-center justify-between">
            <div className="">
              {/* Listázás */}
              <Link to="list">
                <button
                  className={`p-2 rounded-md border border-black m-2 hover:bg-black hover:text-white transition ${
                    pathname.endsWith("list") ? "bg-black text-white" : ""
                  }`}
                  name="task_list"
                >
                  List Tasks
                </button>
              </Link>
              {/* Szerkesztlés aloldal */}
              <Link to="edit">
                <button
                  className={`p-2 rounded-md border border-black m-2 hover:bg-black hover:text-white transition ${
                    pathname.endsWith("edit") ? "bg-black text-white" : ""
                  }`}
                  name="task_edit"
                >
                  Edit Tasks
                </button>
              </Link>
              {/* Hozzáadás aloldal */}
              <Link to="add">
                <button
                  className={`p-2 rounded-md border border-black m-2 hover:bg-black hover:text-white transition ${
                    pathname.endsWith("add") ? "bg-black text-white" : ""
                  }`}
                  name="task_add"
                >
                  Add Tasks
                </button>
              </Link>
            </div>
            {/* Query a feladatok megjelenítéséhez */}

            <SearchAndPagination
              data={taskData}
              handleSearch={handleSearch}
              queries={queries}
              setQueries={setQueries}
            />
          </div>

          {/* Adatok átadása kontextusnak */}
          {tasks !== null && taskData !== null && (
            <Outlet
              context={{
                taskData: {
                  totalPage: taskData.totalPages,
                  currentPage: taskData.currentPage,
                  totalTask: taskData.totalTasks,
                },
                tasks,
                setTasks,
              }}
            />
          )}
          {/* Loading spinner */}
          {!message.message && !message.error && (
            <div className="w-full flex items-center justify-center">
              <LoadingSpinner loading={true} />
            </div>
          )}
          {message.error && <div className="p-10">{message.error}...</div>}
        </>
      ) : location.pathname.includes("list") ? (
        <>
          <SearchAndPagination
            data={taskData}
            handleSearch={handleSearch}
            queries={queries}
            setQueries={setQueries}
          />

          {/* Adatok átadása kontextusnak */}
          {tasks !== null && taskData !== null && (
            <Outlet
              context={{
                taskData: {
                  totalPage: taskData.totalPages,
                  currentPage: taskData.currentPage,
                  totalTask: taskData.totalTasks,
                },
                tasks,
                setTasks,
              }}
            />
          )}
          {/* Loading spinner */}
          {!message.message && !message.error && (
            <div className="w-full flex items-center justify-center">
              <LoadingSpinner loading={true} />
            </div>
          )}
          {message.error && <div className="p-10">{message.error}...</div>}
        </>
      ) : (
        <div className="font-bold text-xl flex flex-col w-full h-full items-center justify-center">
          <p className="mb-10">You don't have permisson for this page!</p>
          <Link to="">{"<"} Return</Link>
        </div>
      )}
    </>
  );
};

export default TaskManagerPage;
