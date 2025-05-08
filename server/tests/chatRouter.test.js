// A szükséges modulok importálása
const { getChatsByUserId } = require("../controllers/chatController");
const Chat = require("../models/chatModel");

// A Chat modellt mockoljuk
jest.mock("../models/chatModel");

// Tesztelés a getChatsByUserId függvényhez
describe("getChatsByUserId", () => {
  let req, res;

  // Minden teszt előtt inicializáljuk a req és res objektumokat
  beforeEach(() => {
    req = {
      params: { id: "user123" }, // Tesztelni kívánt felhasználó ID-ja
    };
    res = {
      status: jest.fn().mockReturnThis(), // A válasz státuszkódjának mockolása
      json: jest.fn(), // A válasz JSON formátumú adatainak mockolása
    };
  });

  // Teszteljük, hogy a válasz tartalmazza-e a megfelelő chat adatokat, a résztvevőket és az utolsó üzenetet
  it("should return chats with populated participants and latest message", async () => {
    // A mockolt chat adat
    const mockChats = [
      {
        _id: "chat1",
        participants: [
          {
            _id: "user123",
            username: "Alice",
            avatar: "alice.png",
            status: "online",
          },
          {
            _id: "user456",
            username: "Bob",
            avatar: "bob.png",
            status: "offline",
          },
        ],
        latest: {
          senderId: "user456",
          content: "Hello",
        },
      },
    ];

    // Mockoljuk a populateLatest és populateParticipants függvényeket
    const populateLatestMock = jest.fn().mockResolvedValue(mockChats); // A legújabb üzenet mockolása
    const populateParticipantsMock = jest.fn(() => ({
      populate: populateLatestMock, // Résztvevők populate hívása
    }));

    // A Chat.find metódus mockolása, hogy visszaadja a mockolt adatokat
    Chat.find.mockReturnValue({
      populate: populateParticipantsMock,
    });

    // Meghívjuk a tesztelt függvényt
    await getChatsByUserId(req, res);

    // Ellenőrizzük, hogy a Chat.find metódust a megfelelő paraméterekkel hívták-e
    expect(Chat.find).toHaveBeenCalledWith({ participants: "user123" });
    // Ellenőrizzük, hogy a populate résztvevőket megfelelően hívta-e meg
    expect(populateParticipantsMock).toHaveBeenCalledWith(
      "participants",
      "username avatar status"
    );
    // Ellenőrizzük, hogy a legújabb üzenet populate megfelelően hívódott-e
    expect(populateLatestMock).toHaveBeenCalledWith(
      "latest",
      "senderId content"
    );
    // Ellenőrizzük, hogy a válasz státuszkódja 200 volt-e
    expect(res.status).toHaveBeenCalledWith(200);
    // Ellenőrizzük, hogy a válasz JSON megfelelő adatokat tartalmazott
    expect(res.json).toHaveBeenCalledWith(mockChats);
  });

  // Teszteljük, hogy ha nem található chat, akkor 404-es hibát adjon vissza
  it("should return 404 if no chats found", async () => {
    const populateLatestMock = jest.fn().mockResolvedValue(null); // Ha nincs chat, null-t adunk vissza
    const populateParticipantsMock = jest.fn(() => ({
      populate: populateLatestMock,
    }));

    // A Chat.find metódus mockolása, hogy nem találjon adatokat
    Chat.find.mockReturnValue({
      populate: populateParticipantsMock,
    });

    // Meghívjuk a tesztelt függvényt
    await getChatsByUserId(req, res);

    // Ellenőrizzük, hogy 404-es státuszkódot adjon vissza
    expect(res.status).toHaveBeenCalledWith(404);
    // Ellenőrizzük, hogy a válasz JSON-ban a megfelelő hibaüzenet szerepel-e
    expect(res.json).toHaveBeenCalledWith({ error: "No chat was found" });
  });

  // Teszteljük, hogy hiba esetén 500-as státuszkódot adjon vissza
  it("should handle errors and return 500", async () => {
    // A Chat.find metódust úgy mockoljuk, hogy hibát dobjon
    Chat.find.mockImplementation(() => {
      throw new Error("Database error");
    });

    // Meghívjuk a tesztelt függvényt
    await getChatsByUserId(req, res);

    // Ellenőrizzük, hogy 500-as státuszkódot adjon vissza
    expect(res.status).toHaveBeenCalledWith(500);
    // Ellenőrizzük, hogy a válasz JSON-ban a megfelelő hibaüzenet szerepel-e
    expect(res.json).toHaveBeenCalledWith({
      message: "Error fetching chat rooms",
    });
  });
});
