//Importálások
import React, { useState } from "react";
import pfps from "../../Tools/pfps.json";

/*
Rövid magyarázat:
  Ez a React Arrow Funtion Component a felhasználó profilképének megváltoztatását
  teszi lehetővé. A felhasználó azonosítója alapján fogja a szerver oldal megváltoztatni
  a profilképet.
 */

//A Komponenshez szükséges prop
interface Props {
  handleAvatarChange: (avatar: string) => void;
}

//React Arrow Function Component
// - _id: Felhasználó azonosító
const AvatarSelector: React.FC<Props> = ({ handleAvatarChange }) => {
  //Rendereléshez szükséges useState hook változó
  const [isActive, setIsActive] = useState<boolean>(true);

  //JSX Komponens
  return (
    isActive && (
      <div className="absolute left-0 top-0 w-full h-full bg-gray-800/50 z-30 flex flex-col justify-center items-center transition-all">
        <div className="w-96 sm:w-80 h-96 bg-gray-100 rounded-2xl">
          <h1 className="w-full text-center py-5 text-2xl font-bold">
            Choose your avatar!
          </h1>

          {/* Profilképek listázása. Az elemre kattintásra lefut a kezelő metódus */}
          <div className="flex flex-wrap justify-center items-center ">
            {pfps.map((a, index) => (
              <div
                className="w-20 h-20 m-1 bg-cover bg-center rounded-lg hover:outline hover:outline-2 hover:cursor-pointer"
                key={index}
                style={{
                  backgroundImage: `url("/img/pfps/${a}")`,
                }}
                onClick={() => handleAvatarChange(a)}
              ></div>
            ))}
          </div>
        </div>
        <div className="p-2">
          {/* "Mégse" opció*/}
          <input
            className="bg-gray-100 p-2 rounded-lg font-semibold hover:bg-red-300 transition active:bg-red-500 active:translate-y-1"
            type="button"
            value="Cancel"
            onClick={() => {
              setIsActive(false);
              window.location.reload();
            }}
          />
        </div>
      </div>
    )
  );
};

export default AvatarSelector;
