"use client";

import { useEffect, useState } from "react";

interface User {
  _id: string;
  username: string;
  role: string;
}

export default function TeamsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Teams</h1>
      <ul className="list-disc pl-6">
        {users.map((user) => (
          <li key={user._id}>
            {user.username} ({user.role})
          </li>
        ))}
      </ul>
    </div>
  );
}
