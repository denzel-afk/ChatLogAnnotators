import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Database } from "@/types/conversations";

type DatabaseContextType = {
  activeDatabase: Database | null;
  setActiveDatabase: (db: Database | null) => void;
  databases: Database[];
  switchDatabase: (db: Database) => Promise<void>;
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined
);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const [activeDatabase, setActiveDatabase] = useState<Database | null>(null);
  const [databases, setDatabases] = useState<Database[]>([]);

  useEffect(() => {
    const fetchActiveDatabase = async () => {
      try {
        const response = await fetch("/api/admin/databases/active");
        const data = await response.json();
        setActiveDatabase(data);
      } catch (error) {
        console.error("Error fetching active database:", error);
      }
    };

    const fetchDatabases = async () => {
      try {
        const response = await fetch("/api/admin/databases");
        const data = await response.json();
        setDatabases(data);
      } catch (error) {
        console.error("Error fetching databases:", error);
      }
    };

    fetchDatabases();
    fetchActiveDatabase();
  }, []);

  const switchDatabase = async (database: Database) => {
    try {
      const response = await fetch("/api/admin/databases/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(database),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to switch database");
      }
      const updatedActiveDatabase = await response.json();
      setActiveDatabase(updatedActiveDatabase);
    } catch (error) {
      console.error("Error switching database:", error);
    }
  };

  return (
    <DatabaseContext.Provider
      value={{ activeDatabase, setActiveDatabase, databases, switchDatabase }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};
