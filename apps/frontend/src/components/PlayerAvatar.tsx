import { useState } from "react";
type AvatarProps = {
  name: string;
  avatar?: string | null;
  isOpponent: boolean;
};

export const PlayerAvatar = ({ name, avatar, isOpponent }: AvatarProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
      {avatar && !imageError ? (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center text-white text-xl font-bold ${
          isOpponent ? "bg-red-600" : "bg-blue-600"
        }`}>
          {name.trim().charAt(0).toUpperCase() || "?"}
        </div>
      )}
    </div>
  );
};