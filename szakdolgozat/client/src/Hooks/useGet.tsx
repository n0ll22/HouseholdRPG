import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";

//Adat interfésze
interface ApiResponse<T> {
  data: T | null; //az adat, amit a lekérés visszaad
  error: AxiosError | null; //esetleges hiba esetén error tárolása
  pending: boolean; //töltési folyamat jelzése
}

//Hook function
//Beállítjuk, milyen típusú lehet majd az adat amit visszakapunk
//GET esetén csak url-re van szükség
const useGet = <T,>(url: string): ApiResponse<T> => {
  //Az adat, amit visszaad a hook
  const [data, setData] = useState<T | null>(null);
  //Hiba esetén error állapot
  const [error, setError] = useState<AxiosError | null>(null);
  //Betöltés állapot jelzése
  const [pending, setPending] = useState<boolean>(true);

  useEffect(() => {
    //Jelezzük, hogy megkezdődött a kérés mountolása
    let isMounted = true;
    //Adatkérés function
    const fetchData = async () => {
      setPending(true);
      try {
        const res = await axios.get<T>(url); //GET REQUEST
        if (isMounted) {
          setData(res.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as AxiosError);
        }
      } finally {
        if (isMounted) {
          setPending(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { data, error, pending }; //Exportáljuk ki az adatokat
};

export default useGet;
