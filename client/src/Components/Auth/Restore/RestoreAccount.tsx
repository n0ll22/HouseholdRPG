import React, { FormEvent, useState } from "react";
import { Api } from "../../../Tools/QueryFunctions"; //API hívások

/* 
Rövid magyarázat:
  Ez a React Arrow Function Component azért felelős, hogy a törölt felhasználó visszaállíthassa a
  fiókját az esetben, ha meggondolná magát. A fiókok adatbiztonság szempontból nem törlődnek, 
  hanem blokkolt állapotba kerülnek. Ez az oldal a megfelelő email címre küldet a szerver oldallal 
  egy visszaigazoló email-t.
*/

//React Arrow Function Component
const RestoreAccount: React.FC = () => {
  //Email input tárolása useState hook-kal
  const [email, setEmail] = useState<string>("");
  //Kommunikációhoz szükséges üzenetek tárolása useState hook-kal
  const [message, setMessage] = useState<string | null>(null);

  //Email elküldésének kezeléséért felelős metódus
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Form alap viselkedésének megakadályozása
    //Amennyiben van adat, API kérés küldése a szerver felé
    if (email) {
      await Api().postRestoreAccount(email, setMessage);
    }
  };

  //JSX megjelenítés
  return (
    <main className="grid grid-cols-2">
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <h1 className="text-6xl mb-20 font-bold">Restoration</h1>
        {/* Email megadása Form-mal. Közzététel során meghívja a kezelő medust */}
        <form
          className="flex flex-col items-center"
          onSubmit={(e) => handleSubmit(e)}
        >
          <div className="flex flex-col">
            {/*Email megadása*/}
            <label htmlFor="email" className="mb-1">
              Email:
            </label>

            <input
              className="border rounded-md p-1"
              placeholder="#&@123!?"
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="my-10">We will send a code to restore your account</p>
          {/* Hiba esetén üzenet megjelenítése */}
          {message && <p className="mt-10">{message}</p>}
          <input
            className="p-2 w-fit bg-white rounded-md border"
            type="submit"
            value="Submit"
          />
        </form>
      </div>
      <div
        className="bg-center bg-cover h-screen w-full"
        style={{
          backgroundImage: "url(/img/resurrection.png)",
        }}
      ></div>
    </main>
  );
};

export default RestoreAccount; //Komponens exportálása a többi komponens felé
