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

  const handleAddUser = async () => {
    if (!username) {
      setError("Username cannot be empty");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, role: "annotator" }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setError(error || "Failed to add user");
        return;
      }

      const newUser = await res.json();
      setUsers((prev) => [...prev, newUser]);
      setUsername("");
      setError(null);
    } catch (err) {
      console.error("Error adding user:", err);
      setError("Internal Server Error");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teams</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Enter annotator username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded p-2 w-1/2"
        />
        <button
          onClick={handleAddUser}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add User
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <h2 className="text-xl font-semibold mb-2">Annotators</h2>
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
