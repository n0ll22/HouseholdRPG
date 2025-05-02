const router = require("express").Router();
const { auth, authAdmin } = require("../middleware/auth");
const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Process = require("../models/processModel");
const queryOptions = require("../middleware/queryOptions");
const jwt = require("jsonwebtoken");

// Ez a route GET kéréseket kezel, és a lekérdezési paraméterek alapján adja vissza a feladatokat
router.get("/", auth, async (req, res) => {
  try {
    // A lekérdezett paraméterek kinyerése
    const queries = req.query;

    if (queries && Object.keys(queries) === undefined) {
      return res.json({ error: "Querry error" });
    }
    // A queryOptions segítségével kigyűjtjük a szűrési, rendezési, és lapozási beállításokat
    const { query, sortOptions, skip, limit, page } = queryOptions(queries);

    // Az összes feladat számlálása a lekérdezési feltételek alapján
    const totalTasks = await Task.countDocuments(query);

    // A feladatok lekérése az adott feltételek és beállítások alapján (szűrés, rendezés, limitálás)
    const allTasks = await Task.find(query)
      .sort(sortOptions) // Rendezzük a találatokat
      .skip(skip) // Az első x elemet átugorjuk (lapozás)
      .limit(parseInt(limit)); // A limitált számú elemet lekérjük

    if (allTasks.length === 0) {
      return res.json({ setTask: [], error: "No tasks" });
    }

    // A válaszban visszaküldjük a feladatokat, az összes feladat számát, a lapozási adatokat
    res.json({
      tasks: allTasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit), // A teljes oldalak száma
      currentPage: parseInt(page), // Az aktuális oldal
      message: "Succesfully got all tasks!",
    });
  } catch (err) {
    // Ha hiba történt, logoljuk és visszaküldjük az error választ
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Ez a route POST kéréseket kezel, és új feladatot hoz létre a kapott adatok alapján
router.post("/new", authAdmin, async (req, res) => {
  try {
    // A kérés törzséből kinyerjük a feladat adatokat
    const { title, description, exp, tutorial, _length } = req.body;

    // Új feladat létrehozása és mentése az adatbázisba
    const task = await Task.create({
      title,
      description,
      exp,
      _length,
      tutorial,
    });

    // A sikeres válasz visszaküldése
    res.status(201).json({ message: "Task created!", task });
  } catch (error) {
    // Ha hiba történt, logoljuk és visszaküldjük az error választ
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Ez a route POST kéréseket kezel, és a kapott taskId-k alapján lekéri a feladatokat
router.post("/taskByIds", auth, async (req, res) => {
  try {
    // A kérés törzséből kinyerjük az ID-ket
    const ids = req.body;

    // Ha nem kapunk ID-ket, hibaüzenetet küldünk
    if (!ids) {
      return res.status(400).send("Cannot find task with this ID");
    }

    // A feladatok lekérése a kapott ID-k alapján
    const tasks = await Task.find({ _id: { $in: ids } });

    // Egy map létrehozása a feladatok gyors keresésére ID alapján
    const taskMap = new Map();
    tasks.forEach((task) => taskMap.set(task._id.toString(), task));

    // A lekért feladatok visszaadása az ID-k sorrendjében
    const result = ids.map((id) => taskMap.get(id));

    res.status(200).send(result);
  } catch (error) {
    // Ha hiba történt, logoljuk és visszaküldjük az error választ
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Ez a route POST kérést kezel, és elindít egy új process-t egy adott task alapján
router.post("/startProcess", auth, async (req, res) => {
  try {
    const { user_id, task_id, duration } = req.body;

    // Lekérjük a felhasználót és a feladatot az ID-k alapján
    const user = await User.findById(user_id);
    const task = await Task.findById(task_id);

    console.log("Running proccess:", task_id);

    // Ha a felhasználó vagy a feladat nem található, hibát küldünk
    if (!user || !task)
      return res.status(404).json({ error: "User or Task not found!" });

    // Ellenőrizzük, hogy a felhasználónak már fut-e egy process
    const process = await Process.findOne({ user_id });

    // Ha van már folyamat, hibát küldünk
    if (process) {
      return res.status(400).json({ error: "A process is already running" });
    }

    // Új process létrehozása és mentése az adatbázisba
    const newProcess = new Process({
      userId: user_id,
      taskId: task_id,
      duration,
      progress: 0,
      completed: false,
    });
    await newProcess.save();

    res.status(201).json({ message: "Process started", process: newProcess });
  } catch (err) {
    // Ha hiba történt, logoljuk és visszaküldjük az error választ
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Ez a route DELETE kérést kezel, és törli a process-t egy adott ID alapján
router.delete("/process/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    // Ha nem kaptunk ID-t, hibaüzenetet küldünk
    if (!id) {
      return res.status(400).json({ error: "No process id was provided" });
    }

    // A process törlése az ID alapján
    await Process.findByIdAndDelete(id);

    return res.status(200).json({ message: "Process deleted!" });
  } catch (error) {
    // Ha hiba történt, logoljuk és visszaküldjük az error választ
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Ez a route GET kéréseket kezel, és visszaadja egy felhasználó összes processét
router.get("/process/:user_id", auth, async (req, res) => {
  try {
    const { user_id } = req.params; // Kinyerjük a user_id-t a paraméterekből
    console.log(user_id);
    // A process lekérdezése a felhasználó ID-ja alapján, és az adott task részleteinek betöltése
    const process = await Process.find({ userId: user_id }).populate(
      "taskId", // A task_id alapján töltjük be a task-ot
      "title exp _length" // Csak a task title, exp és _length mezőit kérjük le
    );

    // Ha nem találunk process-t a felhasználóhoz, hibaüzenet küldése
    if (!process) {
      return res.status(404).json({ error: "No processes were found!" });
    }

    // Válasz visszaküldése a process listával
    return res.status(200).json(process);
  } catch (err) {
    console.error(err); // Hiba logolása
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Ez a route GET kéréseket kezel, és befejezi egy adott process-t
router.get("/completeProcess/:id", auth, async (req, res) => {
  try {
    const { id } = req.params; // Kinyerjük a process ID-t a paraméterekből

    // A process lekérdezése az ID alapján
    const completedProcess = await Process.findById(id);

    // Ha nem találunk process-t, hibaüzenet küldése
    if (!completedProcess) {
      return res.status(404).json({ message: "Process not found" });
    }

    console.log(completedProcess); // Logoljuk a process adatokat

    // A kapcsolódó task lekérdezése a process-ben található taskId alapján
    const task = await Task.findById(completedProcess.taskId);

    // Ha nem találunk task-ot, hibaüzenet küldése
    if (!task) {
      return res.status(404).json({ error: "Couldn't find task!" });
    }

    // A felhasználó XP-jének növelése a task exp értéke alapján
    const user = await User.findByIdAndUpdate(
      completedProcess.userId,
      {
        $inc: {
          exp: task.exp, // A felhasználó exp értékét növeljük a task exp értékével
        },
      },
      { new: true } // Az új felhasználó adatokat visszaküldjük
    );

    // Ha nem találunk felhasználót, hibaüzenet küldése
    if (!user) {
      return res.status(404).json({ error: "Couldn't find user!" });
    }

    // Válasz visszaküldése a sikeres befejezésről, a process és az új XP értékkel
    return res.status(200).json({
      message: "Task completed",
      process: completedProcess,
      newExp: user.exp, // Az új XP érték
    });
  } catch (error) {
    console.error("Error completing process:", error); // Hiba logolása
    res.status(500).json({ message: "Server Error" });
  }
});

// Ez a route PUT kéréseket kezel, és frissíti a process progresszét
router.put("/updateProgress/:id", auth, async (req, res) => {
  try {
    const { id } = req.params; // Kinyerjük a process ID-t a paraméterekből
    const { progress } = req.body; // Kinyerjük az új progress értéket a kérés törzséből

    console.log(id); // Logoljuk a process ID-t

    // A process frissítése az új progress értékkel. Ha a progress 100, beállítjuk a completed-t true-ra
    const updatedProcess = await Process.findByIdAndUpdate(
      id,
      { progress, completed: progress === 100 }, // Ha a progress 100, a completed-t true-ra állítjuk
      { new: true } // Az új, frissített process-t visszaküldjük
    );

    // Ha nem találunk process-t, hibaüzenet küldése
    if (!updatedProcess) {
      return res.status(404).json({ message: "Process not found" });
    }

    // Válasz visszaküldése a frissített process adatokkal
    res
      .status(200)
      .json({ message: "Progress updated", process: updatedProcess });
  } catch (error) {
    console.error("Error updating progress:", error); // Hiba logolása
    res.status(500).json({ message: "Server Error" });
  }
});

// Ez a route PUT kérést kezel, és frissíti egy feladat adatait
router.put("/:id", authAdmin, async (req, res) => {
  try {
    const { id } = req.params; // Kinyerjük a task ID-t a paraméterekből
    const updateTask = req.body; // Kinyerjük a frissített feladat adatokat

    console.log(updateTask); // Logoljuk a frissített task adatokat

    // A feladat frissítése az ID alapján, az új adatokkal
    const newTask = await Task.findByIdAndUpdate(id, updateTask, { new: true });

    // Válasz visszaküldése a sikeres frissítésről
    res.status(200).send({ task: newTask });
  } catch (error) {
    console.log(error); // Hiba logolása
    res.status(500).send("Internal Server Error");
  }
});

// Ez a route DELETE kérést kezel, és törli a feladatot az ID alapján
router.delete("/:id", authAdmin, async (req, res) => {
  try {
    const id = req.params.id; // Kinyerjük a feladat ID-t a paraméterekből
    if (id) {
      // Ha van ID, töröljük a feladatot
      await Task.findByIdAndDelete(id, { new: true });
      const tasks = await Task.find();
      res.status(200).json({ message: "Task deleted", tasks }); // Válasz a sikeres törlésről
    } else {
      res.status(404).send("Not found!"); // Ha nincs ID, hibaüzenet küldése
    }
  } catch (error) {
    res.status(500).send("Internal Server Error"); // Hibaüzenet küldése, ha valami hiba történik
  }
});

// Ez a route GET kérést kezel, és visszaadja a feladat adatait az ID alapján
router.get("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id; // Kinyerjük a task ID-t a paraméterekből
    const task = await Task.findById(id); // A task lekérdezése az ID alapján

    res.send(task); // Visszaküldjük a lekért feladatot
  } catch (error) {
    res.status(500).send("Internal Server Error"); // Hibaüzenet küldése, ha valami hiba történik
  }
});

// A router exportálása, hogy más fájlokban használhassuk
module.exports = router;
