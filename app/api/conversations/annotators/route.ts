import { NextResponse } from "next/server";
import { getUserCollection, getDatabaseCollection, getCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";
import { switchDatabase } from "@/lib/databaseManager";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");
    const assignmentTitle = url.searchParams.get("assignmentTitle");

    if (!username || !assignmentTitle) {
      return NextResponse.json({ error: "Missing username or assignmentTitle" }, { status: 400 });
    }

    const userCollection = await getUserCollection();
    const user = await userCollection.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let databaseId: string | null = null;
    let assignedConversations: string[] = [];

    for (const dbId in user.assignedConversations) {
      const assignments = user.assignedConversations[dbId].assignments;
      const assignment = assignments.find((a: { assignmentTitle: string }) => a.assignmentTitle === assignmentTitle);

      if (assignment) {
        databaseId = dbId;
        assignedConversations = assignment.conversations;
        break;
      }
    }

    if (!databaseId) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const databaseCollection = await getDatabaseCollection();
    const database = await databaseCollection.findOne({ _id: new ObjectId(databaseId) });
    if (!database) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    // Check if a database switch is necessary
    if (user.activeDatabaseId !== databaseId) {
      await userCollection.updateOne({ username }, { $set: { activeDatabaseId: databaseId } });
    }
    switchDatabase({
      uri: database.uri,
      databaseId: database.databaseId.toString(),
      containerId: database.containerId,
      name: database.name
    });

    // Fetch conversations using the updated database information
    const collection = await getCollection();
    const conversationIds = assignedConversations.map(id => new ObjectId(id));
    const conversationsArray = await collection.find({ _id: { $in: conversationIds } }).toArray();
    const conversations = conversationsArray.map(doc => ({
      _id: doc._id.toString(),
      person: doc.person || "Unknown",
      firstInteraction: doc.stime?.text || "No start time",
      lastInteraction: doc.last_interact?.text || "No last interaction",
      messages: doc.messages || [],
      annotations: doc.annotations || []
    }));

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("[ERROR] Handling request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
