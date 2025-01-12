import { NextResponse } from "next/server";
import { getUserCollection, getDatabaseCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
    try {
      const { databaseId, annotators, conversations } = await req.json();
  
      // Log received payload
      console.log("Received Payload:", {
        databaseId,
        annotators,
        conversations,
      });
  
      // Validate databaseId
      if (!databaseId) {
        console.error("Missing or invalid databaseId");
        return NextResponse.json(
          { error: "Missing or invalid databaseId" },
          { status: 400 }
        );
      }
  
      // Validate conversations
      if (!Array.isArray(conversations) || conversations.length === 0) {
        console.error("Missing or invalid conversations array");
        return NextResponse.json(
          { error: "Missing or invalid conversations array" },
          { status: 400 }
        );
      }
  
      // Validate annotators
      if (!Array.isArray(annotators) || annotators.length === 0) {
        console.error("Missing or invalid annotators array");
        return NextResponse.json(
          { error: "Missing or invalid annotators array" },
          { status: 400 }
        );
      }
  
      const usersCollection = await getUserCollection();
      const databaseCollection = await getDatabaseCollection();
  
      // Validate database existence
      const database = await databaseCollection.findOne({
        _id: new ObjectId(databaseId),
      });
      if (!database) {
        console.error("Database not found for databaseId:", databaseId);
        return NextResponse.json({ error: "Database not found" }, { status: 404 });
      }
  
      // Validate and filter the provided annotators
      const validAnnotators = await usersCollection
        .find(
          { username: { $in: annotators }, assignedDatabases: databaseId },
          { projection: { _id: 1 } }
        )
        .toArray();
  
      if (validAnnotators.length === 0) {
        console.error(
          "No valid annotators found for databaseId:",
          databaseId,
          "Annotators:",
          annotators
        );
        return NextResponse.json({
          error: "No valid annotators found for the selected database.",
        });
      }
  
      // Evenly distribute conversations among selected annotators
      const annotatorIds = validAnnotators.map((annotator) =>
        annotator._id.toString()
      );
      const assignedTasks: Record<string, string[]> = {};
  
      conversations.forEach((conversationId, index) => {
        const annotatorIndex = index % annotatorIds.length;
        const annotatorId = annotatorIds[annotatorIndex];
        if (!assignedTasks[annotatorId]) assignedTasks[annotatorId] = [];
        assignedTasks[annotatorId].push(conversationId);
      });
  
      // Update annotators with tasks
      for (const annotatorId of Object.keys(assignedTasks)) {
        await usersCollection.updateOne(
          { _id: new ObjectId(annotatorId) },
          {
            $addToSet: {
              assignedConversations: { $each: assignedTasks[annotatorId] },
            },
          }
        );
      }
  
      return NextResponse.json({
        message: "Conversations distributed automatically.",
        assignedTasks,
      });
    } catch (error) {
      console.error("Error in auto-division API:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
  