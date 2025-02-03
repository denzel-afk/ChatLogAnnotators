import { NextResponse } from "next/server";
import { getCollection, getUserCollection, getDatabaseCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");
    const assignmentTitle = url.searchParams.get("assignmentTitle");

    console.log("[DEBUG] Incoming request: username =", username, "assignmentTitle =", assignmentTitle);

    if (!username || !assignmentTitle) {
      console.log("[ERROR] Missing username or assignmentTitle");
      return NextResponse.json({ error: "Missing username or assignmentTitle" }, { status: 400 });
    }

    const userCollection = await getUserCollection();
    const user = await userCollection.findOne({ username });

    if (!user) {
      console.log("[ERROR] User not found:", username);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("[DEBUG] User found:", user.username, "Role:", user.role);

    let databaseId: string | null = null;
    let assignedConversations: string[] = [];

    console.log("[DEBUG] Checking assignedConversations for assignment:", assignmentTitle);
    for (const dbId in user.assignedConversations) {
      const assignments = user.assignedConversations[dbId].assignments;
      const assignment = assignments.find((a: { assignmentTitle: string }) => a.assignmentTitle === assignmentTitle);

      if (assignment) {
        databaseId = dbId;
        assignedConversations = assignment.conversations;
        console.log("[DEBUG] Found assignment in databaseId:", databaseId);
        break;
      }
    }

    if (!databaseId) {
      console.log("[ERROR] Assignment not found for user:", username);
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const databaseCollection = await getDatabaseCollection();
    const database = await databaseCollection.findOne({ _id: new ObjectId(databaseId) });

    if (!database) {
      console.log("[ERROR] Database not found:", databaseId);
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    console.log("[DEBUG] Database found:", database.databaseId, "Name:", database.name);

    const collection = await getCollection();
    const conversationIds = assignedConversations.map((id: string) => new ObjectId(id));

    console.log("[DEBUG] Fetching conversations for IDs:", conversationIds);

    const documents = await collection.find({ _id: { $in: conversationIds } }).toArray();

    console.log("[DEBUG] Found conversations count:", documents.length);

    const conversations = documents.map((doc) => ({
      _id: doc._id.toString(),
      Person: doc.person || "Unknown",
      firstInteraction: doc.stime?.text || "No start time",
      lastInteraction: doc.last_interact?.text || "No last interaction",
      messages: doc.messages || [],
      annotations: doc.annotations || [],
    }));

    console.log("[DEBUG] Returning conversations:", conversations.length);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("[ERROR] Fetching conversations failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
