import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

// Ez a react komponens felelős a felhasználó tapasztalati ponjának megjelenítéséért
// Az oldal kiszámítja jelenlegi szintet és grafikusan ábrázolja a folyamatot.

//Átadott változók típusa
interface Props {
  renderHUD: {
    // aktuális szint grafikus állapota
    lvl: number;
    startExp: number;
    nextLvlExp: number;
    currentExp: number;
  };
  setRenderHUD: Dispatch<SetStateAction<Props["renderHUD"] | null>>; // grafikus megjelenítés állapotának beállítása
  isLevelUp: boolean; //szintlépés státusza
  setIsLevelUp: Dispatch<SetStateAction<boolean>>; //szintlépés státuszának beállítása
}

const HUD: React.FC<Props> = ({ renderHUD, isLevelUp, setIsLevelUp }) => {
  const [progress, setProgress] = useState<number>(0); // haladási sáv állapota

  //Jelenlegi szint kiszámítása normalizálással
  const calculateCurrentProgress = (k1: number, k2: number, c: number) => {
    let normalized = (c - k1) / (k2 - k1);

    setProgress(normalized * 100);
  };
  //renderelés tapasztalat érték változásra
  useEffect(() => {
    calculateCurrentProgress(
      renderHUD.startExp,
      renderHUD.nextLvlExp,
      renderHUD.currentExp
    );
  }, [renderHUD.currentExp]);

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full ">
        <div className="flex  justify-between">
          <p className="p-2 m-2 min-w-10 text-center bg-white rounded-md drop-shadow-md">
            {renderHUD.startExp} XP
          </p>

          <p className="p-2 m-2 min-w-10 text-center bg-white rounded-md drop-shadow-md">
            LVL: {renderHUD.lvl}
          </p>

          <p className="p-2 m-2 min-w-10 text-center bg-white rounded-md drop-shadow-md">
            {renderHUD.nextLvlExp} XP
          </p>
        </div>
        <div className="bg-gray-300 w-full flex items-center">
          <div
            className={`bg-green-500 h-6 flex justify-end items-center duration-500 transition-all`}
            style={{
              width: `${progress}%`,
            }}
          >
            {progress > 50 && ( //ha a szint haladása a felénél nagyobb, szám megjelenítése a bal oldalon
              <p className={`text-white px-1`}>{renderHUD.currentExp} XP</p>
            )}
          </div>
          {progress < 50 && ( //ha a szint haladása kisebb mint a fele, akkor szám megjelenítése a jobb oldalon
            <p className={`text-black px-1`}>{renderHUD.currentExp} XP</p>
          )}
        </div>
      </div>
      {/* Szintlépés jelzése */}
      {isLevelUp && (
        <div className="absolute flex items-center justify-center w-full h-full top-0 left-0 bg-black/50 z-10">
          <div className="w-96 h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-between p-5">
            <h2 className="text-4xl font-bold text-center">Congratulation!</h2>
            <p>
              You've reached{" "}
              <span className="font-semibold">level {renderHUD.lvl}</span>!
            </p>
            <button
              className="p-2 w-16 bg-gray-100 rounded-md border border-black hover:bg-white transition"
              onClick={() => setIsLevelUp(false)}
            >
              Cool!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HUD;
