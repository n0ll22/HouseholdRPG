import React, { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { useNotification } from "../../Notification/Notification";
import { HMStoSeconds } from "../../../Tools/timeConversion";
import { TaskProp } from "../../../Tools/types";
import { FaPlus } from "react-icons/fa";
import { Api } from "../../../Tools/QueryFunctions";
import { useOutletContext } from "react-router-dom";

//Ez a komponens új házimunka hozzáadását biztosítja az admin számára

interface NewTaskProp extends Omit<TaskProp, "_length"> {
  _length: {
    h: string;
    m: string;
    s: string;
  };
}

//React komponens

const AddTask: React.FC = () => {
  //Értesítés hook
  const { notify } = useNotification();
  const { setTasks } = useOutletContext<{
    setTasks: Dispatch<SetStateAction<TaskProp[] | null>>;
  }>();
  //új feladat objektum állapota
  const [task, setTask] = useState<NewTaskProp>({
    _id: "",
    title: "",
    exp: 0,
    _length: {
      h: "0",
      m: "0",
      s: "0",
    },
    description: "",
    tutorial: [],
  });

  //segítő videóanyagok beviteli állapot
  const [tutorialInput, setTutorialInput] = useState<string>("");

  //új házimunka tutorial hozzáadása
  const handleAddTutorial = () => {
    if (tutorialInput) {
      setTask((prev) => ({
        ...prev!,
        tutorial: [...prev.tutorial, tutorialInput],
      }));
    }
  };

  //Új házimunka tutorial törlése
  const handleRemoveTutorial = (index: number) => {
    const updateTutorial = [...task.tutorial];
    updateTutorial.splice(index, 1);
    setTask((prev) => ({ ...prev, tutorial: updateTutorial }));
  };

  //Új házimunka hozzáadása
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (task) {
      const lengthInSeconds = HMStoSeconds(task._length);
      //Átadás az adatbázisnak
      await Api().postTask(
        task.title,
        task.description,
        task.exp,
        lengthInSeconds,
        task.tutorial,
        setTasks,
        notify //Értesítés a feltöltésről
      );

      //jelenítsük meg az új adatot
    }
  };
  console.log("a");

  //JSX megjelenítése
  return (
    <>
      <main className=" flex flex-col w-full items-center animate-fadeInFast  p-5">
        <h1 className=" font-bold text-5xl mb-10 text-center">
          Creation of Tasks
        </h1>
        <form
          onSubmit={(e) => handleSubmit(e)} // hozzáadás kezelése
          className="flex flex-col space-y-4"
        >
          <div className="flex flex-col">
            <label htmlFor="title" className="mb-1">
              Title:
            </label>
            <input
              autoComplete="off"
              className="border rounded-md p-1"
              type="text"
              name="title"
              id="title"
              required
              onChange={(
                e //cím megadása
              ) =>
                setTask((prev) => ({
                  ...prev!,
                  title: e.target.value,
                }))
              }
              value={task?.title}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="desc" className="mb-1">
              Description:
            </label>
            <textarea
              autoComplete="off"
              className="border rounded-md p-1"
              name="desc"
              id="desc"
              required
              onChange={(
                e // leírás megadása
              ) =>
                setTask((prev) => ({
                  ...prev!,
                  description: e.target.value,
                }))
              }
              value={task?.description}
            ></textarea>
          </div>

          <div className="flex flex-col">
            <label htmlFor="exp" className="mb-1">
              EXP:
            </label>
            <input
              id="exp"
              className="border rounded-md p-1"
              type="number"
              name="exp"
              min={0}
              required
              onChange={(
                e // tapasztalatpont megadása
              ) =>
                setTask((prev) => ({
                  ...prev,
                  exp: parseInt(e.target.value, 10) || 0,
                }))
              }
              value={task.exp?.toString()}
            />
          </div>

          <div className="flex flex-col">
            <p className="mb-1">Length:</p>
            <div className="space-x-4">
              <label htmlFor="hours">Hours:</label>
              <input
                id="hours"
                className="border w-20 rounded-md p-1"
                type="number"
                name="hours"
                required
                onChange={(e) => {
                  //óra megadása
                  setTask((prev) => ({
                    ...prev!,
                    _length: {
                      ...prev._length,
                      h: e.target.value,
                    },
                  }));
                }}
                value={task._length.h}
              />
              <label htmlFor="minutes">Minutes:</label>
              <input
                id="minutes"
                className="border w-20 rounded-md p-1"
                type="number"
                name="minutes"
                required
                onChange={(e) =>
                  setTask((prev) => ({
                    ...prev!,
                    _length: { ...prev._length, m: e.target.value },
                  }))
                }
                value={task._length.m}
              />
              <label htmlFor="seconds">Seconds:</label>
              <input
                id="seconds"
                className="border rounded-md w-20 p-2"
                type="number"
                name="seconds"
                required
                onChange={(e) =>
                  setTask((prev) => ({
                    ...prev!,
                    _length: { ...prev._length, s: e.target.value },
                  }))
                }
                value={task._length.s}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="tuts" className="mb-1">
              Tutorials (Embedded YT Links):
            </label>
            <div className="flex ">
              <input
                className="border rounded-md p-1 w-11/12"
                type="text"
                name="tutorial"
                id="tuts"
                onChange={(e) => setTutorialInput(e.target.value)}
                value={tutorialInput}
              />
              <button
                className="flex items-center justify-center border rounded-lg w-1/12 bg-white cursor-pointer hover:bg-black hover:text-white active:bg-gray-300 transition"
                type="button"
                onClick={handleAddTutorial}
              >
                <FaPlus />
              </button>
            </div>
            {task?.tutorial.length > 0 && (
              <div className="w-full p-1 bg-white rounded-lg border">
                {task?.tutorial.map((i, index) => (
                  <div
                    className="flex items-center justify-between"
                    key={index}
                  >
                    <div className="">{i}</div>
                    <input
                      type="button"
                      className="w-3 h-3 bg-red-400 hover:bg-red-300 active:bg-red-500"
                      onClick={() => handleRemoveTutorial(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="submit"
            name="submit"
            id="submit"
            className=" border rounded-lg w-full px-2 py-1 bg-white cursor-pointer hover:bg-gray-200 active:bg-gray-300"
          />
        </form>
      </main>
    </>
  );
};

export default AddTask;
