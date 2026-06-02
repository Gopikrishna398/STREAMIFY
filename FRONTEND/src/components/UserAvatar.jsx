import { useState } from "react";
import { UserRoundIcon } from "lucide-react";

const UserAvatar = ({ name, src, className = "w-10 rounded-full" }) => {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <div className="avatar placeholder">
      <div className={`${className} bg-primary text-primary-content`}>
        {src && !hasImageError ? (
          <img src={src} alt={name || "User avatar"} onError={() => setHasImageError(true)} />
        ) : (
          <UserRoundIcon className="size-1/2 opacity-75" />
        )}
      </div>
    </div>
  );
};

export default UserAvatar;
