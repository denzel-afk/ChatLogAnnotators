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

    const batchSize = 100; // Number of documents per batch
    let skip = 0;
    let hasMoreDocuments = true;
    let totalModified = 0;

    while (hasMoreDocuments) {
      // Fetch documents in batches
      const documents = await collection.find({}).skip(skip).limit(batchSize).toArray();

      if (documents.length === 0) {
        hasMoreDocuments = false;
        break;
      }

      // Process each document in the current batch
      for (const doc of documents) {
        const result = await collection.updateOne(
          { _id: doc._id },
          { $push: { "messages.$[].annotations": newAnnotation } as any } // eslint-disable-line @typescript-eslint/no-explicit-any
        );
        totalModified += result.modifiedCount;
      }

      skip += batchSize; // Move to the next batch
    }

    return NextResponse.json({
      message: `Annotation added successfully to all messages in ${totalModified} documents`,
    });
  } catch (error) {
    console.error("Error adding annotation to all messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
