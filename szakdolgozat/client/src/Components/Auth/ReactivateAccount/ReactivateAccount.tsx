//Importálások
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Api } from "../../../Tools/QueryFunctions"; //API hívások

// ----- Rövid magyarázat -----
/* 
  Ez a React Arrow Function Component egy átirányításért felelős oldal. 
  Amennyiben a felhasználó szeretné újraaktválni a fiókját, az url linkben 
  álló "token" alapján fogja eldönteni a szerver oldal, hogy tovább haladhat-e
  a felhasználó. Amennyiben nem, azt a szerver oldal üzenet formájában jelezni fogja a kliens felé.
*/
function ReactivateAccount() {
  //Az url-ben található :token lekérdezése
  const { token } = useParams();
  //Navigáláshoz szükséges hook
  const navigate = useNavigate();
  //Üzenet tárolása és jelzése useState hook-kal
  const [message, setMessage] = useState("Redirecting...");

  //API hívás, amely megállapítja a token érvényességét
  //Ha helyes a token, az oldal át fog irányítani a bejelentkezéshez
  useEffect(() => {
    if (token) {
      Api().postReactivateAccount(token, navigate, setMessage);
    }
  }, []);
  //JSX: Az üzenet megjelenítése
  return <div>{message}</div>;
}

export default ReactivateAccount;
