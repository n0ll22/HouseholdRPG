import React, { Dispatch, FormEvent, SetStateAction } from "react";

// ----- Átadott változók típusa -----

interface Props {
  email: { input: string; render: string }; // email bemenete és megjelenítése
  setEmail: Dispatch<SetStateAction<{ input: string; render: string }>>; //email változóinak beállítása
  handleNewEmail: (e: FormEvent) => void; // új email kezelése
}

const ChangeEmail: React.FC<Props> = ({ email, setEmail, handleNewEmail }) => {
  //JSX megjelenítés
  return (
    <div className="w-72 py-10">
      <h2 className="text-2xl font-bold border-l-4 pl-2 mb-5">
        Change Email Address
      </h2>
      <form
        className="flex flex-col space-y-2"
        onSubmit={(e) => handleNewEmail(e)} // új email kezelése kattintásra
      >
        <p>Current Email Address: </p>
        <p className="font-semibold pb-4">{email.render}</p>
        <label htmlFor="newEmail">Enter New Email:</label>
        <input
          className="bg-white border p-2 rounded-md"
          type="email"
          placeholder={email.render}
          value={email.input}
          required
          onChange={(e) =>
            setEmail((prev) => ({ ...prev, input: e.target.value }))
          }
        />
        <input
          className="bg-white border p-2 rounded-md hover:bg-gray-200 active:bg-gray-300 transition"
          type="submit"
          value="Submit"
        />
      </form>
    </div>
  );
};

export default ChangeEmail;
