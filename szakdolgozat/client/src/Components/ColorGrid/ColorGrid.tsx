import React from "react";

// ----- Rövid magyarázat -----
/* Ez az oldal a felhasználó "banner" színét tudja beállítani*/

interface Props {
  data: string[]; //színek
  setColor: (x: string) => void; //színbeállítás kezelése
}

const ColorGrid: React.FC<Props> = ({ data, setColor }) => {
  //JSX: színek megjelenítése
  return (
    <>
      <div className="grid grid-cols-5 grid-rows-4 place-items-center gap-4 py-4">
        {data &&
          data.map((i, index) => (
            <div
              key={index}
              className={`${i} w-12 h-12 hover:scale-105 active:scale-95 transition rounded`}
              onClick={() => {
                setColor(i);
                window.location.reload();
              }}
            ></div>
          ))}
      </div>
    </>
  );
};

export default ColorGrid;
