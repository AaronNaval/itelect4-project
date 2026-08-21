import type { User } from "../types/index";

interface UserCardProps {
  user: User;
  onSelect: (user: User) => void;
}

function UserCard({ user, onSelect }: UserCardProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    onSelect(user);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    console.log("Note:", e.target.value);
  };

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={handleClick}>Select</button>
      <input onChange={handleNoteChange} placeholder="Quick note (demo only)" />
    </div>
  );
}

export default UserCard;