import { NextResponse } from "next/server";
import { getCollection } from "@/lib/cosmosdb";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get("query") || ""; // Get the 'query' parameter
    const collection = await getCollection();

    let filter = {};
    if (searchQuery) {
      filter = {
        $or: [
          { "person": { $regex: searchQuery, $options: "i" } },
          { "stime.text": { $regex: searchQuery, $options: "i" } },
          { "last_interact.text": { $regex: searchQuery, $options: "i" } },
          { "messages.content": { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const documents = await collection.find(filter).toArray();

    const conversations = documents.map((doc) => ({
      _id: doc._id.toString(),
      Person: doc.person || "Unknown",
      firstInteraction: doc.stime?.text || "No start time",
      lastInteraction: doc.last_interact?.text || "No last interaction",
      messages: doc.messages || [],
    }));

    if (conversations.length === 0) {
      return NextResponse.json({ message: "No conversations found" }, { status: 404 });
    }

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
