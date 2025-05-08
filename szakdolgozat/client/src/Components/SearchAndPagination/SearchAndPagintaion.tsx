import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { QueryProps } from "../../Tools/types";

// A komponens bemeneti paraméterei
interface Props {
  queries: QueryProps; // A lekérdezési paraméterek (például keresés, sorrend, lapozás)
  setQueries: Dispatch<SetStateAction<QueryProps>>; // A lekérdezési paraméterek állapotának frissítése
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void; // A keresési szűrő kezelése
  data: any; // Az adat, amelyet a keresés és lapozás alapján jelenítünk meg
}

const SearchAndPagination: React.FC<Props> = ({
  queries,
  handleSearch,
  setQueries,
  data,
}) => {
  // Az ablak szélességét tárolja a reszponzív dizájnhoz
  const [pageWidth, setPageWith] = useState(window.innerWidth);

  // Nyomon követi az ablakméret változását
  useEffect(() => {
    window.addEventListener("resize", () => setPageWith(window.innerWidth));

    // A "resize" esemény eltávolítása az effektus tisztításakor
    return () => {
      window.removeEventListener("resize", () =>
        setPageWith(window.innerWidth)
      );
    };
  }, [window.innerWidth]);

  return (
    <div
      className={`flex  ${
        pageWidth > 640
          ? " w-full justify-center items-center px-10 space-x-2" // Ha az ablak szélessége nagyobb, középre igazítjuk a tartalmat
          : "flex-col w-full items-center" // Ha kisebb, akkor vertikálisan rendezzük el a tartalmat
      }  mt-20 `}
    >
      {/* Keresési mező */}
      <input
        type="text"
        className="p-2 h-10 w-52 rounded-md border border-black cursor-text"
        placeholder="Search"
        name="task_search"
        value={queries.search} // A keresési paraméter
        onChange={(e) => handleSearch(e)} // A keresési funkció hívása
      />

      <div className="flex justify-between">
        {/* Sorrend kiválasztása (növekvő vagy csökkenő) */}
        <select
          className="p-2 h-10 border rounded cursor-pointer"
          name="order"
          value={queries.order} // Az aktuális sorrend
          onChange={
            (e) => setQueries((prev) => ({ ...prev, order: e.target.value })) // Sorrend frissítése
          }
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {/* Korlátozott számú elem választása */}
        <select
          className="p-2 h-10 border rounded cursor-pointer"
          name="limit"
          value={queries.limit} // Az aktuális limit
          onChange={(e) =>
            setQueries((prev) => ({
              ...prev,
              limit: parseInt(e.target.value), // A limit értékének beállítása
            }))
          }
        >
          <option value={6}>6</option>
          <option value={9}>9</option>
          <option value={12}>12</option>
          <option value={30}>30</option>
        </select>
      </div>

      <div
        className={`flex ${
          pageWidth > 640 ? "justify-end" : "justify-center" // Az ablak szélessége alapján igazítjuk a gombokat
        } w-full`}
      >
        <div>
          {/* Előző oldal gomb */}
          <button
            className="p-2 h-10 border rounded bg-white cursor-pointer"
            onClick={() =>
              setQueries((prev) => ({
                ...prev,
                page: Math.max(prev.page - 1, 1), // Az előző oldalra lépés, ha lehetséges
              }))
            }
            disabled={queries.page === 1} // Ha az első oldalon vagyunk, a gomb le van tiltva
          >
            Prev
          </button>

          {/* Az aktuális oldal */}
          <span className="mx-4">{queries.page}</span>

          {/* Következő oldal gomb */}
          <button
            className="p-2 h-10 border rounded bg-white cursor-pointer"
            onClick={
              () => setQueries((prev) => ({ ...prev, page: prev.page + 1 })) // A következő oldalra lépés
            }
            disabled={queries.page === data?.totalPages} // Ha az utolsó oldalon vagyunk, a gomb le van tiltva
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndPagination;
