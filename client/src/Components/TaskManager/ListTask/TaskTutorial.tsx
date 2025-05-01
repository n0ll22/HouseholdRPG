import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useGet from "../../Hooks/useGet";
import { apiUrl, TaskProp } from "../../Tools/types";

//Ez a komponens a házimunka feladat segédanyagát jeleníti meg
const TaskTutorial = () => {
  //feladat id-je
  const { id } = useParams();
  //feladat datai
  const { data } = useGet<TaskProp>(apiUrl + "/task/" + id);
  //feladat állapota
  const [task, setTask] = useState<TaskProp>();
  // video betöltésének állapota
  const [loadingVideo, setLoadingVideo] = useState<boolean>(true);

  //videoó töltés kezelése
  const handleLoad = () => {
    setLoadingVideo(false);
  };

  //kezdeti adatok beállítása
  useEffect(() => {
    if (data) {
      setTask({ ...data });
    }
  }, [data]);

  return (
    <main className="flex flex-col w-full items-start p-10">
      <h1 className="border-l-4 pl-2 py-2 font-bold text-5xl mb-5">
        Hall of Tutorials
      </h1>

      {task && (
        <>
          <h3 className="border-l-4 font-bold text-xl pl-2 py-2">
            Tutorial Page about {task.title.toLowerCase()}.
          </h3>

          <div className="border-l-4 my-5 w-full flex justify-center flex-wrap">
            {loadingVideo && (
              <h3 className="font-bold text-base absolute">
                Loading videos...
              </h3>
            )}

            {task.tutorial?.map((i, index) => {
              // Extract YouTube video ID

              const videoIdMatch = i.match(
                /(?:\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/
              );
              const videoId = videoIdMatch?.[1];
              if (!videoId) return null;

              return (
                <iframe
                  key={index}
                  className="mx-2 my-10 rounded-xl border"
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={handleLoad}
                  name={"video" + videoId}
                ></iframe>
              );
            })}
          </div>
        </>
      )}

      <div className="border-l-4 font-bold text-xl pl-2 py-2">
        <Link to="/taskManager/list">{"<"} Back</Link>
      </div>
    </main>
  );
};

export default TaskTutorial;
