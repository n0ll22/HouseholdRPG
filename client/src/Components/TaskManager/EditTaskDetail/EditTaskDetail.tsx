import React, {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { apiUrl, TaskProp } from "../../../Tools/types";
import { FaPlus } from "react-icons/fa";
import { HMStoSeconds, secondsToObject } from "../../../Tools/timeConversion";
import { Api } from "../../../QueryFunctions";
import useGet from "../../../Hooks/useGet";
import { useNotification } from "../../Notification/Notification";

//Ebben react komponensben egy kiválasztott házimunka részleteit lehet szerkeszteni

//Típus kiegészítés
interface NewTaskProp extends Omit<TaskProp, "_length"> {
  _length: {
    h: string;
    m: string;
    s: string;
  };
}
//React komponens
const EditTaskDetail: React.FC = () => {
  //A házimunka id-je
  const { id } = useParams();
  const { setTasks } = useOutletContext<{
    setTasks: Dispatch<SetStateAction<TaskProp[]>>;
  }>();
  //házimunka lekérése
  const { data: task } = useGet<TaskProp>(apiUrl + "/task/" + id);
  // szerkesztett házimunka állapota
  const [newTask, setTask] = useState<NewTaskProp | null>(null);
  //segédanyagok állapota
  const [tutorialInput, setTutorialInput] = useState<string>("");

  const { notify } = useNotification();

  //Új tutorial hozzáadása a feladat objecthez
  const handleAddTutorial = () => {
    if (tutorialInput) {
      setTask((prev) => ({
        ...prev!,
        tutorial: [...prev!.tutorial, tutorialInput],
      }));
    }
  };

  //Tutorial törlése
  const handleRemoveTutorial = (index: number) => {
    const updateTutorial = [...(newTask!.tutorial ?? [])];
    updateTutorial.splice(index, 1);
    setTask((prev) => ({ ...prev!, tutorial: updateTutorial }));
  };

  //Közzététel esetén id alapján frissítsünk
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newTask) {
      const updateTask = {
        ...newTask,
        _length: HMStoSeconds(newTask._length!),
      };

      await Api()
        .putTask(updateTask)
        .then(() => notify("Task Edited!", null));
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updateTask._id ? { ...task, ...updateTask } : task
        )
      );
    }
  };

  useEffect(() => {
    if (task) {
      const timeForForm = secondsToObject(task._length);
      setTask(() => ({ ...task, _length: timeForForm }));
    }
  }, [task]);

  console.log(newTask);

  //JSX megjelenítése
  return (
    <main className="flex flex-col w-full items-center p-5">
      {newTask && ( //Ha rendelkezünk a szerkesztendő házimunkával, akkor megjelenítés
        <>
          <h1 className="font-bold text-5xl mb-10 text-center">
            Resurrection of {newTask?.title}
          </h1>
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col space-y-4"
          >
            {/* Cím szerkesztése */}
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
                onChange={(e) =>
                  setTask((prev) => ({
                    ...prev!,
                    title: e.target.value,
                  }))
                }
                value={newTask?.title}
              />
            </div>

            {/* Leírás szerkesztése */}
            <div className="flex flex-col">
              <label htmlFor="desc" className="mb-1">
                Description:
              </label>
              <textarea
                autoComplete="off"
                className="border rounded-md p-1 h-24"
                name="desc"
                id="desc"
                required
                onChange={(e) =>
                  setTask((prev) => ({
                    ...prev!,
                    description: e.target.value,
                  }))
                }
                value={newTask?.description}
              ></textarea>
            </div>

            {/* Tapasztalatpont szerkesztése */}
            <div className="flex flex-col">
              <label htmlFor="exp" className="mb-1">
                EXP:
              </label>
              <input
                id="exp"
                className="border rounded-md p-1"
                type="number"
                name="exp"
                required
                onChange={(e) =>
                  setTask((prev) => ({
                    ...prev!,
                    exp: parseInt(e.target.value, 10),
                  }))
                }
                value={newTask?.exp?.toString()}
              />
            </div>

            {/* Időigény szerkesztése */}
            <div className="flex flex-col">
              <p className="mb-1">Length:</p>
              <div className="space-x-4">
                <label htmlFor="hours">Hours:</label>
                <input
                  id="hours"
                  className="border w-20 rounded-md p-1 text-right"
                  type="number"
                  name="hours"
                  max={23}
                  min={0}
                  required
                  onChange={(e) => {
                    setTask((prev) => ({
                      ...prev!,
                      _length: {
                        ...prev!._length,
                        h: e.target.value,
                      },
                    }));
                  }}
                  value={newTask._length.h}
                />
                <label htmlFor="minutes">Minutes:</label>
                <input
                  id="minutes"
                  className="border w-20 rounded-md p-1 text-right"
                  type="number"
                  name="minutes"
                  max={59}
                  min={0}
                  required
                  onChange={(e) =>
                    setTask((prev) => ({
                      ...prev!,
                      _length: { ...prev!._length, m: e.target.value },
                    }))
                  }
                  value={newTask._length.m}
                />
                <label htmlFor="seconds">Seconds:</label>
                <input
                  id="seconds"
                  className="border rounded-md w-20 p-1 text-right"
                  type="number"
                  name="seconds"
                  max={59}
                  min={0}
                  required
                  onChange={(e) =>
                    setTask((prev) => ({
                      ...prev!,
                      _length: { ...prev!._length, s: e.target.value },
                    }))
                  }
                  value={newTask._length.s}
                />
              </div>
            </div>

            {/* Segédanyagok listájának szerkesztése */}
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
              {newTask?.tutorial.length > 0 && (
                <div className="w-full p-1 bg-white rounded-lg border">
                  {newTask?.tutorial.map((i, index) => (
                    <div
                      className="flex items-center justify-between"
                      key={index}
                    >
                      <div className="">{i}</div>
                      <input
                        type="button"
                        className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-300 active:bg-red-500"
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

            <h2 className="font-bold text-xl text-center">
              <Link to="/taskManager/edit">{"<"}Back</Link>
            </h2>
          </form>
        </>
      )}
    </main>
  );
};

export default EditTaskDetail;
