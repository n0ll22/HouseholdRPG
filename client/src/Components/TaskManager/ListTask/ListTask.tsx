import React from "react";
import { Link, Outlet, useOutletContext } from "react-router-dom";
import { TaskProp } from "../../../Tools/types";
import { secondsToString } from "../../../Tools/timeConversion";

interface TaskDataProp {
  tasks: TaskProp[];
}

const ListTask: React.FC = () => {
  const { tasks } = useOutletContext<{
    taskData: TaskDataProp;
    tasks: TaskProp[];
  }>();

  return (
    <main className=" flex flex-col w-full items-start px-10 animate-fadeInFast">
      <h1 className="border-l-4 pl-2 py-2 font-bold text-5xl my-10">
        Hall of Tasks
      </h1>
      <div className="grid gap-10 grid-cols-3 lg:grid-cols-2 md:grid-cols-1 w-full">
        {tasks &&
          tasks.map((task: TaskProp, index) => (
            <div
              key={index}
              className="border-b-2 p-2 flex flex-col justify-between transition hover:bg-white/50 rounded-lg hover:-translate-y-1"
            >
              <h2 className="font-bold text-3xl h-20">{task.title}</h2>
              <p className="mb-2">{task.description.substring(0, 100)}...</p>
              <p className="mb-2 font-bold">
                Time: {secondsToString(task._length)}
              </p>
              <div className="flex w-full justify-between font-bold">
                <div>EXP: {task.exp}</div>
                <Link to={"tutorial/" + task._id}>
                  <div> {">"}Tutorials</div>
                </Link>
              </div>
            </div>
          ))}
      </div>
      <Outlet />
    </main>
  );
};

export default ListTask;
