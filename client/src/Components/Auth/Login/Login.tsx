// ----- Importálások ------
import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginData } from "../../../Tools/types"; //Típus import
import { useAuth } from "../AuthContext/useAuth"; //Bejelentkezési állapot import
import { Api } from "../../../Tools/QueryFunctions"; // API hívások

// ----- Rövid magyarázat ------
/* 
   Ez a React Arrow Function Component a bejelentkezés felhasználói oldaláért felel 
   A ha minden adat megfelelő, akkor a kliens küldeni fog egy POST kérést a szerver felé, ami pedig
   az adatok helyességének megfelelően (felhasználónév, jelszó alapján) fogja eldönteni, hogy bejelenkezhet-e
   a felhasználó. Ha igen, akkor sütik használatával fog a felhasználó bejelentkezni. 
*/

const Login: React.FC = () => {
  //UseState hook változók létrehozása
  //Bejelentkezési adatok tárolása
  const [loginData, setLoginData] = useState<LoginData>({
    username: "",
    password: "",
  });
  //Bejelentkezési hibák tárolása
  const [message, setMessage] = useState<string | null>(null);
  //Bejelentkezés állapota
  const [loggedIn, setLoggedIn] = useState(false);
  //Bejelentkezés állapotának lekérdezése egyedi hook-kal
  const { getLoggedIn } = useAuth();
  //Oldalon való navigálásért felelős hook
  const navigate = useNavigate();

  //Bejelentkezés állapotát lekérdező metódus
  const checkLoginStatus = async () => {
    //Aszinkronos lekérdezés
    await getLoggedIn(); //Megvárja a választ a bejelentkezésre
    setLoggedIn(true); //Ha van válasz, akkor legyen Igaz, hogy bejelentkezett a felhasználó
  };

  //Bejelentkezésés felelős metódus
  const handleLogin = async (e: FormEvent) => {
    //Alapértelmezett események megelőzése
    e.preventDefault();

    //Adatok meglételének ellenőrzése
    if (loginData.username && loginData.password) {
      //HTTP POST kérés az adatbázis felé
      await Api().postLogin(
        loginData,
        getLoggedIn,
        checkLoginStatus,
        navigate,
        setMessage
      );
    }
  };

  //JSX megjelenítés
  return (
    <main className="flex w-full items-start xl:justify-center xl:items-center">
      {/* A bejelentkezés űrlappal történik, és közzététel során fog hívódni a bejelentkezést
    kezelő függvény. */}
      <form
        className="flex flex-col w-1/2 h-screen xl:w-2/3 justify-center items-center"
        onSubmit={handleLogin}
      >
        <h1 className="p-2 mb-5 text-4xl font-bold">
          Continue your adventure!
        </h1>
        {/* Csak akkor jelenjen meg, ha nincs a felhasználó jelentkezve. */}
        {!loggedIn && (
          <div className="w-1/2 sm:w-full border-l-2 p-2">
            <div className="flex flex-col mb-4">
              {/* Felhasználónév megadása */}
              <label htmlFor="username-input" className="mb-1">
                Username:
              </label>

              <input
                id="username-input"
                className="border rounded-md p-1"
                placeholder="John Doe"
                type="text"
                name="username"
                value={loginData.username}
                onChange={(e) =>
                  setLoginData((prev) => ({
                    ...prev!,
                    username: e.target.value,
                  }))
                }
                autoComplete="true"
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="password-input" className="mb-1">
                Password:
              </label>

              <input
                id="password-input"
                className="border rounded-md p-1"
                placeholder="#&@123!?"
                type="password"
                name="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData((prev) => ({
                    ...prev!,
                    password: e.target.value,
                  }))
                }
              />
            </div>

            {/* Hiba megjelenítése, ha van */}
            {message && (
              <p className="text-red-700 mb-4 flex flex-col">
                <span>{message} </span>
                {message.includes("deleted") ? (
                  <Link
                    className="text-left underline text-black"
                    to={"/restoreAccount"}
                  >
                    Click here to restore it!
                  </Link>
                ) : message.includes("password") ? (
                  <Link
                    to={"/restorePassword"}
                    className="text-left underline text-black"
                  >
                    Forgot password?
                  </Link>
                ) : (
                  message
                )}
              </p>
            )}

            {/* Bejelenzkezés megkezdése */}
            <input
              type="submit"
              name="submit"
              className=" border rounded-lg w-full bg-white cursor-pointer hover:bg-gray-200 transition"
            />
          </div>
        )}
        {/* Regisztráció opció felajánlása, ha még nem regisztrált a felhasználó az oldalra */}
        <p className="mt-10">New around here?</p>
        <p className="border text-center rounded-lg  bg-white cursor-pointer hover:bg-gray-200 transition">
          <Link className="p-4" to="/register">
            Register
          </Link>
        </p>
      </form>
      {/* Háttér */}
      <div
        className="w-1/2 h-screen xl:hidden bg-cover bg-center"
        style={{
          backgroundImage: `url("/img/login-wallpaper-6.1.jpg")`,
        }}
      ></div>
    </main>
  );
};

export default Login; //Login Komponens exportálása
