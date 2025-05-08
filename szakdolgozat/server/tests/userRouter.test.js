// Szükséges modulok importálása
const { getUsers } = require("../controllers/userController");
const User = require("../models/userModel");
const mockQueryOptions = require("../middleware/queryOptions");

// A User modellt és a queryOptions middleware-t mockoljuk
jest.mock("../models/userModel");
jest.mock("../middleware/queryOptions");

describe("getUsers", () => {
  let req, res;

  // Minden teszt előtt inicializáljuk a req és res objektumokat
  beforeEach(() => {
    req = {
      query: {
        search: "John", // Keresési kifejezés
        searchOn: "username", // Keresési mező (felhasználónév)
        sortBy: "createdAt", // Rendezés létrehozás dátuma szerint
        order: "desc", // Csökkenő sorrend
        page: "1", // Oldalszám
        limit: "10", // Limitált találatok száma
      },
    };
    res = {
      status: jest.fn().mockReturnThis(), // A válasz státuszkódjának mockolása
      json: jest.fn(), // A válasz adatainak json() metódusának mockolása
      send: jest.fn(), // Az üzenetek küldésének mockolása
    };

    // A mockQueryOptions visszaadja a megfelelő lekérdezési beállításokat
    mockQueryOptions.mockReturnValue({
      query: { username: { $regex: "John", $options: "i" } },
      sortOptions: { createdAt: -1 },
      skip: 0,
      limit: 10,
      page: 1,
    });
  });

  // Teszteljük, hogy a felhasználók megfelelő oldalszámozással kerülnek visszaadásra
  it("should return users with pagination", async () => {
    const mockUsers = [{ username: "JohnDoe" }, { username: "JohnSmith" }];

    // A dokumentumok számának mockolása
    User.countDocuments.mockResolvedValue(2);
    // A felhasználók keresésének mockolása
    User.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(), // A rendezés mockolása
      skip: jest.fn().mockReturnThis(), // Az oldalszámot figyelmen kívül hagyó léptetés
      limit: jest.fn().mockResolvedValue(mockUsers), // A találatok limitálása
    });

    // Meghívjuk a tesztelt függvényt
    await getUsers(req, res);

    // Ellenőrizzük, hogy a countDocuments a várt lekérdezéssel lett hívva
    expect(User.countDocuments).toHaveBeenCalledWith({
      username: { $regex: "John", $options: "i" },
    });

    // Ellenőrizzük, hogy a válasz megfelelő felhasználókat, oldalszámot és összesítést tartalmaz
    expect(res.json).toHaveBeenCalledWith({
      users: mockUsers, // A megtalált felhasználók
      totalUsers: 2, // A teljes felhasználószám
      totalPages: 1, // Az oldalak száma
      currentPage: 1, // A jelenlegi oldal
    });
  });

  // Teszteljük, hogy hiba esetén 500-as státuszkódot adjon vissza
  it("should handle internal server error", async () => {
    // Hiba szimulálása a countDocuments metódusnál
    User.countDocuments.mockRejectedValue(new Error("DB error"));

    // Meghívjuk a tesztelt függvényt
    await getUsers(req, res);

    // Ellenőrizzük, hogy 500-as státuszkódot adjon vissza
    expect(res.status).toHaveBeenCalledWith(500);
    // Ellenőrizzük, hogy a megfelelő hibaüzenet szerepel-e a válaszban
    expect(res.send).toHaveBeenCalledWith({
      error: "An internal server error has occurred...",
    });
  });
});
