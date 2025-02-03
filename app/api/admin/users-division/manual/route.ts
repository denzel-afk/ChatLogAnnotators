import { NextResponse } from "next/server";
import { getUserCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { userIds, databaseId, conversations, assignmentName } = await req.json();

    if (
      !Array.isArray(userIds) ||
      !databaseId ||
      !Array.isArray(conversations) ||
      conversations.length === 0 ||
      !assignmentName
    ) {
      return NextResponse.json(
        { error: "Missing required fields: userIds, databaseId, conversations, assignmentName" },
        { status: 400 }
      );
    }

    const usersCollection = await getUserCollection();
    const assignmentTitle = assignmentName;

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

      await usersCollection.updateOne(
        { _id: objectId },
        {
          $push: {
            [`assignedConversations.${databaseId}.assignments`]: {
              assignmentTitle,
              conversations,
            },
          } as any, /* eslint-disable-line @typescript-eslint/no-explicit-any */
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      message: "Conversations assigned successfully",
      assignmentTitle,
    });
  } catch (error) {
    console.error("Error assigning conversations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
