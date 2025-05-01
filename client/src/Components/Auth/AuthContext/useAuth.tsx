//Importálások
import { useContext } from "react";
import AuthContext from "./AuthContext";

//Saját hook létrehozása felhasználó bejelentkezési állapot hibakezelésre
//Ha a nincs a provideren belül a hook használata, akkor hibát dob
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
