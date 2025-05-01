import React, { createContext, useEffect, useState } from "react";
import { Api } from "../../../Tools/QueryFunctions"; //API hívások

/**
Rövid magyarázat:
  Ez a React Context a felhasználó hitelesítéséért felelős. Megállapítja, hogy a
  felhasználó be van-e jelentkezve. A Contexten belüli gyermek (children) komponensek
  számára eléretővé válik a lekéérdezés, amelyet a Provider biztosít.
 */

// AuthContext típusok
interface AuthContextType {
  loggedIn: boolean;
  loading: boolean;
  getLoggedIn: () => Promise<void>;
}

//AuthContext Provider típus
interface AuthContextProviderProps {
  children: React.ReactNode;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//Provider metódusa
const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}) => {
  //A bejelentkezett állapot tárolása useState hook-kal
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  //Folyamat betöltésének jelzése useState hook-kal
  const [loading, setLoading] = useState<boolean>(true);

  // Felhasználó belejentkezett állapotának megállapítása API hívással
  const getLoggedIn = async () => {
    await Api().getLoggedIn(setLoggedIn, setLoading);
  };

  useEffect(() => {
    getLoggedIn();
  }, []);

  /*A provdernek szüksége van a következőkre:
  - loggedIn: A bejentkezés állapota
  - loading: A bejelentkezés folyamat állapota
  - getLoggedIn: bejelentkezési állapot lekérdezés metódusa

  A Context Provideren belüli gyermekek számára elérhetőek ezek a változók
  */
  return (
    <AuthContext.Provider value={{ loggedIn, loading, getLoggedIn }}>
      {loading ? <p>Loading...</p> : children}
    </AuthContext.Provider>
  );
};

export default AuthContext; //Kontextus exportálása
export { AuthContextProvider }; //Provider exportálása
