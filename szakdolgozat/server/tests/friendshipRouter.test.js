// A szükséges modulok importálása
const { getAllFriendships } = require("../controllers/friendshipController");
const Friendship = require("../models/friendshipModel");

// A Friendship modellt mockoljuk
jest.mock("../models/friendshipModel");

// Tesztelés a getAllFriendships függvényhez
describe("getAllFriendships", () => {
  let req, res;

  // Minden teszt előtt inicializáljuk a req és res objektumokat
  beforeEach(() => {
    req = {}; // Nincs specifikus paraméter, mivel nem használjuk itt a kérés paramétereit
    res = {
      status: jest.fn().mockReturnThis(), // A válasz státuszkódjának mockolása
      send: jest.fn(), // A válasz adatainak send() metódusának mockolása
    };
  });

  // Teszteljük, hogy a válasz tartalmazza-e a megfelelő barátságokat a senderId és receiverId populálásával
  it("should return friendships with populated senderId and receiverId", async () => {
    // A mockolt barátság adat
    const mockFriendships = [
      {
        _id: "123",
        senderId: {
          _id: "1",
          username: "User1",
          avatar: "avatar1.png",
          lvl: 5,
        },
        receiverId: {
          _id: "2",
          username: "User2",
          avatar: "avatar2.png",
          lvl: 7,
        },
      },
    ];

    // Chainable mock a .find().populate() metódusra
    const populateMock = jest.fn().mockResolvedValue(mockFriendships);
    Friendship.find.mockReturnValue({ populate: populateMock });

    // Meghívjuk a tesztelt függvényt
    await getAllFriendships(req, res);

    // Ellenőrizzük, hogy a Friendship.find metódus hívódott-e
    expect(Friendship.find).toHaveBeenCalled();
    // Ellenőrizzük, hogy a populate a megfelelő mezőket hívta meg
    expect(populateMock).toHaveBeenCalledWith(
      ["senderId", "receiverId"], // A senderId és receiverId mezők populálása
      "username avatar lvl" // A visszaadott mezők
    );
    // Ellenőrizzük, hogy a válasz státuszkódja 200 volt-e
    expect(res.status).toHaveBeenCalledWith(200);
    // Ellenőrizzük, hogy a válasz a megfelelő adatokat tartalmazza-e
    expect(res.send).toHaveBeenCalledWith(mockFriendships);
  });

  // Teszteljük, hogy ha nem található barátság, akkor 204-es válasz jön
  it("should return 204 when no friendships are found", async () => {
    const populateMock = jest.fn().mockResolvedValue([]); // Ha nincs barátság, üres tömböt adunk vissza
    Friendship.find.mockReturnValue({ populate: populateMock });

    // Meghívjuk a tesztelt függvényt
    await getAllFriendships(req, res);

    // Ellenőrizzük, hogy 204-es státuszkódot adjon vissza
    expect(res.status).toHaveBeenCalledWith(204);
    // Ellenőrizzük, hogy a válasz a megfelelő hibaüzenetet tartalmazza-e
    expect(res.send).toHaveBeenCalledWith({
      message: "No friendship was found!", // Üzenet, ha nem található barátság
    });
  });

  // Teszteljük, hogy hiba esetén 500-as státuszkódot adjon vissza
  it("should return 500 on error", async () => {
    const error = new Error("Database error");
    const populateMock = jest.fn().mockRejectedValue(error); // Hiba szimulálása a populate módszernél
    Friendship.find.mockReturnValue({ populate: populateMock });

    // Meghívjuk a tesztelt függvényt
    await getAllFriendships(req, res);

    // Ellenőrizzük, hogy 500-as státuszkódot adjon vissza
    expect(res.status).toHaveBeenCalledWith(500);
    // Ellenőrizzük, hogy a válasz JSON-ban a megfelelő hibaüzenet szerepel-e
    expect(res.send).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });
});
