"use client";

import { useDatabase } from "@/app/(protected)/admin/layout";

export default function DatabaseSwitcher() {
  const { activeDatabase, databases, switchDatabase } = useDatabase();

  return (
    <div className="flex items-center space-x-2">
      <label
        htmlFor="databaseSwitcher"
        className="text-sm font-medium text-foreground"
      >
        Active Database:
      </label>
      <select
        id="databaseSwitcher"
        value={activeDatabase?.uri || ""}
        onChange={(e) => {
          const selectedDatabase = databases.find(
            (db) => db.uri === e.target.value
          );
          if (selectedDatabase) switchDatabase(selectedDatabase);
        }}
        className="border border-muted focus:ring-primary focus:border-primary rounded-md p-2 bg-secondary text-secondary-foreground"
      >
        {databases.map((db) => (
          <option key={db.uri} value={db.uri}>
            {db.name || "Unnamed Database"}
          </option>
        ))}
      </select>
    </div>
  );
}
