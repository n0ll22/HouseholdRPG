const router = require("express").Router();
const {
  getUsers,
  registerUser,
  loginUser,
  restorePassword,
  restoreAccount,
  reactivateAccount,
  resetPassword,
  getLoggedInStatus,
  getLoggedInUser,
  addTaskToday,
  logoutUser,
  removeTaskToday,
  updateUsername,
  updateAvatar,
  updateBanner,
  updateEmail,
  updatePassword,
  deleteAccount,
  finishDay,
  lvlUp,
  getUserById,
} = require("../controllers/userController");

// Route a felhasználók listájának lekérésére, lapozással
router.get("/", getUsers);

// Route a felhasználó regisztrálásához
router.post("/register", registerUser);

// Felhasználó bejelentkezése
router.post("/login", loginUser);

// Jelszó visszaállítása kérésre
router.post("/restorePassword", restorePassword);

// Felhasználó fiókjának visszaállítása
router.post("/restoreAccount", restoreAccount);

// Fiók újraaktiválása
router.post("/reactivate-account", reactivateAccount);

// Jelszó visszaállítása
router.post("/reset-password", resetPassword);

// Felhasználó kijelentkeztetése
router.get("/logout/:id", logoutUser);

// Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
router.get("/loggedIn", getLoggedInStatus);

// Bejelentkezett felhasználó adatainak lekérése
router.get("/loggedInUser", getLoggedInUser);

// Feladat hozzáadása a felhasználóhoz
router.put("/addTaskToday", addTaskToday);

// Feladat eltávolítása a felhasználótól
router.put("/removeTaskToday", removeTaskToday);

// Felhasználó felhasználónevének frissítése
router.put("/updateUsername", updateUsername);

// Felhasználó avatárjának frissítése
router.put("/updateAvatar", updateAvatar);

// Felhasználó bannerjének frissítése
router.put("/updateBanner", updateBanner);

// Új email cím beállítása egy adott felhasználónak
router.put("/newEmail/:id", updateEmail);

// Új jelszó beállítása egy adott felhasználónak
router.put("/newPassword/:id", updatePassword);

// Route to delete a user account
router.put("/deleteAccount/:id", deleteAccount);

// Route to finish the day (clear taskToday list)
router.delete("/finishDay/:id", finishDay);

// Route to level up a user
router.put("/lvlUp/:id", lvlUp);

// Route to get user details by ID
router.get("/:id", getUserById);

module.exports = router;
