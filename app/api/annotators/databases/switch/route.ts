import { NextResponse } from "next/server";
import { getUserCollection } from "@/lib/cosmosdb";

export async function POST(req: Request) {
  try {
    const { username, databaseId, assignmentTitle } = await req.json();

    if (!username || !databaseId || !assignmentTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userCollection = await getUserCollection();
    const user = await userCollection.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await userCollection.updateOne(
      { username },
      {
        $set: {
          activeAssignment: assignmentTitle,
          activeDatabaseId: databaseId,
        },
      }
    );

    return NextResponse.json({ assignmentTitle, databaseId });
  } catch (error) {
    console.error("[API] Error switching assignment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
