import React from "react";

// Rövid magyarázat:
// Többi felhasználó avatar/profilkép megjelenítése

// Átadott változó típusa
interface Props {
  avatar: string;
}

//React Komponens
const PlayerAvatar: React.FC<Props> = ({ avatar }) => {
  return (
    <div
      className="w-40 h-40 bg-cover bg-center flex-shrink-0"
      style={{
        backgroundImage: `url("/img/pfps/${avatar}")`,
      }}
    ></div>
  );
};

export default PlayerAvatar;
