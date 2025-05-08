import React, { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  apiUrl,
  ChatProp,
  ChatRoomProp,
  FriendshipProp,
  Process,
  QueryProps,
  RegistrationData,
  RenderHUDProps,
  TaskProp,
  UserProp,
} from "./types";
import axios, { AxiosResponse } from "axios";
import { NavigateFunction } from "react-router-dom";

/*                      ÖSSZES QUERY BEÁLLÍTÁS                               */

export function SetQuery(
  setQueries: React.Dispatch<SetStateAction<QueryProps>>
) {
  const handleQuerySearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQueries((prev: QueryProps) => ({
      ...prev,
      search: e.target.value,
    }));
  };

  const handleQuerySortByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setQueries((prev: QueryProps) => ({
      ...prev,
      sortBy: e.target.value,
    }));
  };

  const handleQueryOrderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setQueries((prev: QueryProps) => ({
      ...prev,
      order: e.target.value,
    }));
  };

  const handleQueryLimitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setQueries((prev: QueryProps) => ({
      ...prev,
      limit: parseInt(e.target.value),
    }));
  };

  const handlePaginationChange = () => {
    const handleNextPage = () => {
      setQueries((prev: QueryProps) => ({ ...prev, page: prev.page + 1 }));
    };
    const handlePerviousPage = () => {
      setQueries((prev: QueryProps) => ({
        ...prev,
        page: Math.max(prev.page - 1, 1),
      }));
    };

    return { handleNextPage, handlePerviousPage };
  };

  return {
    handlePaginationChange,
    handleQueryLimitChange,
    handleQueryOrderChange,
    handleQuerySearchChange,
    handleQuerySortByChange,
  };
}

/*                      ÖSSZES API HíVÁS                               */

export function Api() {
  /*------------------------------POST REQUESTS----------------------------------*/

  //Regisztáció POST REQUEST
  const postRegistration = async (
    registrationData: RegistrationData,
    navigate: NavigateFunction,
    setMessage: Dispatch<SetStateAction<{ error: string; message: string }>>
  ) => {
    await axios
      .post(apiUrl + "/user/register", registrationData)
      .then(() => {
        //Ha sikeres a regisztáció automatikusan bejelenkeztet minket az oldal
        navigate("/"); //Navigáljunk a főoldalra majd frissítsük az oldalt
        window.location.reload(); //Oldal frissítése
      })
      .catch((err) => {
        //Hiba esetén jelenítsük meg a hibát
        console.error(err);
        setMessage({ message: "", error: err?.response?.data?.error });
      });
  };

  //Bejelentkezés POST REQUEST
  const postLogin = async (
    loginData: {
      username: string;
      password: string;
    },
    getLoggedIn: () => Promise<void>,
    checkLoginStatus: () => Promise<void>,
    navigate: NavigateFunction,
    setMessage: Dispatch<SetStateAction<string | null>>
  ) => {
    await axios
      .post(apiUrl + "/user/login", loginData)
      .then(() => {
        getLoggedIn(); //Ellenőrzés, hogy sikerült-e bejelentkezni
        checkLoginStatus();
        navigate("/"); //Navigálás a főoldalra
        window.location.reload(); //Oldal újratöltése
      })
      .catch((err) => {
        //Hiba esetén hiba megjeleníése
        console.error(err);
        setMessage(err.response.data.error); //Hiba tárolása
      });
  };

  //Fiók újra aktiválásána POST REQ
  const postReactivateAccount = async (
    token: string,
    navigate: NavigateFunction,
    setMessage: Dispatch<SetStateAction<string>>
  ) => {
    await axios
      .post(apiUrl + "/user/reactivate-account", { token })
      .then(() => setTimeout(() => (navigate("/"), 2000))) //Ha sikeres a hitelesítés, akkor átirányítás a bejelentkezéshez 2 mp után
      .catch((err) => setMessage(err.response.data.error));
  };
  //Fiók visszaállítás kérése POST REQUEST
  const postRestoreAccount = async (
    email: string,
    setMessage: Dispatch<SetStateAction<string | null>>
  ) => {
    try {
      await axios.post(apiUrl + "/user/restoreAccount", { email });
      setMessage("Email sent to your address!"); //A szerver küld egy email-t
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Something went wrong.");
    }
  };

  // Új jelszó beállítás POST REQUEST token alapján
  const postResetPassword = async (
    token: string,
    password: string,
    passwordAgain: string,
    setMessage: Dispatch<SetStateAction<string | null>>,
    navigate: NavigateFunction
  ) => {
    await axios
      .post(apiUrl + "/user/reset-password", {
        token,
        password,
        passwordAgain,
      })
      .then(() => {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/"), 2000); //Sikeres jelszó beállítás után elvezet a bejelenetkezés oldalára 2 mp után
      })
      .catch((err) => setMessage(err.response.data.error));
  };

  // Új jelszó beállítás kérés POST REQUEST
  const postRestorePassword = async (
    email: string,
    setMessage: Dispatch<SetStateAction<string | null>>
  ) => {
    await axios
      .post(apiUrl + "/user/restorePassword", { email: email })
      .then(() => setMessage("Email sent to your adress!")) // A szerver küld egy token-es emailt a felhasználónak
      .catch((err) =>
        setMessage(err.response.data.error || "Something went wrong!")
      );
  };

  //Új házimunka feladat POST REQUEST
  const postTask = async (
    title: string,
    description: string,
    exp: number,
    _length: number,
    tutorial: string[],
    setTasks: Dispatch<SetStateAction<TaskProp[] | null>>,
    notify: (message: string, link: string | null) => void
  ) => {
    await axios
      .post(apiUrl + "/task/new", {
        title,
        description,
        exp,
        _length,
        tutorial,
      })
      .then((res) => {
        notify("Task added successfully!", null);

        setTasks((prev) => {
          if (!prev) return [res.data.task];
          return [...prev, res.data.task];
        });
      }) //Siker esetén értesítsük a felhasználót
      .catch((err) => console.error(err));
  };

  //ÚJ Feladatvégzés folyamat POST REQUEST
  const postTaskProcess = async (
    user_id: string,
    task_id: string,
    duration: number,
    setProcess: Dispatch<SetStateAction<Process | null>>
  ) => {
    await axios
      .post(`${apiUrl}/task/startProcess`, {
        user_id,
        task_id,
        duration,
      })
      .then((res) => {
        setProcess(res.data.process); //Állítdsuk be a populált folyamatot
        console.log(res.data.message);
      })
      .catch((err) => console.error(err));
  };

  /*------------------------------GET REQUESTS----------------------------------*/

  //Kész feladat folyamat lekérése POST REQUEST id alapján
  const getCompleteProcess = async (
    process_id: string,
    renderHUD: RenderHUDProps,
    setRenderHUD: Dispatch<SetStateAction<RenderHUDProps | null>>,
    setIsLevelUp: Dispatch<SetStateAction<boolean>>,
    calculateLevel: (exp: number) => void
  ) => {
    await axios
      .get(`${apiUrl}/task/completeProcess/${process_id}`)
      .then((res) => {
        setRenderHUD((prev) => {
          //Grafikus megjelenítés beállítása
          if (!prev) return null;
          return {
            ...prev,
            currentExp: res.data.newExp,
          };
        });
        if (res.data.newExp > renderHUD!.nextLvlExp) {
          //Szintlépés beállítása
          setIsLevelUp(true);
        }
        calculateLevel(res.data.newExp); //Szint kiszámítása
        console.log("LOG: Process is complete!");
      })
      .catch((err) => console.error(err));
  };

  /*------------------------------PUT REQUESTS----------------------------------*/

  // Avatar cseréje PUT REQUEST felh. id alapján
  const putAvatar = async (updateData: { avatar: string; _id: string }) => {
    await axios
      .put(apiUrl + "/user/updateAvatar", updateData)
      .then(() => {
        window.location.reload();
      })
      .catch((err) => console.error(err));
  };

  // Banner cseréje PUT REQUEST felh. id alapján
  const putBanner = async (banner: string) => {
    await axios
      .put(apiUrl + "/user/updateBanner", { banner })
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err));
  };

  //Új jelszó PUT REQUEST felh. id alapján
  const putPassword = async (
    user_id: string,
    passwords: {
      password: string;
      passwordAgain: string;
      currentPassword: string;
    },
    setMessage: Dispatch<SetStateAction<{ message: string; error: string }>>
  ) => {
    await axios
      .put(apiUrl + "/user/newPassword/" + user_id, {
        currentPassword: passwords.currentPassword,
        password: passwords.password,
        passwordAgain: passwords.passwordAgain,
      })
      .then((res) => {
        setMessage({ message: res.data.message, error: "" });
      })
      .catch((err) =>
        setMessage({ message: "", error: err.response.data.error })
      );
  };

  //Felhasználónév csere PUT REQUEST felh. id alapján
  const putUsername = async (_id: string, newUsername: string) => {
    await axios
      .put(apiUrl + "/user/updateUsername", { _id, newUsername })
      .then(() => console.log("Saved!"))
      .catch((err) => console.error(err));
  };

  //Email csere PUT REQUEST felh. id alapján
  const putEmail = async (
    user_id: string,
    email: string,
    setMessage: Dispatch<SetStateAction<{ message: string; error: string }>>,
    setEmail: Dispatch<SetStateAction<{ render: string; input: string }>>
  ) => {
    await axios
      .put(apiUrl + "/user/newEmail/" + user_id, {
        email,
      })
      .then((res) => {
        setMessage({ message: res.data.message, error: "" });
        setEmail((prev) => ({ ...prev, render: res.data.email }));
      })
      .catch((err) =>
        setMessage({ message: "", error: err.response.data.error })
      );
  };

  // Házimunka frissítés PUT REQUEST id-ja alapján
  const putTask = async (task: TaskProp) => {
    await axios
      .put(apiUrl + "/task/" + task._id, task) // Replace taskId with the actual id value
      .then(() => {
        console.log("LOG: Task edited successfully");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Feladat hozzáadása a napi feladatokhoz PUT REQUEST felh. id alapján
  const putTaskToday = async (
    user_id: string,
    task_id: string,
    setTaskToday: Dispatch<SetStateAction<TaskProp[] | null>>
  ) => {
    await axios
      .put(`${apiUrl}/user/addTaskToday`, { user_id, task_id })
      .then((res) => {
        console.log(res.data.message), setTaskToday(res.data.task);
      })
      .catch((err) => console.error(err));
  };

  // házimunka folyamat frissítése id-ja alapján
  const putTaskProcessById = async (
    process_id: string,
    progress: number,
    setProcess: Dispatch<SetStateAction<Process | null>>
  ) => {
    if (process_id) {
      await axios
        .put(`${apiUrl}/task/updateProgress/${process_id}`, {
          progress,
        })
        .then((res) => setProcess(res.data.process))
        .catch((err) => console.error(err));
    }
  };

  /* Technikailag nem törlés, ezért put request, viszont a kliens oldalról olyan, mintha törlés lenne */

  //Napi feladatok űrítése PUT REQUEST felhasználó id alapján
  const deleteAllTaskToday = async (
    user_id: string,
    setTaskToday: Dispatch<SetStateAction<TaskProp[] | null>>
  ) => {
    await axios
      .delete(`${apiUrl}/user/finishDay/${user_id}`)
      .then(() => setTaskToday(null))
      .catch((err) => console.error(err));
  };

  //Fiók "törölt" állapotba helyezése PUT REQUEST felh. id alapján
  const deleteAccount = async (
    user_id: string,
    getLoggedIn: () => Promise<void>,
    setMessage: Dispatch<SetStateAction<{ message: string; error: string }>>
  ) => {
    await axios
      .put(apiUrl + "/user/deleteAccount/" + user_id)
      .then(() => {
        getLoggedIn();
      })
      .catch((err) => setMessage(err.response.data));
  };

  //Napi feladat kiszedése a feladatok közül POST REQUEST felh. id alapján
  const deleteTaskToday = async (
    user_id: string,
    task_id: string,
    exp: number,
    process: Process | null,
    setTaskToday: Dispatch<SetStateAction<TaskProp[] | null>>,
    calculateLevel: (exp: number) => void
  ) => {
    await axios
      .put(
        `${apiUrl}/user/removeTaskToday?inProgress=${process ? true : false}`,
        { user_id, task_id, exp }
      )
      .then((res) => {
        setTaskToday(res.data.task);
        calculateLevel(res.data.newExp);
      })
      .catch((err) => console.error(err));
  };

  /*------------------------------GET REQUESTS----------------------------------*/

  //Kijelentkezés GET REQUEST
  const getLogout = async (user_id: string) => {
    await axios
      .get(apiUrl + "/user/logout/" + user_id)
      .then(() => console.log("Logging out...")) // A szerver csak törli a cookie-t
      .catch((err) => console.error(err));
  };

  const getTaskWithQuery = async (
    queries: QueryProps,
    setTasks: Dispatch<SetStateAction<TaskProp[] | null>>,
    setTaskData: Dispatch<
      SetStateAction<{
        totalTasks: number;
        totalPages: number;
        currentPage: number;
      } | null>
    >,
    setMessage: Dispatch<
      SetStateAction<{
        message: string;
        error: string;
      }>
    >
  ) => {
    await axios
      .get(
        `${apiUrl}/task?search=${queries.search}&searchOn=${queries.searchOn}&sortBy=${queries.sortBy}&order=${queries.order}&page=${queries.page}&limit=${queries.limit}`
      )
      .then((res) => {
        if (res.data.tasks) {
          console.log(res.data.message);
          setTasks(res.data.tasks);
          setTaskData({
            totalPages: res.data.totalPages,
            totalTasks: res.data.totalTasks,
            currentPage: res.data.currentPage,
          });
          setMessage({ error: "", message: res.data.message });
        } else if (!res.data.tasks) {
          setTasks([]);
          setTaskData({ totalPages: 0, totalTasks: 0, currentPage: 0 });
          setMessage({ error: res.data.error, message: "" });
        }
      })
      .catch((err) => {
        console.error(err.message);
        setMessage({ error: err.message, message: "" });
      });
  };

  //Jelenleg bejelentkezett aktív felhasználó adatainek lekérése GET REQUEST
  const getLoggedInUser = async (
    setUser: Dispatch<SetStateAction<UserProp | null>>
  ) => {
    await axios
      .get(apiUrl + "/user/loggedInUser")
      .then((res) => setUser(res.data)) //DTO adatok beállítása
      .catch((err) => console.error(err));
  };

  // Bejelentkezett állapot lekérdezése GET REQUEST
  const getLoggedIn = async (
    setLoggedIn: Dispatch<SetStateAction<boolean>>,
    setLoading: Dispatch<SetStateAction<boolean>>
  ) => {
    await axios
      .get(apiUrl + "/user/loggedIn")
      .then((res) => setLoggedIn(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  //Chat résztvevők lekérése aktuális felhasználó id-ja alapján GET REQUEST
  const getByParticipants = async (
    user: UserProp,
    setChatRooms: Dispatch<SetStateAction<ChatProp[]>>
  ) => {
    await axios
      .get(`${apiUrl}/chat/getByParticipants/${user._id}`)
      .then((res) => setChatRooms(res.data))
      .catch(console.error);
  };

  //Chat lekérése felhasználók id-ja alapján GET REQUEST
  const getOneByParticipants = async (
    user1_id: string,
    user2_id: string,
    isOnlyId: boolean,
    navigate: NavigateFunction
  ) => {
    await axios
      .get(
        apiUrl +
          `/chat/getOneByParticipants?user1=${user1_id}&user2=${user2_id}&onlyId=${isOnlyId}`
      )
      .then((res: AxiosResponse<{ chatId: string }>) =>
        navigate(`/profile/chat/${res.data.chatId}`)
      );
  };

  //Blokkolt felhasználók lekérése aktuális felhasználó id-ja alapján
  const getBlockedUsers = async (
    user_id: string,
    setBlockedUsers: Dispatch<SetStateAction<FriendshipProp[]>>
  ) => {
    await axios
      .get(apiUrl + `/friendship/getBlocked/${user_id}`)
      .then((res: AxiosResponse<FriendshipProp[]>) => {
        const filteredData = res.data.filter(
          (r: FriendshipProp) => r.status === "blocked"
        );
        setBlockedUsers(filteredData);
        console.log(filteredData);
      });
  };

  //Chat lekérése id alapján GET REQUEST
  const getChatById = async (
    _id: string,
    setChatRoom: Dispatch<SetStateAction<ChatRoomProp | null>>
  ) => {
    await axios
      .get(apiUrl + "/chat/" + _id)
      .then((res) => setChatRoom(res.data))
      .catch((err) => console.error(err));
  };

  //Egyetlen felhasználó lekérése id alapján GET REQUEST
  const getOneUserById = async (
    user_id: string,
    setUser: Dispatch<SetStateAction<UserProp | null>>
  ) => {
    await axios
      .get(apiUrl + "/user/" + user_id)
      .then((res: AxiosResponse<UserProp>) => {
        setUser(res.data);
      })
      .catch((err) => console.error({ error: err.response.data.error }));
  };

  //Barátság lekérése felhasználók id-ja alapján GET REQUEST
  const getOneFriendshipByParticipants = async (
    user1_id: string,
    user2_id: string,
    setFriendship: Dispatch<SetStateAction<FriendshipProp | null>>,
    setMessage: Dispatch<SetStateAction<{ message: string; error: string }>>
  ) => {
    await axios
      .get(
        apiUrl +
          `/friendship/getOneFriendship?user1=${user1_id}&user2=${user2_id}`
      )
      .then((res) => setFriendship(res.data))
      .catch((err) => {
        setMessage({ error: err.response.data.error, message: "" });
      });
  };

  //Folyamat lekérése felhasználó id alapján GET REQUEST
  const getTaskProcessByUserId = async (
    user_id: string,
    setProcess: Dispatch<SetStateAction<Process | null>>,
    setSelectedTask: Dispatch<SetStateAction<TaskProp | null>>
  ) => {
    await axios
      .get(`${apiUrl}/task/process/${user_id}`)
      .then((res) => {
        const taskProc = res.data[0];
        if (!taskProc) return;

        console.log(taskProc);

        setProcess(res.data[0]);
        setSelectedTask(taskProc.taskId);

        localStorage.setItem(
          "currentTask",
          JSON.stringify({
            id: res.data.taskId,
            startTime: new Date(taskProc.startTime).getTime(),
            duration: taskProc.duration,
          })
        );
      })
      .catch((err) => console.error("Process fetch error", err));
  };

  //Több feladat lekérése több id alapján GET REQUEST
  const getTasksByIds = async (
    task_ids: string[],
    setTasks: Dispatch<SetStateAction<TaskProp[] | null>>
  ) => {
    await axios
      .post(`${apiUrl}/task/taskByIds`, task_ids)
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err));
  };

  //Több barátság lekérése több id alapján GET REQUEST
  const getFriendshipsByIds = async (
    user_id: string,
    user_friendships: string[],
    setFriendships: Dispatch<SetStateAction<FriendshipProp[] | null>>,
    setMessage: Dispatch<SetStateAction<{ error: string; message: string }>>,
    queries: QueryProps
  ) => {
    await axios
      .post(
        apiUrl +
          `/friendship/getAllFriendshipForUser/${user_id}?search=${queries.search}&searchOn=${queries.searchOn}&sortBy=${queries.sortBy}&order=${queries.order}&page=${queries.page}&limit=${queries.limit}`,
        {
          friendshipIds: user_friendships,
        }
      )
      .then((res) => {
        setFriendships(res.data.length === 0 ? [] : res.data);
      })
      .catch((err) => {
        setFriendships(null);
        setMessage(() => ({ error: err.response.data.error, message: "" }));
        console.error(err);
      });
  };

  //Összes felhasználó lekérése GET REQUEST
  const getUsers = async (
    setUser: Dispatch<SetStateAction<UserProp[] | null>>,
    setMessage: Dispatch<SetStateAction<{ error: string; message: string }>>,
    queries: QueryProps
  ) => {
    await axios
      .get(
        `${apiUrl}/user?search=${queries.search}&searchOn=${queries.searchOn}&sortBy=${queries.sortBy}&order=${queries.order}&page=${queries.page}&limit=${queries.limit}`
      )
      .then((res) => setUser(res.data))
      .catch((err) =>
        setMessage({ message: "", error: err.response.data.error })
      );
  };

  /*------------------------------DELETE REQUESTS----------------------------------*/

  //Feladat törlése id alapján DELETE REQUEST
  const deleteTaskById = async (
    task_id: string,
    setTasks: Dispatch<SetStateAction<TaskProp[] | null>>,
    setMessage: Dispatch<SetStateAction<{ error: string; message: string }>>
  ) => {
    await axios
      .delete(apiUrl + "/task/" + task_id)
      .then((res) => {
        console.log("Deleted!");
        setTasks(res.data.tasks);
        setMessage({ message: res.data.message, error: "" });
      })
      .catch((err) =>
        setMessage({ error: err.response.data.error, message: "" })
      );
  };

  //Feladat folyamat törlése id alapján DELETE REQUEST
  const deleteTaskProcessById = async (process_id: string) => {
    await axios
      .delete(`${apiUrl}/task/process/${process_id}`)
      .then((res) => {
        console.log(res.data.message);
      })
      .catch((err) => console.error(err.response.data.message));
  };

  return {
    getLogout,
    postLogin,
    postReactivateAccount,
    postRegistration,
    postResetPassword,
    postRestoreAccount,
    postRestorePassword,
    postTask,
    postTaskProcess,
    putAvatar,
    putUsername,
    putBanner,
    putPassword,
    putEmail,
    putTask,
    putTaskToday,
    putTaskProcessById,
    getLoggedIn,
    getByParticipants,
    getOneByParticipants,
    getChatById,
    getOneUserById,
    getOneFriendshipByParticipants,
    getLoggedInUser,
    getBlockedUsers,
    getCompleteProcess,
    getTaskProcessByUserId,
    getTasksByIds,
    getUsers,
    getTaskWithQuery,
    getFriendshipsByIds,
    deleteAccount,
    deleteTaskById,
    deleteTaskToday,
    deleteAllTaskToday,
    deleteTaskProcessById,
  };
}
