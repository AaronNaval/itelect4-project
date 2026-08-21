import { useParams } from 'react-router';

export const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div>
      <h2>User Profile Page</h2>
      <p>Currently viewing profile for User ID: <strong>{userId}</strong></p>
    </div>
  );
};