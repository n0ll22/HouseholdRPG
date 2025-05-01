import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Importing useNavigate and useParams
import { Api } from "../../../Tools/QueryFunctions"; //API hívások

/*
Rövid magyarázat:
  Ez a React Arrow Function Component azt a célt szolgálja, hogy az emailben elküldött 
  jelszó visszaállítás link erre az oldalra navigálja a felhasználót, ahol új jelszót
  tud magának létrehozni. A megadott adatokat a szerver oldal ellenőrnzi, és helyessége
  alapján engedi tovább a felhasználót a bejelentkezés felületére. */

// A regisztráció típusai
interface InputProp {
  password: string;
  passwordAgain: string;
}

//React Arrow Function Component
const ResetPassword: React.FC = () => {
  //Token lekérdezése az URL linkből hook-kal
  const { token } = useParams();

  //Jelszó tárolása useState hook-kal
  const [password, setPassword] = useState<InputProp>({
    password: "",
    passwordAgain: "",
  });
  //Felhasználói üzenetek tárolása useState hook-kal
  const [message, setMessage] = useState<string | null>(null);
  //Oldal navigálás useNavigate hook-kal
  const navigate = useNavigate();

  //Az új jelszó kezelésének metódusa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //Form alap viselkedésének megakadályozása
    //Csak akkor igaz, ha minden változó rendelkezik adattal
    if (token && password.password && password.passwordAgain) {
      // Adatok átadása a szerver oldalnak POST kéréssel
      await Api().postResetPassword(
        token,
        password.password,
        password.passwordAgain,
        setMessage,
        navigate
      );
    }
  };

  // JSX megjelenítés: Regsztráció megvalósítása Form-mal.
  // A közzététel során az új jelszó kezeléséhez szükséges metódus hívódik
  return (
    <form
      className="w-full h-screen flex items-center justify-center "
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <h1 className="text-4xl font-bold mb-20">Set new password</h1>
        <div className="flex flex-col">
          {/* Jelszó megadása egyszer */}
          <label htmlFor="password" className="mb-1">
            Password:
          </label>

          <input
            className="border rounded-md p-1"
            placeholder="#&@123!?"
            type="password"
            name="password"
            id="password"
            min={8}
            value={password.password}
            onChange={(e) =>
              setPassword((prev) => ({ ...prev, password: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-col">
          {/* Jelszó megadása még egyszer */}
          <label htmlFor="passwordAgain" className="mb-1">
            Password Again:
          </label>

          <input
            className="border rounded-md p-1"
            placeholder="#&@123!?"
            type="password"
            name="passwordAgain"
            min={8}
            id="passwordAgain"
            value={password.passwordAgain}
            onChange={(e) =>
              setPassword((prev) => ({
                ...prev,
                passwordAgain: e.target.value,
              }))
            }
          />
        </div>
        {/* Hiba esetén üzenet megjelenítése */}
        <p>{message}</p>
        <input
          type="submit"
          value="Submit"
          className="p-2 border bg-white w-full rounded-md cursor-pointer hover:bg-gray-200"
        />
      </div>
    </form>
  );
};

export default ResetPassword; //React Komponens exportálása a többi komponens számára
