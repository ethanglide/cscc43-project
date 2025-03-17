import { useEffect, useState } from "react";
import { UsersApi } from "../api/users-api";

export default function Home() {
  const [users, setUsers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function getUsers() {
    setLoading(true);

    const response = await UsersApi.getAllUsers();

    if ("error" in response) {
      setError(response.error);
    } else {
      setUsers(response);
    }

    setLoading(false);
  }

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="flex flex-col gap-5 items-center">
      <h2 className="text-2xl font-bold">Home</h2>
      <p>Welcome to the home page</p>
      {loading && <span className="loading loading-spinner"></span>}
      {error && <p className="text-error">{error}</p>}
      <ul className="list-disc list-inside">
        {users.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    </div>
  );
}
