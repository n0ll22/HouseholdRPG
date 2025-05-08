import React from "react";
import { Link } from "react-router-dom";

//Főoldal kompones. Csak navigálásra használatos

const Welcome: React.FC = () => {
  return (
    <main className=" flex flex-col w-full items-start p-5 animate-fadeInFast">
      <h1 className="border-l-4 pl-2 py-2 font-bold text-5xl my-16">
        Welcome Home!
      </h1>

      <div className="flex flex-wrap border-l-4 justify-center w-full">
        {/* grid */}
        <Link reloadDocument to="/taskComplete">
          <div className="flex flex-col justify-between mx-3 mb-6 w-96 xl:w-64 border rounded-xl hover:bg-gray-200">
            <h2 className="text-2xl font-bold p-2">Want to do the chores?</h2>
            <div className="">
              <p className="p-2">
                Complete tasks and note them for earning your well deserved
                experient points! 💖
              </p>
              <div
                className="w-full h-60 bg-cover bg-center rounded-b-lg"
                style={{
                  backgroundImage: "url('/img/alchemy.jpg')",
                }}
              ></div>
            </div>
          </div>
        </Link>
        <Link to="/allTask">
          <div className="flex flex-col justify-between mx-3 mb-6 w-96  xl:w-64 border rounded-xl hover:bg-gray-200">
            <h2 className="text-2xl font-bold p-2">
              Need help with the chores?
            </h2>
            <div className="">
              <p className="p-2">
                Here is all the help you could have ever wished for! Take a look
                at the tasks! 💫
              </p>
              <div
                className="w-full h-60 bg-cover bg-center rounded-b-lg"
                style={{
                  backgroundImage: "url('/img/baking.jpg')",
                }}
              ></div>
            </div>
          </div>
        </Link>
        <Link to="">
          <div className="flex flex-col justify-between mx-3 mb-6 w-96 xl:w-64 border rounded-xl hover:bg-gray-200">
            <h2 className="text-2xl font-bold p-2">Feeling demotivated?</h2>
            <div className="">
              <p className="p-2">
                We know what you need to do to get back on track! Get some
                motivation with us! ✌️
              </p>
              <div
                className="w-full h-60 bg-cover bg-center rounded-b-lg"
                style={{
                  backgroundImage: "url('/img/mining.jpg')",
                }}
              ></div>
            </div>
          </div>
        </Link>
      </div>
    </main>
  );
};

export default Welcome;
