"use client";

import { useEffect, useState } from "react";
import { User, Database, Conversation } from "@/types/conversations";
import { toast } from "react-toastify";

export default function TeamsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [databases, setDatabases] = useState<Database[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [assignedConversations, setAssignedConversations] = useState<
    Record<string, Record<string, { teamId: string; conversations: string[] }>>
  >({});
  const [selectedAnnotators, setSelectedAnnotators] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [intersectionCount, setIntersectionCount] = useState<number>(0);
  const [showDivisionModal, setShowDivisionModal] = useState<boolean>(false);
  const [showManualAssignModal, setShowManualAssignModal] =
    useState<boolean>(false);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [selectedConversationIds, setSelectedConversationIds] = useState<
    string[]
  >([]);
  const [conversationSearch, setConversationSearch] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    // Fetch users
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data || []);

        // Populate assignedConversations with teamId and conversations
        const assignedData: Record<
          string,
          Record<string, { teamId: string; conversations: string[] }>
        > = {};

        data.forEach((user: User) => {
          if (user.assignedConversations) {
            Object.entries(user.assignedConversations).forEach(
              ([databaseId, details]) => {
                if (!assignedData[databaseId]) assignedData[databaseId] = {};
                assignedData[databaseId][user.username] = {
                  teamId: details.teamId,
                  conversations: details.conversations,
                };
              }
            );
          }
        });

        setAssignedConversations(assignedData);
        toast.success("Users loaded successfully!");
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        toast.error("Failed to load users.");
      });

    // Fetch databases
    fetch("/api/admin/databases")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDatabases(data);
          toast.success("Databases loaded successfully!");
        } else {
          throw new Error("Invalid database data");
        }
      })
      .catch((err) => {
        console.error("Error fetching databases:", err);
        toast.error("Failed to load databases.");
        setDatabases([]);
      });
  }, []);

  const handleAddUser = async () => {
    if (!username.trim()) {
      toast.error("Please enter a valid username");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, role: "annotator" }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error || "Failed to add user");
        return;
      }

      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          setUsers(data);
          setUsername("");
          toast.success(`User "${username}" added successfully!`);
        })
        .catch((err) => {
          console.error("Error fetching users:", err);
          toast.error("Failed to reload users.");
        });
    } catch (err) {
      console.error("Error adding user:", err);
      toast.error("Internal Server Error");
    }
  };

  const fetchConversationsByDatabase = async (databaseId: string) => {
    try {
      toast.info("Loading conversations...");
      const res = await fetch(
        `/api/conversations/by-database?databaseId=${databaseId}`
      );
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const data = await res.json();
      setConversations(data);
      toast.success("Conversations loaded successfully!");
    } catch (error) {
      console.error("Error fetching conversations by database:", error);
      setConversations([]);
      toast.error("Failed to load conversations.");
    }
  };

  const handleSearchConversations = (query: string) => {
    setConversationSearch(query);
    const filtered = conversations.filter((conv) =>
      conv._id.includes(query.trim())
    );
    setFilteredConversations(filtered);
  };

  const handleAssignConversations = async () => {
    if (
      selectedAnnotators.length === 0 ||
      selectedConversationIds.length === 0 ||
      selectedDatabase === ""
    ) {
      toast.error("Please select annotators, conversations, and a database");
      return;
    }

    // Map selected annotators to usernames
    const annotatorUsernames = users
      .filter((user) => selectedAnnotators.includes(user._id))
      .map((user) => user.username);

    const payload = {
      userIds: selectedAnnotators, // Use user IDs for the backend
      usernames: annotatorUsernames, // Pass usernames for display purposes
      databaseId: selectedDatabase,
      conversations: selectedConversationIds,
    };

    try {
      const res = await fetch("/api/admin/users-division/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error || "Failed to assign conversations");
        return;
      }

      const { teamId } = await res.json();

      // Update the assignedConversations state with the new teamId
      const updatedAssignments = { ...assignedConversations };
      annotatorUsernames.forEach((username) => {
        if (!updatedAssignments[selectedDatabase]) {
          updatedAssignments[selectedDatabase] = {};
        }
        updatedAssignments[selectedDatabase][username] = {
          teamId,
          conversations: selectedConversationIds,
        };
      });

      setAssignedConversations(updatedAssignments);

      toast.success(`Conversations assigned successfully! Team ID: ${teamId}`);
      setShowManualAssignModal(false);
      setSelectedAnnotators([]);
      setSelectedConversationIds([]);
    } catch (err) {
      console.error("Error assigning conversations:", err);
      toast.error("Internal Server Error");
    }
  };

  const handleAutoDivideTasks = async () => {
    if (selectedAnnotators.length === 0 || selectedDatabase === "") {
      toast.error("Please select annotators and a database");
      return;
    }

    const payload = {
      databaseId: selectedDatabase,
      annotators: selectedAnnotators,
      conversations: conversations.map((conv) => conv._id),
      numAnnotatorsPerConversation: intersectionCount, // Updated to match the new API
    };

    try {
      const res = await fetch("/api/admin/users-division/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error || "Failed to divide tasks");
        return;
      }

      const { teamId, assignedTasks } = await res.json();

      if (!assignedTasks || typeof assignedTasks !== "object") {
        console.error("Invalid assignedTasks response:", assignedTasks);
        toast.error("Invalid response format");
        return;
      }

      // Update the assignedConversations state
      const updatedAssignments = { ...assignedConversations };
      selectedAnnotators.forEach((annotator) => {
        if (!updatedAssignments[selectedDatabase]) {
          updatedAssignments[selectedDatabase] = {};
        }
        updatedAssignments[selectedDatabase][annotator] =
          assignedTasks[annotator] || [];
      });

      setAssignedConversations(updatedAssignments);
      toast.success(`Tasks divided successfully! Team ID: ${teamId}`);
      setShowDivisionModal(false);
    } catch (err) {
      console.error("Error dividing tasks:", err);
      toast.error("Internal Server Error");
    }
  };

  const handleDatabaseChange = (databaseId: string) => {
    setSelectedDatabase(databaseId);
    fetchConversationsByDatabase(databaseId); // Fetch conversations for the selected database
  };

  const openDivisionModal = () => {
    setSelectedAnnotators([]);
    setIntersectionCount(0);
    setShowDivisionModal(true);
  };

  return (
    <div className="p-6 w-screen">
      {/* Users Section */}
      <h2 className="text-xl font-semibold mb-2">Users</h2>
      <table className="table-auto w-full border-collapse border border-gray-400 mb-4">
        <thead>
          <tr>
            <th
              className="border border-gray-400 px-4 py-2"
              style={{ width: "30%" }}
            >
              Username
            </th>
            <th className="border border-gray-400 px-4 py-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border border-gray-400 px-4 py-2">
                {user.username}
              </td>
              <td className="border border-gray-400 px-4 py-2">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-row">
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded p-2 mb-2 w-1/2 mr-2"
        />
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add User
        </button>
      </div>

      {/* Add Users Button */}
      <div className="mb-4"></div>

      <h1 className="text-2xl font-bold mb-4">Annotators Management</h1>

      {/* Assigned Conversations View */}
      {databases.length > 0 &&
      assignedConversations &&
      Object.keys(assignedConversations).length > 0 ? (
        databases.map((database) => {
          const databaseName = database.name || "Unknown Database";
          const data = assignedConversations[database._id];

          if (!data) return null;

          const teams = Object.entries(data || {}).reduce(
            (acc, [username, details]) => {
              if (details && details.teamId) {
                const { teamId, conversations } = details;
                if (!acc[teamId]) acc[teamId] = [];
                acc[teamId].push({ username, conversations });
              }
              return acc;
            },
            {} as Record<
              string,
              { username: string; conversations: string[] }[]
            >
          );

          return (
            <div key={database._id} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{databaseName}</h2>
              {Object.entries(teams).map(([teamId, members]) => (
                <div key={teamId}>
                  <h3 className="text-lg font-medium mb-2">
                    Team ID: {teamId}
                  </h3>
                  <table className="table-auto w-full border-collapse border border-gray-400 mb-4">
                    <thead>
                      <tr>
                        <th className="border border-gray-400 px-4 py-2">
                          Username
                        </th>
                        <th className="border border-gray-400 px-4 py-2">
                          Conversations
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(({ username, conversations }) => (
                        <tr key={username}>
                          <td className="border border-gray-400 px-4 py-2">
                            {username}
                          </td>
                          <td className="border border-gray-400 px-4 py-2">
                            <details>
                              <summary>Show Conversations</summary>
                              <ul className="mt-2 list-disc pl-4">
                                {conversations?.map((conv) => (
                                  <li key={conv}>{conv}</li>
                                ))}
                              </ul>
                            </details>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          );
        })
      ) : (
        <p className="text-gray-500">No assigned conversations found.</p>
      )}

      <div>
        {/* Task Division Section */}
        <button
          onClick={openDivisionModal}
          className="mr-3 mb-4 px-4 py-2 bg-green-500 text-white rounded"
        >
          Manage Auto Task Division
        </button>

        {/* Task Manual Assign Section */}
        <button
          onClick={() => setShowManualAssignModal(true)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Manually Assign Conversations
        </button>
      </div>

      {/* Division Modal */}
      {showDivisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-blue-500 rounded p-6 w-3/4">
            <h3 className="text-xl font-bold mb-4">Task Division</h3>

            {/* Select Database */}
            <label className="block text-sm font-semibold mb-2">
              Select Database:
            </label>
            <select
              value={selectedDatabase}
              onChange={(e) => handleDatabaseChange(e.target.value)}
              className="border rounded p-2 mb-4 w-1/2"
            >
              <option value="">Select a database</option>
              {databases.map((db) => (
                <option key={db._id} value={db._id}>
                  {db.name}
                </option>
              ))}
            </select>

            {/* Select Annotators */}
            <label className="block text-sm font-semibold mb-2">
              Select Annotators:
            </label>
            <div className="mb-4">
              {users
                .filter((user) => user.role === "annotator")
                .map((user) => (
                  <label
                    key={user._id}
                    className="inline-flex items-center mr-4"
                  >
                    <input
                      type="checkbox"
                      value={user.username}
                      onChange={(e) =>
                        setSelectedAnnotators((prev) =>
                          e.target.checked
                            ? [...prev, e.target.value]
                            : prev.filter(
                                (annotator) => annotator !== e.target.value
                              )
                        )
                      }
                      className="mr-2"
                    />
                    {user.username}
                  </label>
                ))}
            </div>

            {/* Number of Annotators Per Conversation Input */}
            <label className="block text-sm font-semibold mb-2">
              Number of Annotators Per Conversation:
            </label>
            <input
              type="number"
              min={1}
              max={selectedAnnotators.length}
              value={intersectionCount}
              onChange={(e) => setIntersectionCount(Number(e.target.value))}
              className="border rounded p-2 mb-4 w-1/2"
            />

            {/* Buttons */}
            <div className="flex justify-end">
              <button
                onClick={handleAutoDivideTasks}
                className="px-4 py-2 bg-purple-500 text-white rounded"
              >
                Auto Divide
              </button>
              <button
                onClick={() => setShowDivisionModal(false)}
                className="ml-2 px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Assign Modal */}
      {showManualAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-blue-500 rounded p-6 w-3/4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Manual Assign Conversations
            </h3>

            {/* Select Database */}
            <label className="block text-sm font-semibold mb-2">
              Select Database:
            </label>
            <select
              value={selectedDatabase}
              onChange={(e) => handleDatabaseChange(e.target.value)}
              className="border rounded p-2 mb-4 w-full"
            >
              <option value="">Select a database</option>
              {databases.map((db) => (
                <option key={db._id} value={db._id}>
                  {db.name}
                </option>
              ))}
            </select>

            {/* Select Annotators */}
            <label className="block text-sm font-semibold mb-2">
              Select Annotators:
            </label>
            <div className="mb-4">
              {users
                .filter((user) => user.role === "annotator")
                .map((user) => (
                  <label
                    key={user._id}
                    className="inline-flex items-center mr-4 mb-2"
                  >
                    <input
                      type="checkbox"
                      value={user._id}
                      onChange={(e) =>
                        setSelectedAnnotators((prev) =>
                          e.target.checked
                            ? [...prev, e.target.value]
                            : prev.filter((id) => id !== e.target.value)
                        )
                      }
                      className="mr-2"
                    />
                    {user.username}
                  </label>
                ))}
            </div>

            {/* Search and Select Conversations */}
            <label className="block text-sm font-semibold mb-2">
              Search and Select Conversations:
            </label>
            <input
              type="text"
              placeholder="Search conversations"
              value={conversationSearch}
              onChange={(e) => handleSearchConversations(e.target.value)}
              className="border rounded p-2 mb-4 w-full"
            />
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <label
                    key={conv._id}
                    className="inline-flex items-center mb-2"
                  >
                    <input
                      type="checkbox"
                      value={conv._id}
                      onChange={(e) =>
                        setSelectedConversationIds((prev) =>
                          e.target.checked
                            ? [...prev, e.target.value]
                            : prev.filter((id) => id !== e.target.value)
                        )
                      }
                      className="mr-2"
                    />
                    {conv._id}
                  </label>
                ))
              ) : (
                <p className="text-gray-500">No conversations found.</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleAssignConversations}
                className="px-4 py-2 bg-green-500 text-white rounded mr-2"
              >
                Assign
              </button>
              <button
                onClick={() => {
                  setShowManualAssignModal(false);
                  setSelectedConversationIds([]);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
