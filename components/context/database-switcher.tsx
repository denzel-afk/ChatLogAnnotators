// components/DatabaseSwitcher.tsx
import { useDatabase } from "@/components/context/database-context";

const DatabaseSwitcher = () => {
  const { databases, activeDatabase, switchDatabase } = useDatabase();

  const handleDatabaseChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const databaseId = event.target.value;
    const database = databases.find((db) => db.databaseId === databaseId);
    if (database) {
      await switchDatabase(database);
    }
  };

  return (
    <div className="database-switcher">
      <select
        value={activeDatabase?.databaseId || ""}
        onChange={handleDatabaseChange}
        className="border border-muted focus:ring-primary focus:border-primary rounded-md p-2 bg-secondary text-secondary-foreground"
      >
        <option value="">Select a database</option>
        {databases.map((db) => (
          <option key={db.databaseId} value={db.databaseId}>
            {db.name || "Unnamed Database"}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DatabaseSwitcher;
