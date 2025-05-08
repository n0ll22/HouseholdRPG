const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Process = require("../models/processModel");
const queryOptions = require("../middleware/queryOptions");


// Összes feladat lekérése
async function getTasks(req, res) {
  try {
    // Lekérjük a query paramétereket
    const queries = req.query;

    // Ha a query paraméterek üresek, hibaüzenetet küldünk
    if (queries && Object.keys(queries) === undefined) {
      return res.json({ error: "Query error" });
    }

    // Kinyerjük a lekérdezéshez szükséges paramétereket (query, sortOptions, skip, limit, page)
    const { query, sortOptions, skip, limit, page } = queryOptions(queries);

    // Lekérjük az összes feladatot a megadott query alapján
    const totalTasks = await Task.countDocuments(query);
    const allTasks = await Task.find(query)
      .sort(sortOptions) // Rendezzük az eredményt a sortOptions alapján
      .skip(skip) // Az oldalhoz szükséges puffer (az aktuális oldal eléréséhez)
      .limit(parseInt(limit)); // Limitáljuk a találatok számát a megadott limit alapján

    // Ha nincsenek találatok, visszaküldünk egy üres listát és hibaüzenetet
    if (allTasks.length === 0) {
      return res.json({ setTask: [], error: "No tasks" });
    }

    // Visszaadjuk az összes feladatot, a teljes feladatok számát, az oldalak számát és az aktuális oldalt
    res.json({
      tasks: allTasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit), // Az oldalak számát a totalTasks és limit alapján számítjuk
      currentPage: parseInt(page), // Az aktuális oldal számát
      message: "Successfully got all tasks!", // Sikerüzenet
    });
  } catch (err) {
    // Hibakezelés: ha bármi hiba történik, azt naplózzuk, és 500-as hibakódot küldünk
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Új feladat létrehozása
async function createTask(req, res) {
  try {
    // Kinyerjük a feladathoz szükséges adatokat a request body-ból
    const { title, description, exp, tutorial, _length } = req.body;

    // Új feladatot hozunk létre a megadott adatokkal
    const task = await Task.create({
      title,
      description,
      exp,
      _length,
      tutorial,
    });

    // Visszaküldjük a sikeres választ, beleértve az új feladatot
    res.status(201).json({ message: "Task created!", task });
  } catch (error) {
    // Hibakezelés: ha bármi hiba történik, azt naplózzuk és 500-as hibakódot küldünk
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Feladatok lekérése az ID-k alapján
// A függvény a kérésben található ID-k alapján keres feladatokat az adatbázisban.
async function getTasksByIds(req, res) {
  try {
    const ids = req.body; // Az ID-kat a kérés törzséből vesszük
    if (!ids) {
      // Ha nincs ID a kérésben, hibát küldünk
      return res.status(400).send("Cannot find task with this ID");
    }
    // A feladatokat az ID-k alapján keresük meg az adatbázisban
    const tasks = await Task.find({ _id: { $in: ids } });
    const taskMap = new Map(); // Létrehozunk egy térképet a feladatok gyors kereséséhez
    tasks.forEach((task) => taskMap.set(task._id.toString(), task)); // Feladatokat térképezzük
    // Az ID-k alapján visszaadjuk a megfelelő feladatokat
    const result = ids.map((id) => taskMap.get(id));
    res.status(200).send(result); // A megtalált feladatokat válaszoljuk vissza
  } catch (error) {
    // Hiba esetén a szerver hibáját küldjük vissza
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

// Új folyamat indítása
// A függvény elindít egy új folyamatot, amely egy feladatra vonatkozik a felhasználó számára.
async function startProcess(req, res) {
  try {
    const { user_id, task_id, duration } = req.body; // Kivesszük a szükséges adatokat a kérésből
    const user = await User.findById(user_id); // Megkeressük a felhasználót az ID-ja alapján
    const task = await Task.findById(task_id); // Megkeressük a feladatot az ID-ja alapján
    console.log("Running process:", task_id); // Kiírjuk, hogy melyik feladathoz indítunk folyamatot
    if (!user || !task)
      // Ha nem találunk felhasználót vagy feladatot, hibát küldünk vissza
      return res.status(404).json({ error: "User or Task not found!" });

    // Ellenőrizzük, hogy van-e már folyamat, amely fut a felhasználónál
    const process = await Process.findOne({ user_id });
    if (process) {
      // Ha már fut egy folyamat, akkor hibát küldünk
      return res.status(400).json({ error: "A process is already running" });
    }

    // Létrehozzuk az új folyamatot
    const newProcess = new Process({
      userId: user_id, // A felhasználó ID-ja
      taskId: task_id, // A feladat ID-ja
      duration, // A folyamat időtartama
      progress: 0, // A folyamat kezdő állapota (0%)
      completed: false, // A folyamat nincs még befejezve
    });

    // Mentjük az új folyamatot az adatbázisba
    await newProcess.save();
    // Visszaküldjük az indított folyamat adatait a válaszban
    res.status(201).json({ message: "Process started", process: newProcess });
  } catch (err) {
    // Hiba esetén a szerver hibáját küldjük vissza
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// Folyamat törlése az ID alapján
// A függvény egy adott folyamatot töröl az adatbázisból az ID-ja alapján
async function deleteProcess(req, res) {
  try {
    const { id } = req.params; // Az ID a kérés paramétereiből kerül kivételre
    if (!id) {
      // Ha nincs ID a kérésben, hibát küldünk
      return res.status(400).json({ error: "No process id was provided" });
    }
    // Az adott ID alapján töröljük a folyamatot az adatbázisból
    await Process.findByIdAndDelete(id);
    // A törlés után sikerüzenetet küldünk vissza
    return res.status(200).json({ message: "Process deleted!" });
  } catch (error) {
    // Hiba esetén a szerver hibáját küldjük vissza
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// Az összes folyamat lekérése egy felhasználóhoz
// A függvény a felhasználóhoz tartozó összes folyamatot kéri le
async function getUserProcesses(req, res) {
  try {
    const { user_id } = req.params; // A felhasználó ID-ját a kérés paramétereiből vesszük
    const process = await Process.find({ userId: user_id }).populate(
      "taskId", // A taskId mezőt is megtöltjük a kapcsolódó feladatokkal
      "title exp _length" // A feladatokból csak a cím, tapasztalat és hossz mezők lesznek elérhetők
    );
    if (!process) {
      // Ha nincs találat, hibát küldünk
      return res.status(404).json({ error: "No processes were found!" });
    }
    // Visszaküldjük a felhasználóhoz tartozó összes folyamatot
    return res.status(200).json(process);
  } catch (err) {
    // Hiba esetén a szerver hibáját küldjük vissza
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// Folyamat befejezése
// A függvény egy adott folyamatot befejez, hozzáadva a felhasználónak a feladatból származó tapasztalatot
async function completeProcess(req, res) {
  try {
    const { id } = req.params; // A folyamat ID-ja a kérés paramétereiből
    const completedProcess = await Process.findById(id); // Az adott folyamat keresése az adatbázisban
    if (!completedProcess) {
      // Ha nem találjuk a folyamatot, hibát küldünk
      return res.status(404).json({ message: "Process not found" });
    }

    const task = await Task.findById(completedProcess.taskId); // A feladat keresése a folyamat alapján
    if (!task) {
      // Ha nem találjuk a feladatot, hibát küldünk
      return res.status(404).json({ error: "Couldn't find task!" });
    }

    // A felhasználó tapasztalatának növelése a feladat tapasztalata szerint
    const user = await User.findByIdAndUpdate(
      completedProcess.userId,
      {
        $inc: {
          exp: task.exp, // Növeljük a tapasztalatot
        },
      },
      { new: true }
    );

    // A folyamat törlése, miután a feladat befejeződött
    await Process.findByIdAndDelete(id);
    if (!user) {
      // Ha nem találjuk a felhasználót, hibát küldünk
      return res.status(404).json({ error: "Couldn't find user!" });
    }

    // Visszaküldjük a válaszban a sikeres befejezést és a frissített tapasztalatot
    return res.status(200).json({
      message: "Task completed", // A feladat befejezésének üzenete
      process: completedProcess, // A befejezett folyamat
      newExp: user.exp, // Az új tapasztalat a felhasználónál
    });
  } catch (error) {
    // Hiba esetén a szerver hibáját küldjük vissza
    console.error("Error completing process:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

// A folyamat előrehaladásának frissítése
// A függvény a folyamat előrehaladását frissíti és beállítja, hogy befejezett-e
async function updateProcessProgress(req, res) {
  try {
    const { id } = req.params; // A folyamat ID-ja a kérés paramétereiből
    const { progress } = req.body; // Az új előrehaladás az űrlap adatából
    // A folyamat frissítése a haladás és a befejezés státusza alapján
    const updatedProcess = await Process.findByIdAndUpdate(
      id,
      { progress, completed: progress === 100 }, // Ha a progress 100%, akkor befejezetté válik
      { new: true }
    );

    // Ha nem találjuk a frissített folyamatot, hibát küldünk
    if (!updatedProcess) {
      return res.status(404).json({ message: "Process not found" });
    }

    // Visszaküldjük a frissített folyamatot és a sikeres frissítést
    res
      .status(200)
      .json({ message: "Progress updated", process: updatedProcess });
  } catch (error) {
    // Hiba esetén a szerver hibáját küldjük vissza
    console.error("Error updating progress:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

// Feladat frissítése ID alapján
// A függvény egy adott ID-val rendelkező feladatot frissít a kérés adatainak megfelelően
async function updateTask(req, res) {
  try {
    const { id } = req.params; // A frissítendő feladat ID-ja a kérés paramétereiből
    const updateTask = req.body; // A frissítendő adatokat a kérés vesszük
    // A feladat frissítése és a frissített feladat visszaküldése
    const newTask = await Task.findByIdAndUpdate(id, updateTask, { new: true });
    res.status(200).send({ task: newTask });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error"); // Hibakezelés, ha valami hiba történik
  }
}

// Feladat törlése ID alapján
// A függvény törli a feladatot az ID alapján és visszaküldi a frissített feladatok listáját
async function deleteTask(req, res) {
  try {
    const id = req.params.id; // A törlendő feladat ID-ja a kérés paramétereiből
    if (id) {
      // A feladat törlése és az összes feladat visszakérése
      await Task.findByIdAndDelete(id, { new: true });
      const tasks = await Task.find();
      res.status(200).json({ message: "Task deleted", tasks }); // Visszaküldjük a frissített feladatok listáját
    } else {
      res.status(404).send("Not found!"); // Ha nincs megadva ID, hibaüzenetet küldünk
    }
  } catch (error) {
    res.status(500).send("Internal Server Error"); // Hibakezelés
  }
}

// Feladat lekérése ID alapján
// A függvény egy feladatot kér le az ID alapján
async function getTaskById(req, res) {
  try {
    const id = req.params.id; // A lekérdezendő feladat ID-ja
    const task = await Task.findById(id); // A feladat lekérése az ID alapján
    res.send(task); // A feladat visszaküldése válaszként
  } catch (error) {
    res.status(500).send("Internal Server Error"); // Hibakezelés
  }
}

// Exporting the controller functions
module.exports = {
  getTasks,
  createTask,
  getTasksByIds,
  startProcess,
  deleteProcess,
  getUserProcesses,
  completeProcess,
  updateProcessProgress,
  updateTask,
  deleteTask,
  getTaskById,
};
