import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { QueryProps } from "../../Tools/types";

interface Props {
  queries: QueryProps;
  setQueries: Dispatch<SetStateAction<QueryProps>>;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  data: any;
}

const SearchAndPagination: React.FC<Props> = ({
  queries,
  handleSearch,
  setQueries,
  data,
}) => {
  const [pageWidth, setPageWith] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener("resize", () => setPageWith(window.innerWidth));

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
          ? " w-full justify-center items-center "
          : "flex-col w-full items-center"
      }  mt-20 `}
    >
      <input
        type="text"
        className="p-2 h-10 w-52 rounded-md border border-black cursor-text"
        placeholder="Search"
        name="task_search"
        value={queries.search}
        onChange={(e) => handleSearch(e)}
      />
      <div className="flex justify-between">
        <select
          className="p-2 h-10 border rounded cursor-pointer"
          name="order"
          value={queries.order}
          onChange={(e) =>
            setQueries((prev) => ({ ...prev, order: e.target.value }))
          }
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <select
          className="p-2 h-10 border rounded cursor-pointer"
          name="limit"
          value={queries.limit}
          onChange={(e) =>
            setQueries((prev) => ({
              ...prev,
              limit: parseInt(e.target.value),
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
          pageWidth > 640 ? "justify-end" : "justify-center"
        } w-full`}
      >
        <div>
          <button
            className="p-2 h-10 border rounded bg-white cursor-pointer"
            onClick={() =>
              setQueries((prev) => ({
                ...prev,
                page: Math.max(prev.page - 1, 1),
              }))
            }
            disabled={queries.page === 1}
          >
            Prev
          </button>
          <span className="mx-4">{queries.page}</span>
          <button
            className="p-2 h-10 border rounded bg-white cursor-pointer"
            onClick={() =>
              setQueries((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={queries.page === data?.totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndPagination;
