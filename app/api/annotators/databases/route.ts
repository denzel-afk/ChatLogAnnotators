import { NextResponse } from "next/server";
import { getUserCollection } from "@/lib/cosmosdb";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const userCollection = await getUserCollection();
    const user = await userCollection.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "annotator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const assignmentsList: { assignmentTitle: string; databaseId: string }[] = [];

    for (const [databaseId, data] of Object.entries(user.assignedConversations || {}) as [string, { assignments?: { assignmentTitle: string }[] }][]) {
      if (data.assignments) {
        for (const assignment of data.assignments) {
          assignmentsList.push({
            assignmentTitle: assignment.assignmentTitle,
            databaseId: databaseId,
          });
        }
      }
    }

    return NextResponse.json(assignmentsList);
  } catch (error) {
    console.error("[API] Error fetching assignments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
