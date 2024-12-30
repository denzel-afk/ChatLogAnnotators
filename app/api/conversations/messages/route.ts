import { NextResponse } from "next/server";
import { getCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { annotation } = await req.json();

    if (!annotation || !annotation.title || !annotation.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const collection = await getCollection();

    const newAnnotation = {
      _id: new ObjectId(),
      title: annotation.title,
      type: annotation.type,
      options: annotation.options || [],
      answers: annotation.answers || null,
    };

    const result = await collection.updateMany(
      {},
      { $push: { "messages.$[].annotations": newAnnotation } as any}  /* eslint-disable-line @typescript-eslint/no-explicit-any */
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to add annotation to all messages" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Annotation added successfully to all messages in all conversations",
    });
  } catch (error) {
    console.error("Error adding annotation to all messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
