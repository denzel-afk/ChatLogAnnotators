// this API is for fetching the data of the conversations from the database from the Id that is stored into the database's endpoint database. 
// the function is used later for the distribution of the conversations among the annotators.

import { NextResponse } from "next/server";
import { getDatabaseCollection } from "@/lib/cosmosdb";
import { getConversationsFromDatabase } from "@/lib/conversations";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const databaseId = url.searchParams.get("databaseId");

    if (!databaseId) {
      return NextResponse.json(
        { error: "Missing databaseId parameter" },
        { status: 400 }
      );
    }

    // Fetch database details from the collection
    const databaseCollection = await getDatabaseCollection();
    const database = await databaseCollection.findOne({ _id: new ObjectId(databaseId) });

    if (!database) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    const conversations = await getConversationsFromDatabase(
      database.uri,
      database.databaseId,
      database.containerId
    );

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error in fetching conversations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
