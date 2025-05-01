import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Api } from "../../../QueryFunctions"; //API hívások

/**
 *
 * Rövid magyarázat:
 * Ez a React Arrow Function Component a regisztáció megvalósításáért felelős a felhasználói oldalon.
 * Az adatokat egy Form-on belül összegyűjti az weboldal, és a szerver oldal megállapítja hogy megfelelőek-e
 * a felhasználó által megadott adatok. Ha igen, létrjeön a felhasználó, és a session, aminek a
 * titkosított token-jét sütiként fog a webböngésző tárolni.
 */

//Regisztráció változók típusa
interface RegisterData {
  email: string;
  username: string;
  password: string;
  passwordAgain: string;
}

//Regisztáció React Arrow Function Component
const Register: React.FC = () => {
  //UseState hook változók
  //Hibák tárolása
  const [message, setMessage] = useState<{ error: string; message: string }>({
    error: "",
    message: "",
  });
  //Regisztrációs adatok tárolása
  const [registrationData, setData] = useState<RegisterData>({
    email: "",
    username: "",
    password: "",
    passwordAgain: "",
  });
  //Oldal navigálásához szükséges hook
  const navigate = useNavigate();

  //Regisztárció kezelése
  const handleRegistration = async (e: FormEvent) => {
    //Ha minden mező ki van töltve, akkor küldés az adatbázishoz
    e.preventDefault();
    //HTTP POST kérés az adatbázis felé
    if (registrationData) {
      await Api().postRegistration(registrationData, navigate, setMessage);
    }
  };

  //JSX megjelenítés
  return (
    <main className="flex w-full items-start xl:justify-center xl:items-center">
      {/* A regisztráció Form-mal megy végbe. A közzététel során hívódik a regisztrációt
      kezelő metódus*/}
      <form
        className="flex flex-col w-1/2 h-screen xl:w-2/3 justify-center items-center"
        onSubmit={handleRegistration}
        autoComplete="off"
      >
        <h1 className="p-2 mb-5 text-4xl font-bold">Start your adventure!</h1>
        <div className="w-1/2 sm:w-full border-l-2 p-2">
          <div className="flex flex-col mb-4">
            {/* Email megadása */}
            <label htmlFor="email" className="mb-1">
              Email:
            </label>

            <input
              className="border rounded-md p-1"
              placeholder="joe.doe@email.com"
              type="email"
              id="email"
              name="email"
              value={registrationData.email}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev!,
                  email: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex flex-col mb-4">
            {/* Felhasználónév megadása */}
            <label htmlFor="name" className="mb-1">
              Username:
            </label>

            <input
              className="border rounded-md p-1"
              placeholder="John Doe"
              type="text"
              id="name"
              name="name"
              value={registrationData.username}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev!,
                  username: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col mb-4">
            {/* Jelszó kétszeres megadása */}
            <label htmlFor="password" className="mb-1">
              Password:
            </label>

            <input
              className="border rounded-md p-1"
              placeholder="#&@123!?"
              type="password"
              name="password"
              id="password"
              value={registrationData.password}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev!,
                  password: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col mb-8">
            {/*Jelszó ismételt megadása*/}
            <label htmlFor="password_again" className="mb-1">
              Password Again:
            </label>

            <input
              className="border rounded-md p-1"
              placeholder="#&@123!?"
              type="password"
              name="password_again"
              id="password_again"
              value={registrationData.passwordAgain}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev!,
                  passwordAgain: e.target.value,
                }))
              }
            />
          </div>
          <input
            type="submit"
            name="submitLogin"
            id="submitLogin"
            className=" border rounded-lg w-full bg-white cursor-pointer hover:bg-gray-200 transition p-1"
          />
          {message.error && <p className="text-red-700">{message.error}</p>}
        </div>
        <p className="mt-10">Already a member?</p>
        <p className="border rounded-lg text-center bg-white cursor-pointer hover:bg-gray-200 transition">
          {/* Bejelentkezéshez navigálás, ha nincs fiók */}
          <Link className="p-4" to="/">
            Login
          </Link>{" "}
        </p>
      </form>

      <div
        className="w-1/2 xl:hidden h-screen bg-cover bg-center "
        style={{
          backgroundImage: `url("/img/login-wallpaper-4.jpg")`,
        }}
      ></div>
    </main>
  );
};

export default Register; //Register komponens exportálása
