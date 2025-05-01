import { createContext, useContext } from "react";
import { UserProp } from "../../../Tools/types";

//Saját hook létrehozása jelenlegi felhasználói adatok lekérdezésére
export const UserContext = createContext<UserProp | null>(null);
export const useUser = () => useContext(UserContext);
