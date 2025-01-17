import { NextResponse } from "next/server";
import { getUserCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { userIds, databaseId, conversations } = await req.json();

    if (
      !Array.isArray(userIds) ||
      !databaseId ||
      !Array.isArray(conversations) ||
      conversations.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields: userIds, databaseId, conversations" },
        { status: 400 }
      );
    }

    const usersCollection = await getUserCollection();

    // Iterate over all provided user IDs
    for (const userId of userIds) {
      let objectId;
      try {
        objectId = new ObjectId(userId);
      } catch (error) {
        console.error(`Invalid ObjectId: ${userId}`);
        continue;
      }

      const user = await usersCollection.findOne({ _id: objectId });

      if (!user) {
        console.error(`User with ID ${userId} not found`);
        continue;
      }

      // Check if the user already has a `teamId` for this database
      const assignedConversations = user.assignedConversations || {};
      const existingEntry = assignedConversations[databaseId];

      let teamId = existingEntry?.teamId;

      // If no teamId exists, generate a new one
      if (!teamId) {
        teamId = `manual_team_${Date.now()}`;
      }

      // Update the user's assignedConversations for this database
      await usersCollection.updateOne(
        { _id: objectId },
        {
          $set: {
            [`assignedConversations.${databaseId}`]: {
              teamId,
              conversations: existingEntry?.conversations
                ? Array.from(new Set([...existingEntry.conversations, ...conversations]))
                : conversations,
            },
          },
        }
      );
    }

    return NextResponse.json({
      message: "Conversations assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning conversations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
