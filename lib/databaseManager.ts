import dotenv from "dotenv";

dotenv.config({ path: ".env.local" })

let activeDatabase: {
    uri: string;
    databaseId: string;
    containerId: string;
    name: string;
} | null = null;

const defaultDatabase = {
    uri: process.env.DEFAULT_COSMOSDB_ENDPOINT || "",
    databaseId: process.env.DEFAULT_COSMOSDB_DATABASE ||"",
    containerId: process.env.DEFAULT_COSMOSDB_CONTAINER || "",
    name: process.env.DEFAULT_DATABASE_NAME || ""
}

export const getActiveDatabase = () => {
    return activeDatabase || defaultDatabase;
  };

export const switchDatabase = (newDatabase:
    { uri: string; databaseId: string; containerId: string, name: string }) => {
    activeDatabase = newDatabase;
}

export const getDefaultDatbase = () => defaultDatabase;