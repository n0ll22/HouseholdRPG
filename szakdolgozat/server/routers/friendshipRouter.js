const { auth } = require("../middleware/auth");
const router = require("express").Router();
const friendshipController = require("../controllers/friendshipController");

// Összes barátság lekérése
router.get("/", auth, friendshipController.getAllFriendships);

// Új barátság létrehozása
router.post("/", auth, friendshipController.createFriendship);

// Egy adott barátság lekérése két felhasználó között
router.get("/getOneFriendship", auth, friendshipController.getOneFriendship);

// Blokkolt barátságok lekérése
router.get("/getBlocked/:id", auth, friendshipController.getBlockedFriendships);

// Összes barátság lekérése egy felhasználó számára
router.post(
  "/getAllFriendshipForUser/:id",
  auth,
  friendshipController.getAllFriendshipsForUser
);

// Egy adott barátság lekérése ID alapján
router.get("/:id", auth, friendshipController.getFriendshipById);

module.exports = router;
