import { NextResponse } from "next/server";
import { getUserCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function POST(req: Request) {
  try {
    const { databaseId, annotators, conversations, numAnnotatorsPerConversation } = await req.json();

    if (
      !databaseId ||
      !Array.isArray(annotators) ||
      !Array.isArray(conversations) ||
      typeof numAnnotatorsPerConversation !== "number"
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

    if (numAnnotatorsPerConversation > annotators.length) {
      return NextResponse.json(
        { error: "Number of annotators per conversation exceeds available annotators" },
        { status: 400 }
      );
    }

    const usersCollection = await getUserCollection();
    const teamId = `team_${Date.now()}`;

    const shuffledAnnotators = shuffleArray(annotators);

    const assignedTasks: Record<string, ObjectId[]> = {};
    
    conversations.forEach((conversationId) => {
      const selectedAnnotators = shuffleArray([...shuffledAnnotators]).slice(0, numAnnotatorsPerConversation);

      selectedAnnotators.forEach((annotator) => {
        if (!assignedTasks[annotator]) assignedTasks[annotator] = [];
        assignedTasks[annotator].push(new ObjectId(conversationId));
      });
    });

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
