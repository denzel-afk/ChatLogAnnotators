import { NextResponse } from "next/server";
import { getCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const { id } = params;

    const collection = await getCollection();
    const conversation = await collection.findOne({ _id: new ObjectId(id) });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
