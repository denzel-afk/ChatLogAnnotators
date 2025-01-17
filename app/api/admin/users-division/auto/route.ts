import { NextResponse } from "next/server";
import { getUserCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function POST(req: Request) {
  try {
    const { databaseId, annotators, conversations, intersectionCount } = await req.json();

    if (
      !databaseId ||
      !Array.isArray(annotators) ||
      !Array.isArray(conversations) ||
      typeof intersectionCount !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (conversations.length === 0) {
      return NextResponse.json(
        { error: "No conversations provided" },
        { status: 404 }
      );
    }

    if (intersectionCount > conversations.length) {
      return NextResponse.json(
        { error: "Intersection count cannot exceed total conversations" },
        { status: 400 }
      );
    }

    const usersCollection = await getUserCollection();
    const teamId = `team_${Date.now()}`; // Generate a unique team ID based on the timestamp

    // Shuffle conversations to ensure randomness
    const shuffledConversations = shuffleArray(conversations);

    // Assign conversations
    const assignedTasks: Record<string, ObjectId[]> = {};
    const intersectionConversations = shuffledConversations
      .slice(0, intersectionCount)
      .map((id) => new ObjectId(id));
    const remainingConversations = shuffledConversations
      .slice(intersectionCount)
      .map((id) => new ObjectId(id));

    // Assign intersection conversations to all annotators
    annotators.forEach((annotator) => {
      assignedTasks[annotator] = [...intersectionConversations];
    });

    // Assign remaining conversations evenly
    remainingConversations.forEach((conversationId, index) => {
      const annotatorIndex = index % annotators.length;
      const annotator = annotators[annotatorIndex];
      assignedTasks[annotator].push(conversationId);
    });

    // Save assigned tasks with `teamId` in `assignedConversations`
    for (const annotator of Object.keys(assignedTasks)) {
      const updateQuery = {
        $set: {
          [`assignedConversations.${databaseId}`]: {
            teamId,
            conversations: assignedTasks[annotator],
          },
        },
      };

      await usersCollection.updateOne(
        { username: annotator },
        updateQuery,
        { upsert: true }
      );
    }

    return NextResponse.json({
      message: "Conversations assigned successfully",
      teamId,
      assignedTasks,
    });
  } catch (error) {
    console.error("Error in auto-division:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
