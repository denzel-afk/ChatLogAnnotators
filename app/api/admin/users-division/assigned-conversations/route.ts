// API for fetching conversations based on the division of the database

import { NextResponse } from "next/server";
import { getUserCollection } from "@/lib/cosmosdb";

export async function GET(req: Request) {
  try {
    // Parse the username from cookies
    const cookies = req.headers.get("cookie") || "";
    const username = cookies
      .split("; ")
      .find((cookie) => cookie.startsWith("username="))
      ?.split("=")[1];

    if (!username) {
      return NextResponse.json({ error: "User not logged in" }, { status: 401 });
    }

    const usersCollection = await getUserCollection();

    // Find the user by username
    const user = await usersCollection.findOne({ username });

    if (!user || user.role !== "annotator") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Return the assigned conversations
    const assignedConversations = user.assignedConversations || [];
    return NextResponse.json(assignedConversations);
  } catch (error) {
    console.error("Error fetching assigned conversations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
