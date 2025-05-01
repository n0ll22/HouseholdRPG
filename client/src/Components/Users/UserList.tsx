import React from "react";
import { QueryProps, UserDataProp, UserProp } from "../../Tools/types.ts";
import { useNavigate, useOutletContext } from "react-router-dom";
import { SetQuery } from "../../QueryFunctions.tsx";

//Ez a komponens az összes létező felhasználó megjelenítéséért felel
//Kattintással meg lehet tekinteni részletesebben a kiválasztott user profilját

const UserList: React.FC = () => {
  //Adatátadás kontextussal
  const {
    userData,
    queries,
    setQueries,
    usersPending,
    loggedInUser,
    pageWidth,
  } = useOutletContext<{
    userData: UserDataProp;
    loggedInUser: UserProp;
    queries: QueryProps;
    setQueries: React.Dispatch<React.SetStateAction<QueryProps>>;
    usersPending: boolean;
    pageWidth: number;
  }>();

  const padding = pageWidth > 640 ? "py-2 px-4" : "p-1";
  const navigate = useNavigate();

  return (
    <main className="flex flex-col w-full items-start p-10 animate-fadeInFast">
      <h1 className="border-l-4 pl-2 py-2 font-bold text-5xl my-10">
        Hall of Fame
      </h1>

      {/* Keresés bemenet*/}
      <div
        className={`flex items-center justify-end  mb-4  ${
          pageWidth > 640 ? "space-x-4 w-full" : " flex-col w-full"
        }`}
      >
        <div className="w-full flex justify-center">
          <input
            className="p-2 w-full rounded-md border"
            type="text"
            placeholder="Search by username"
            value={queries.search}
            onChange={(e) => SetQuery(setQueries).handleQuerySearchChange(e)}
            name="user_search"
          />
        </div>
        {/* Rendezés módja */}
        <select
          className="p-2 w-full border rounded"
          value={queries.sortBy}
          onChange={(e) => SetQuery(setQueries).handleQuerySortByChange(e)}
          name="user_sort"
        >
          <option value="username">Username</option>
          <option value="lvl">Level</option>
        </select>
        {/*Rendezés sorrendje*/}
        <select
          className="p-2 w-full border rounded"
          value={queries.order}
          onChange={(e) => SetQuery(setQueries).handleQueryOrderChange(e)}
          name="user_order"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        {/* Megjelenítendő mennyiség oldalanként */}
        <select
          className="p-2 w-full border rounded"
          value={queries.limit}
          onChange={(e) => SetQuery(setQueries).handleQueryLimitChange(e)}
          name="user_limit"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Betöltés */}
      {usersPending ? (
        <div className="w-full flex  justify-center items-center my-10">
          <span className="text-lg font-medium">Loading...</span>
        </div>
      ) : (
        //Táblázat megjelenítés
        <div className="w-full p-2 bg-white rounded-lg">
          <table className="table-auto w-full border-gray-300 shadow-lg rounded-lg">
            <thead className="border-b text-left">
              <tr className="">
                <th className={"w-16" + padding}></th>
                <th className={padding}>Username</th>

                <th className={"w-16" + padding}>Level</th>
              </tr>
            </thead>
            <tbody className="rounded-b-lg">
              {userData.users.map(
                (
                  u: UserProp,
                  index //Felhasználók adatai megjelenítése táblázatosan
                ) => (
                  <tr
                    key={index}
                    onClick={() => {
                      //kattintásra navigálás
                      navigate(
                        `${
                          u._id === loggedInUser._id
                            ? "/profile/info"
                            : `/users/${u._id}`
                        }`
                      );
                    }}
                    className="hover:bg-gray-200/50 rounded-md"
                  >
                    <td className={padding}>
                      <div
                        className={`bg-center bg-cover ${
                          pageWidth > 640 ? "w-16 h-16" : "h-10 w-10"
                        }  rounded-full`}
                        style={{
                          backgroundImage: `url(/img/pfps/${u.avatar})`,
                        }}
                      ></div>
                    </td>
                    <td
                      className={`${padding} font-medium flex items-center h-20`}
                    >
                      <p>{u.username}</p>
                      <div
                        className={`w-2 h-2 rounded-full ml-2 ${
                          u.status === "online" ? "bg-green-500 " : "bg-red-500"
                        }`}
                      ></div>
                    </td>

                    <td className={`${padding} text-center`}>{u.lvl}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination kezelése */}
      <div className="flex w-full justify-center items-center my-4 space-x-4">
        <button
          className="p-2 border rounded bg-white cursor-pointer"
          onClick={
            SetQuery(setQueries).handlePaginationChange().handlePerviousPage
          }
          disabled={queries.page === 1}
          name="user_prev"
        >
          Previous
        </button>
        <span>{queries.page}</span>
        <button
          className="p-2 border rounded bg-white cursor-pointer"
          onClick={SetQuery(setQueries).handlePaginationChange().handleNextPage}
          disabled={queries.page === userData.totalPages}
          name="user_next"
        >
          Next
        </button>
      </div>
      <p>Total Users: {userData.totalUsers}</p>
    </main>
  );
};

export default UserList;
