import React, { ChangeEvent, useEffect, useState } from "react";
import useGet from "../../Hooks/useGet";
import levels from "../../Tools/lookuplvl.json";
import TaskComplete from "../../Components/TaskCounter/TaskCounter";
import {
  apiUrl,
  Process,
  QueryProps,
  RenderHUDProps,
  TaskDataProp,
  TaskProp,
} from "../../Tools/types"; //Típusok importja

import HUD from "../../Components/TaskCounter/HUD";
import { useUser } from "../../Components/Auth/AuthContext/UserContext";
import { Api } from "../../Tools/QueryFunctions";
import { useNotification } from "../../Components/Notification/Notification";
import { secondsToString } from "../../Tools/timeConversion";

/* Ez a komponens felelős a házimunka játék logikai részéért. Itt találhatóak meg az
API hívások, haladási sáv kezelése és szintlépéssel kapcsolatos function-ök
*/

//React komponens
const TaskCounterPage: React.FC = () => {
  const [queries, setQueries] = useState<QueryProps>({
    searchOn: "title",
    search: "",
    sortBy: "title",
    order: "asc",
    page: 1,
    limit: 100,
  });

  // aktuális felhasználó adatai
  const userData = useUser();
  // a feladatok lekérésé query-vel
  const { data: taskData } = useGet<TaskDataProp>(
    `${apiUrl}/task?search=${queries.search}&searchOn=${queries.searchOn}&sortBy=${queries.sortBy}&order=${queries.order}&page=${queries.page}&limit=${queries.limit}`
  );
  //már kiválaszott feladatok állapotváltozója
  const [currentTasks, setCurrentTasks] = useState<TaskProp[] | null>(null);
  //keresési lista láthatósága
  const [isVisible, setIsVisible] = useState<boolean>(false);
  //haladási sáv állapot
  const [progressbar, setProgressbar] = useState(0);
  //feladathoz szükséges idő állapotváltozója
  const [renderTime, setRenderTime] = useState<string>("00:00:00");
  //aktuálisan kiválaszott feladat állapotváltozója
  const [selectedTask, setSelectedTask] = useState<TaskProp | null>(null);
  //aktuális folyamat állapota
  const [process, setProcess] = useState<Process | null>(null);
  //HUD rendereléséhez szükséges állpaot
  const [renderHUD, setRenderHUD] = useState<RenderHUDProps | null>(null);
  //szintlépés érzékelése
  const [isLevelUp, setIsLevelUp] = useState<boolean>(false);
  //ha még nincs adat, legyen üres
  const tasks = taskData?.tasks || [];

  const { notify } = useNotification();

  //Keresés input kezelése
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQueries((prev) => ({ ...prev, search: e.target.value }));
  };

  //Feladat megkezdésének kezelése
  const handleAddTask = async (task: TaskProp) => {
    //Adatok ellenőrzése
    if (userData && task) {
      //Aktuális feladat küldése a szervernek
      await Api().putTaskToday(userData._id, task._id, setCurrentTasks);
      //Feladat kezdésének ideje
      const startTime = Date.now();
      //Feladat mentése a webböngésző memóriájába
      localStorage.setItem(
        "currentTask",
        JSON.stringify({
          id: task._id,
          startTime,
          duration:
            typeof task._length === "string"
              ? parseInt(task._length)
              : task._length,
        })
      );
      //Kiválaszott feladat megadása
      setSelectedTask(task);

      //Vegül, folyamat átadása a szervernek
      await Api().postTaskProcess(
        userData._id,
        task._id,
        typeof task._length === "number"
          ? task._length
          : parseInt(task._length),
        setProcess
      );
      notify("Process started!", null);
    }
  };

  //Aktuális házimunka feladat törlése
  const handleRemoveTask = async (task: TaskProp) => {
    //Adatok ellenőrzése
    if (task && userData) {
      //törlés a böngésző memóriájából
      localStorage.removeItem("currentTask");
      //Minden változó alaphelyzetbe állítása

      //aktuális feladat törlése a felhasználóból a szerver oldalon
      await Api().deleteTaskToday(
        userData._id,
        task._id,
        task.exp,
        process,
        setCurrentTasks,
        calculateLevel
      );
      if (process) {
        await Api().deleteTaskProcessById(process._id);
      }

      setSelectedTask(null);
      setProcess(null);
      setProgressbar(0);
      setRenderTime("Cancelled");

      notify("Process cancelled!", null);
    }
  };

  //Aktuális nap befejezésének kezelése
  const handleFinish = async () => {
    if (!selectedTask && userData) {
      await Api().deleteAllTaskToday(userData._id, setCurrentTasks);
      setProcess(null);
    }
  };

  console.log(process);

  //Szintlépés ellenőrzése, szint kiszámítása
  const calculateLevel = (newExp: number) => {
    //az új tapasztalatpontunk 0 vagy pozitív lehet csak
    if (newExp > -1) {
      //az esetben, hogy a felhasználó 1. szintű
      if (userData?.lvl === 1) {
        setRenderHUD({
          currentExp: newExp,
          lvl: 1,
          nextLvlExp: levels[0].exp + levels[0].diff,
          startExp: 0,
        });
      }
      //Aktuális szint indexének megkeresése
      const getCurrentLevelIndex = levels.findIndex((l) => l.exp > newExp);
      //Aktuálus szint megkeresése index alapján (out of boundary elkerülése)
      const getCurrentLevel = levels[getCurrentLevelIndex - 1];

      setRenderHUD({
        currentExp: newExp,
        lvl: getCurrentLevel.lvl,
        nextLvlExp: getCurrentLevel.exp + getCurrentLevel.diff,
        startExp: getCurrentLevel.exp,
      });
    }
  };

  // házimunka folyamat kezelése, haladási sáv frissítése
  useEffect(() => {
    if (!selectedTask || !process) return; //ha nincs adat, visszalépés

    //webböngésző memória lekérdezés
    const saved = localStorage.getItem("currentTask");

    //ha nincs találat, visszalépés
    if (!saved) return;

    //folyamat objektum dekonstuációja
    const { startTime, duration } = JSON.parse(saved);

    //ha hiányoznak az adatok, visszalépés
    if (!startTime || !duration) return;

    //Ha vannak adatok, akkor frissítsük a folyamatot
    if (process && renderHUD) {
      //1 másodperces intervallumonként frissül
      const interval = setInterval(() => {
        const elapsedMs = Date.now() - startTime; //eltelt idő kiszámítása ms-ben
        const elapsed = elapsedMs / 1000;
        const remaining = Math.max(duration - elapsed, 0); // hátralévő idő kiszámítása
        const percent = Math.min((elapsed / duration) * 100, 100); //folyamat százaléka

        //kiszámolt százalék beállítása
        setProgressbar(percent);
        //hátralévő idő megjelenítése
        setRenderTime(remaining > 0 ? secondsToString(remaining) : "Done!");
        //Adatbázis adatainak frissítése
        Api().putTaskProcessById(process._id, percent, setProcess);

        //lejárt idő kezelése
        if (remaining <= 0) {
          //intervallum törlése
          clearInterval(interval);
          setSelectedTask(null);
          //kész feladat ellenőrzése
          Api().getCompleteProcess(
            process._id,
            renderHUD,
            setRenderHUD,
            setIsLevelUp,
            calculateLevel
          );
          //folyamat törlése
          Api().deleteTaskProcessById(process._id);
          setProcess(null);
          //folyamat törlése adatbázisból
          localStorage.removeItem("currentTask");
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [selectedTask, process]);

  useEffect(() => {
    if (process?.progress === 100) {
      setProcess(null);
    }
  }, [process]);

  //adatok lekérése első futásnál
  useEffect(() => {
    if (userData) {
      Api().getTasksByIds(userData.taskToday, setCurrentTasks);
      Api().getTaskProcessByUserId(userData._id, setProcess, setSelectedTask);

      calculateLevel(userData.exp);
    }
  }, [userData]);

  //keresés esetén megjelenítési állapot változás
  useEffect(() => {
    setIsVisible(!!queries.search);
  }, [queries.search]);

  //JSX megjelenítése
  return (
    <>
      {/* Heads-Up display komponens */}
      {userData && renderHUD && (
        <HUD
          isLevelUp={isLevelUp}
          setIsLevelUp={setIsLevelUp}
          renderHUD={renderHUD}
          setRenderHUD={setRenderHUD}
        />
      )}
      {/* Ha minden adat meg van, akkor jelenítsük meg a program kinézeti részét */}
      {userData && tasks && (
        <TaskComplete
          process={process}
          currentTasks={currentTasks}
          tasks={tasks}
          queries={queries}
          isVisible={isVisible}
          handleRemoveTask={handleRemoveTask}
          handleSearch={handleSearch}
          handleFinish={handleFinish}
          setIsVisible={setIsVisible}
          progressbar={progressbar}
          renderTime={renderTime}
          selectedTask={selectedTask}
          handleAddTask={handleAddTask}
        />
      )}
    </>
  );
};

export default TaskCounterPage;
