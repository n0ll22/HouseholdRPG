import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { TaskProp, TaskDataProp } from "../../../Tools/types";
import { secondsToString } from "../../../Tools/timeConversion";
import { Api } from "../../../Tools/QueryFunctions";

//Ez a react komponens a meglévő házimunka feladatok szerksztését szolgálja
//Megjeleníti az összes házimunkát és ki lehet választani melyik feladatot kívánja az admin szerkeszteni vagy törölni

const EditTask: React.FC = () => {
  // adatok lekérése a kontextusból
  const { tasks, setTasks } = useOutletContext<{
    taskData: TaskDataProp;
    tasks: TaskProp[];
    setTasks: Dispatch<SetStateAction<TaskProp[] | null>>;
  }>();
  // törlés állapota
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  // törlésre váró házimunka azonosítója
  const [deleteId, setDeleteId] = useState<string | null>("");
  // hiba vagy üzenet megjelenítésének állapota
  const [message, setMessage] = useState<{
    error: string;
    message: string;
  }>({
    error: "",
    message: "",
  });

  //törlése kezelése
  const handleDelete = async () => {
    console.log(deleteId);
    if (deleteId) {
      //törlés az adatbázisból API DELETE kéréssel
      await Api().deleteTaskById(deleteId, setTasks, setMessage);
      setIsDeleting(false);
    }
  };

  // törlés megerősítésének idejéig ne lehessen görgetni az oldalon
  useEffect(() => {
    if (isDeleting) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isDeleting]);

  //JSX megjelenítése
  return (
    <main className=" flex flex-col w-full items-start px-10 animate-fadeInFast">
      <h1 className="border-l-4 pl-2 py-2 font-bold text-5xl my-10">
        Recreation of Tasks
      </h1>
      <div className="grid gap-10 grid-cols-3 lg:grid-cols-2 md:grid-cols-1 w-full">
        {tasks &&
          tasks.map((i: TaskProp, index: number) => (
            <div
              key={index}
              className="border-b-2 p-2 flex flex-col justify-between transition hover:bg-white/50 rounded-lg hover:-translate-y-1"
            >
              <h2 className="font-bold text-3xl h-20">{i.title}</h2>
              <p className="mb-2">{i.description.substring(0, 100)}...</p>
              <p className="mb-2 font-bold">
                Time: {secondsToString(i._length)}
              </p>
              <div className="flex w-full justify-between font-bold">
                <div>EXP: {i.exp}</div>
                {/* Részletes szerkesztés esetén elnavigál a szerkesztő oldalra */}
                <Link to={i._id}>
                  <div> {">"} Edit</div>
                </Link>
                <button
                  onClick={() => {
                    //törlés esetén görgetés az oldal tetjére és megerősítés menü megjelenítése
                    window.scrollTo(0, 0);
                    setIsDeleting(true);
                    setDeleteId(i._id);
                  }}
                >
                  {">"} Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {isDeleting && ( //törlést megerősítő menü megejelenítése
        <div className="absolute z-20 h-screen w-screen top-0 left-0 bg-black/50 flex flex-col items-center justify-center">
          <div className="w-80 h-60 bg-white p-4 text-center flex flex-col justify-between rounded-xl">
            <div className="space-y-4">
              <h2 className="text-center font-bold text-xl">Are you sure?</h2>
              <p>Do you really want to delete this task?</p>
            </div>
            {message && message.error && <div>ERROR: {message.error}</div>}
            <div className="space-x-20 p-2">
              <input
                className="py-1 w-12 bg-red-400 rounded-lg text-white"
                type="button"
                value="Yes"
                onClick={handleDelete}
              />
              <input
                className="py-1 w-12 bg-green-400 rounded-lg text-white"
                type="button"
                value="No"
                onClick={() => {
                  setIsDeleting(false);
                  setMessage({ error: "", message: "" });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default EditTask;
