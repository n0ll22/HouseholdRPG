// A szükséges modulok importálása
const { getTasks } = require("../controllers/taskController");
const Task = require("../models/taskModel");

// A Task modellt mockoljuk
jest.mock("../models/taskModel");

// Tesztelés a getTasks függvényhez
describe("getTasks", () => {
  let req, res;

  // Minden teszt előtt inicializáljuk a req és res objektumokat
  beforeEach(() => {
    req = {
      query: {
        search: "Test", // A keresési kifejezés
        searchOn: "title", // A keresési mező (cím)
        sortBy: "createdAt", // Rendezés dátum szerint
        order: "desc", // Csökkenő sorrend
        page: "1", // Oldalszám
        limit: "10", // Limitált találatok száma
      },
    };
    res = {
      status: jest.fn().mockReturnThis(), // A válasz státuszkódjának mockolása
      json: jest.fn(), // A válasz adatainak json() metódusának mockolása
    };
  });

  // Teszteljük, hogy a lekérdezett feladatok megfelelően legyenek visszaadva, oldalszámozással
  it("should return tasks with pagination info", async () => {
    // A mockolt feladatok
    const mockTasks = [{ title: "Test Task" }, { title: "Another Task" }];
    // A várt lekérdezés és rendezés
    const expectedQuery = { title: { $regex: "Test", $options: "i" } };
    const expectedSort = { createdAt: -1 };

    // A dokumentumok számának mockolása
    Task.countDocuments.mockResolvedValue(2);
    // A feladatok keresésének mockolása
    Task.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(), // A rendezés mockolása
      skip: jest.fn().mockReturnThis(), // Az oldalszámot figyelmen kívül hagyó léptetés
      limit: jest.fn().mockResolvedValue(mockTasks), // A találatok limitálása
    });

    // Meghívjuk a tesztelt függvényt
    await getTasks(req, res);

    // Ellenőrizzük, hogy a countDocuments a várt lekérdezéssel lett hívva
    expect(Task.countDocuments).toHaveBeenCalledWith(expectedQuery);
    // Ellenőrizzük, hogy a find a várt lekérdezéssel lett hívva
    expect(Task.find).toHaveBeenCalledWith(expectedQuery);
    // Ellenőrizzük, hogy a válasz megfelelő információval lett visszaküldve
    expect(res.json).toHaveBeenCalledWith({
      tasks: mockTasks, // A megtalált feladatok
      totalTasks: 2, // A teljes feladatszám
      totalPages: 1, // Az oldalak száma
      currentPage: 1, // A jelenlegi oldal
      message: "Successfully got all tasks!", // Üzenet
    });
  });

  // Teszteljük, hogy ha nem található feladat, akkor üres eredmény jön vissza
  it("should return empty set if no tasks found", async () => {
    Task.countDocuments.mockResolvedValue(0); // Nincs dokumentum
    Task.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]), // Üres lista
    });

    // Meghívjuk a tesztelt függvényt
    await getTasks(req, res);

    // Ellenőrizzük, hogy az üres lista és a megfelelő hibaüzenet jön vissza
    expect(res.json).toHaveBeenCalledWith({ setTask: [], error: "No tasks" });
  });

  // Teszteljük, hogy hiba esetén 500-as státuszkódot adjon vissza
  it("should return 500 if an error occurs", async () => {
    Task.countDocuments.mockRejectedValue(new Error("DB error")); // Hiba szimulálása

    // Meghívjuk a tesztelt függvényt
    await getTasks(req, res);

    // Ellenőrizzük, hogy 500-as státuszkódot adjon vissza
    expect(res.status).toHaveBeenCalledWith(500);
    // Ellenőrizzük, hogy a megfelelő hibaüzenet szerepel-e a válaszban
    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });
});
