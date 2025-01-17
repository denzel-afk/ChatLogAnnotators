import { MongoClient } from "mongodb";

export async function getConversationsFromDatabase(
  uri: string,
  databaseId: string,
  containerId: string
) {
  let client: MongoClient | null = null;

  try {
    // Initialize MongoDB client
    client = new MongoClient(uri);
    await client.connect();

    // Access the database and container
    const database = client.db(databaseId);
    const collection = database.collection(containerId);

    // Fetch all conversations
    const conversations = await collection.find({}).toArray();

    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw new Error("Unable to fetch conversations.");
  } finally {
    // Ensure client is closed
    if (client) {
      await client.close();
    }
  }
}
