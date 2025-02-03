import { MongoClient } from "mongodb";

export async function getConversationsFromDatabase(
  uri: string,
  databaseId: string,
  containerId: string
) {
  let client: MongoClient | null = null;

  try {
    client = new MongoClient(uri);
    await client.connect();

    const database = client.db(databaseId);
    const collection = database.collection(containerId);

    const conversations = await collection.find({}).toArray();

    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw new Error("Unable to fetch conversations.");
  } finally {
    if (client) {
      await client.close();
    }
  }
}
