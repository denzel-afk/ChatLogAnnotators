import { MongoClient } from "mongodb";
import { getActiveDatabase } from "@/lib/databaseManager";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

let client: MongoClient | null = null;
let defaultClient: MongoClient | null = null;

const defaultConfig = {
  uri: process.env.DEFAULT_COSMOSDB_ENDPOINT || "",
  databaseId: process.env.DEFAULT_COSMOSDB_DATABASE || "",
  containerId: process.env.DEFAULT_COSMOSDB_CONTAINER || "",
  userCollection: process.env.DEFAULT_COSMOSDB_USER_COLLECTION || "",
  name: process.env.DEFAULT_DATABASE_NAME || ""
};

if (!defaultConfig.uri || !defaultConfig.databaseId || !defaultConfig.userCollection) {
  throw new Error("Missing required environment variables for default database");
}

const getClient = async () => {
  if (!client) {
    const activeDatabase = getActiveDatabase();

    if (!activeDatabase) {
      throw new Error("No active database set. Please switch a database first.");
    }

    client = new MongoClient(activeDatabase.uri);
    await client.connect();
  }
  return client;
};

const getDefaultClient = async () => {
  if (!defaultClient) {
    defaultClient = new MongoClient(defaultConfig.uri);
    await defaultClient.connect();
  }
  return defaultClient;
};

export const getCollection = async () => {
  const activeDatabase = getActiveDatabase();
  console.log("[getCollection] Current active database:", activeDatabase);

  if (!activeDatabase) {
    throw new Error("No active database set. Please switch a database first.");
  }

  const mongoClient = await getClient();
  const database = mongoClient.db(activeDatabase.databaseId);
  console.log("[getCollection] Using database:", activeDatabase.databaseId);

  const collection = database.collection(activeDatabase.containerId);
  console.log("[getCollection] Using collection:", activeDatabase.containerId);

  return collection;
};



export const getUserCollection = async () => {
  try {
    const mongoClient = await getDefaultClient();
    const database = mongoClient.db(defaultConfig.databaseId);
    const collection = database.collection(defaultConfig.userCollection);
    return collection;
  } catch (error) {
    console.error("Failed to get user collection:", error);
    throw error;
  }
};

export const getDatabaseCollection = async () => {
  try {
    const mongoClient = await getDefaultClient();
    const database = mongoClient.db(defaultConfig.databaseId);
    const collection = database.collection(process.env.DEFAULT_COSMOSDB_DATABASE_COLLECTION || "databases");
    return collection;
  } catch (error) {
    console.error("Failed to get database collection:", error);
    throw error;
  }
};
