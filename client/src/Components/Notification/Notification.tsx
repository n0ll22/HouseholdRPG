import React, { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ------ Rövid Magyarázat ------
    Ez a React Funtion Component  létrehoz egy kontextust, amely azt a célt szolgálja,
    hogy a gyerek komponensek elérhessék a értesítés metódusát. Ennek köszönhetően minden
    alárendelt komponens tud értesítéseket generálni, ha meghívják a notify function-t
 */

// ----- Átadott típusok -----

interface NotificationProp {
  id: string; //értesítés azonosító
  message: string; // értesítés üzenete
  link: string | null; // értesítés hivatkozás
}

interface NotificationContextProp {
  notify: (message: string, link: string | null) => void; // értesítés function-je
}

// ------ Kontextus létrehozása -----

const NotificationContext = createContext<NotificationContextProp | null>(null);
export const useNotification = () => useContext(NotificationContext)!;

// ----- Értesítés provider -----

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  //Értesítés állapot változó
  const [notification, setNotification] = useState<NotificationProp[]>([]);
  //Navigáció hook
  const navigate = useNavigate();

  // Callback hook használata gyakran ismétlődő feladat végzése miatt.
  // Az értesítés tartalmát módosítja és jeleníti meg 3 másodpercig
  const notify = useCallback((message: string, link: string | null) => {
    const id = (Math.random() * 1000).toString(); //uuid használata egyedi azonosítóhoz
    // Aktuális értesítés beállítása
    setNotification((prev) => [...prev, { id, message, link }]);
    //3 másodperces várakoztatás
    setTimeout(() => {
      //Utána értesítés törlése
      setNotification((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  // Ha van navigációs link, akkor kattintásra navigál
  const handleNavigation = (link: string | null) => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-10 right-10 z-50 space-y-4 w-64 rounded-lg bg-white drop-shadow-lg shadow-black hover:bg-gray-100 cursor-pointer">
        {notification.map((n, index) => (
          <div
            key={index}
            className="px-4 py-2 animate-fadeInFast space-y-2"
            onClick={() => handleNavigation(n.link)} //Navigálás meghívása
          >
            <h3 className="font-semibold text-xl">Notification</h3>
            <p dangerouslySetInnerHTML={{ __html: n.message }}></p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
