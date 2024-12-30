import { NextResponse } from "next/server";
import { getCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

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

export async function POST(req: Request) {
  try {
    const { annotation } = await req.json();

    if (!annotation || !annotation.title || !annotation.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const collection = await getCollection();
    await collection.updateMany(
      { annotations: { $exists: false } }, 
      { $set: { annotations: [] } }
    );

    // Create new annotation
    const newAnnotation = {
      _id: new ObjectId(),
      title: annotation.title,
      type: annotation.type,
      options: annotation.options || [],
      answers: annotation.answers || null,
    };

    const result = await collection.updateMany(
      {}, // Apply to all documents
      { $push: { annotations: newAnnotation } as any } /* eslint-disable-line @typescript-eslint/no-explicit-any */
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to add annotation to any conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Annotation added successfully to all conversations",
    });
  } catch (error) {
    console.error("Error adding annotation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}



// remove 
export async function DELETE(req: Request) {
  try {
    const { annotationId } = await req.json();

    if (!annotationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ObjectId.isValid(annotationId)) {
      return NextResponse.json({ error: "Invalid annotation ID" }, { status: 400 });
    }

    const collection = await getCollection();

    // Remove the annotation if the field exists
    const result = await collection.updateMany(
      { annotations: { $exists: true } },
      { $pull: { annotations: { _id: new ObjectId(annotationId) } as any } } /* eslint-disable-line @typescript-eslint/no-explicit-any */
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Annotation not found or already removed" }, { status: 404 });
    }

    return NextResponse.json({ message: "Annotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting annotation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

//update annotations
export async function PATCH(req: Request) {
  try {
    const { annotationId, updatedFields } = await req.json();

    if (!annotationId || !updatedFields) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ObjectId.isValid(annotationId)) {
      return NextResponse.json({ error: "Invalid annotation ID" }, { status: 400 });
    }

    const collection = await getCollection();

    const result = await collection.updateMany(
      { "annotations._id": new ObjectId(annotationId) },
      {
        $set: Object.entries(updatedFields).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [`annotations.$.${key}`]: value,
          }),
          {}
        ),
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Annotation not found or not updated" }, { status: 404 });
    }

    return NextResponse.json({ message: "Annotation updated successfully" });
  } catch (error) {
    console.error("Error updating annotation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
