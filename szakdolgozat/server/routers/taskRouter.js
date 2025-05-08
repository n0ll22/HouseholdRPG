const router = require("express").Router();
const { auth, authAdmin } = require("../middleware/auth");
const {
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
} = require("../controllers/taskController");

// Updated routes to use the controller functions
router.get("/", auth, getTasks);
router.post("/new", authAdmin, createTask);
router.post("/taskByIds", auth, getTasksByIds);
router.post("/startProcess", auth, startProcess);
router.delete("/process/:id", auth, deleteProcess);
router.get("/process/:user_id", auth, getUserProcesses);
router.get("/completeProcess/:id", auth, completeProcess);
router.put("/updateProgress/:id", auth, updateProcessProgress);
router.put("/:id", authAdmin, updateTask);
router.delete("/:id", authAdmin, deleteTask);
router.get("/:id", auth, getTaskById);

// A router exportálása, hogy más fájlokban használhassuk
module.exports = router;
