import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import LoadingSpinner from "../../Components/LoadingSpinner/LoadingSpinner";
import { QueryProps, TaskProp } from "../../Tools/types";
import { useUser } from "../../Components/Auth/AuthContext/UserContext";
import { Api } from "../../Tools/QueryFunctions";

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

  //aloldal url lekérdezése (grafikus megjelenítéshez)
  const [pathname, setPathname] = useState<string | undefined>(
    location.pathname.substring(13)
  );

  //Keresés kezelése
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueries((prev) => ({ ...prev, search: e.target.value }));
  };

  useEffect(() => {
    Api().getTaskWithQuery(queries, setTasks, setTaskData, setMessage);
    console.log(taskData);
  }, []);

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
                    pathname === "list" ? "bg-black text-white" : "bg-none"
                  }`}
                  onClick={() =>
                    setPathname(() => location.pathname.substring(13))
                  }
                  name="task_list"
                >
                  List Tasks
                </button>
              </Link>
              {/* Szerkesztlés aloldal */}
              <Link to="edit">
                <button
                  className={`p-2 rounded-md border border-black m-2 hover:bg-black hover:text-white transition ${
                    pathname === "edit" ? "bg-black text-white" : "bg-none"
                  }`}
                  onClick={() =>
                    setPathname(() => location.pathname.substring(13))
                  }
                  name="task_edit"
                >
                  Edit Tasks
                </button>
              </Link>
              {/* Hozzáadás aloldal */}
              <Link to="add">
                <button
                  className={`p-2 rounded-md border border-black m-2 hover:bg-black hover:text-white transition ${
                    pathname === "add" ? "bg-black text-white" : "bg-none"
                  }`}
                  onClick={() =>
                    setPathname(() => location.pathname.substring(13))
                  }
                  name="task_add"
                >
                  Add Tasks
                </button>
              </Link>
            </div>
            {/* Query a feladatok megjelenítéséhez */}
            <div className="space-y-2 flex flex-col items-center">
              <input
                type="text"
                className="p-2 rounded-md border border-black cursor-text"
                placeholder="Search"
                name="task_search"
                value={queries.search}
                onChange={(e) => handleSearch(e)}
              />
              <div className="flex justify-between w-full">
                <select
                  className="p-2 border rounded cursor-pointer"
                  name="order"
                  value={queries.order}
                  onChange={(e) =>
                    setQueries((prev: QueryProps) => ({
                      ...prev,
                      order: e.target.value,
                    }))
                  }
                >
                  <option value={"asc"}>Ascending</option>
                  <option value={"desc"}>Descending</option>
                </select>
                <select
                  className="p-2 border rounded cursor-pointer"
                  name="limit"
                  value={queries.limit}
                  onChange={(e) =>
                    setQueries((prev: QueryProps) => ({
                      ...prev,
                      limit: parseInt(e.target.value),
                    }))
                  }
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={30}>30</option>
                </select>
              </div>
              <div className="flex justify-between w-full items-center">
                <button
                  className="p-2 border rounded bg-white cursor-pointer"
                  onClick={() =>
                    setQueries((prev) => ({
                      ...prev,
                      page: Math.max(prev.page - 1, 1),
                    }))
                  }
                  disabled={queries.page === 1}
                  name="task_prev"
                >
                  Prev
                </button>
                <span>{queries.page}</span>
                <button
                  className="p-2 border rounded bg-white cursor-pointer"
                  onClick={() =>
                    setQueries((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={queries.page === taskData?.totalPages}
                  name="task_next"
                >
                  Next
                </button>
              </div>
            </div>
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
      ) : (
        <div className="font-bold text-xl flex flex-col w-full h-full items-center justify-center">
          <p className="mb-10">You don't have permisson for this page!</p>
          <Link to="/">{"<"} Return</Link>
        </div>
      )}
    </>
  );
};

export default TaskManagerPage;
