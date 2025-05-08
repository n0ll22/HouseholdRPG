import React from "react";

// Ez a react komponens megjeleníti a megtekintett felhasználó nevét

interface Props {
  username: string;
}

const UserUsername: React.FC<Props> = ({ username }) => {
  return (
    <>
      <h2
        className="flex w-fit text-4xl font-bold mb-10 rounded-lg"
        id="username"
      >
        {username}
      </h2>
    </>
  );
};

export default UserUsername;
