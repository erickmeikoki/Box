import { Avatar, AvatarProps } from "@mui/material";
import { User } from "../types";

interface UserAvatarProps extends Omit<AvatarProps, "src"> {
  user: User;
  size?: number;
}

export default function UserAvatar({
  user,
  size = 40,
  ...props
}: UserAvatarProps) {
  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      "#1976d2", // blue
      "#2e7d32", // green
      "#d32f2f", // red
      "#ed6c02", // orange
      "#9c27b0", // purple
      "#2c3e50", // dark blue
      "#e91e63", // pink
      "#009688", // teal
    ];
    const index =
      username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  if (user.avatar) {
    return (
      <Avatar
        src={user.avatar}
        alt={user.username}
        sx={{ width: size, height: size }}
        {...props}
      />
    );
  }

  return (
    <Avatar
      alt={user.username}
      sx={{
        width: size,
        height: size,
        bgcolor: getAvatarColor(user.username),
      }}
      {...props}
    >
      {getInitials(user.username)}
    </Avatar>
  );
}
