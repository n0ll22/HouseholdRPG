import React, { Dispatch, FormEvent, SetStateAction } from "react";

// ----- Átadott változók típusa -----

interface Props {
  password: {
    password: string;
    passwordAgain: string;
    currentPassword: string;
  };
  setPassword: Dispatch<
    SetStateAction<{
      password: string;
      passwordAgain: string;
      currentPassword: string;
    }>
  >;
  handleNewPassword: (e: FormEvent) => void;
}

const ChangePassword: React.FC<Props> = ({
  password, // jelszó objektum
  setPassword, // jelszó objektum beállítása
  handleNewPassword, // új jelszó kezelése
}) => {
  //JSX megjelenítés
  return (
    <div className="w-72 py-10">
      <h2 className="text-2xl font-bold border-l-4 pl-2 mb-5">
        Change Password
      </h2>
      <form
        className="flex flex-col space-y-2"
        onSubmit={(e) => handleNewPassword(e)} // új jelszó kezelése
      >
        {/* Jelszó megadása */}
        <label htmlFor="password">Enter Current Password:</label>
        <input
          className="bg-white border p-2 rounded-md"
          type="password"
          name="password"
          min={8}
          value={password.currentPassword}
          placeholder="#&old@!?"
          required
          onChange={(e) =>
            setPassword((prev) => ({
              ...prev,
              currentPassword: e.target.value,
            }))
          }
        />

        <label htmlFor="password">Enter New Password:</label>
        <input
          className="bg-white border p-2 rounded-md"
          type="password"
          name="password"
          min={8}
          value={password.password}
          placeholder="#&new@!?"
          required
          onChange={(e) =>
            setPassword((prev) => ({
              ...prev,
              password: e.target.value,
            }))
          }
        />
        <label htmlFor="passwordAgain">Password Again:</label>

        <input
          className="bg-white border p-2 rounded-md"
          type="password"
          name="passwordAgain"
          value={password.passwordAgain}
          min={8}
          required
          placeholder="#&new@!?"
          onChange={(e) =>
            setPassword((prev) => ({ ...prev, passwordAgain: e.target.value }))
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

export default ChangePassword;
