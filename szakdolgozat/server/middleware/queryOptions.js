const queryOptions = (queries) => {
  const { search, searchOn, sortBy, order, page, limit } = queries; // A lekérdezési paraméterek kinyerése

  const query = {}; // Üres objektumot hozunk létre, amelyet majd feltöltünk a keresési feltételekkel
  if (search) {
    // Ha van keresési kifejezés
    query[searchOn] = { $regex: search, $options: "i" }; // A keresési kifejezés egy regex-szel lesz kezelve, figyelmen kívül hagyva a kis- és nagybetűk közötti különbséget
  }

  const sortOptions = {}; // Üres objektum a rendezési paraméterekhez
  if (sortBy) {
    // Ha van megadott rendezési mező
    sortOptions[sortBy] = order === "desc" ? -1 : 1; // Ha "desc", akkor csökkenő sorrend (negatív érték), egyébként növekvő sorrend (pozitív érték)
  }

  const skip = (parseInt(page) - 1) * parseInt(limit); // A 'skip' értéket a jelenlegi oldal és a limit alapján számoljuk ki, hogy kihagyjuk a megfelelő számú elemet

  return { query, sortOptions, skip, limit, page }; // Visszaadjuk az elkészített lekérdezési objektumot és a paramétereket
};

module.exports = queryOptions; // A függvény exportálása, hogy más fájlokban is használható legyen
