// ----- Importálások -----
import React, { useEffect, useRef } from "react";
import { MessageProp, UserProp } from "../../Tools/types"; //Típusok

/*
  ----- Rövid magyarázat -----
  Ez a React Arrow Funtion Component felelős a chat üzenetek helyes megjelenítéséért. Az üzenetek az üzenet adatai alapján
  rendeződnek a chat megfelelő bal vagy jobb oldalára. (mindig az aktuális felhasználó a jobboldali)
*/

// ----- Típusok -----

//Chat üzenetek típusai
type Props = {
  loggedInUser: UserProp;
  messages: MessageProp[];
};

// ----- React Komponens -----

/* Komponens átadott változói:
  - messages: a chat üzenetei
  - loggedInUser: az aktuális felhasználó
*/
const ChatMessages: React.FC<Props> = ({ messages, loggedInUser }) => {
  //Referencia a chat div eleméhez, amely a görgetést fogja segíteni
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // useEffect, ami az első renderelésre fog mount-olni
  // ez a callback le fog görgetni a chat legaljára
  useEffect(() => {
    //Ha létezik a div elem amire referálunk akkor görgessünk a div legaljáig
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, []); // Üres feltétel (dependency): első render során hívódik

  // useEffect amely új üzenet esetén legörget a referált div elem legaljáig
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]); //useEffect hívása üzenet változása esetén
  // JSX megjelenítés
  return (
    //Referálunk a chat div elementjére
    <div
      ref={chatContainerRef}
      className="overflow-y-auto space-y-4 h-96 w-full p-2"
    >
      {/* Ha van üzenet, listázza ki */}
      {messages &&
        messages.map((m, index) => (
          <div
            key={index}
            className={`flex w-full ${
              m.senderId._id === loggedInUser._id ? "flex-row-reverse" : ""
            }`}
          >
            {/* Megfelelő felhasználó adatai megjelenítése feltételhez kötve
            Ha jelenlegi felhasználó id-ja megfelel, akkor a jelenlegi felhasználó adatait jelenítsük meg 
            Ha fordítva, akkor a másik felhasználó adatait
            */}
            <img
              className={`w-10 h-10 ${
                m.senderId._id === loggedInUser._id ? "ml-2" : "mr-2"
              }  rounded-md`}
              src={`/img/pfps/${m.senderId.avatar}`}
              alt=""
            />
            {/* Tailwind segítségével képes a \n vagy <br/> sortörést megjeleníteni a üzenet tartalmán belül */}
            <p
              className={`whitespace-pre-wrap flex items-center min-h-10 max-w-96 p-2 
            rounded-md border overflow-hidden break-all ${
              m.senderId._id === loggedInUser._id
                ? "bg-white"
                : "bg-red-400 text-white border-none"
            }`}
            >
              {m.content}
            </p>
          </div>
        ))}
    </div>
  );
};

export default ChatMessages; //ChatMessage exportálás a többi komponens részére
