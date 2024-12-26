import { NextResponse } from "next/server";
import { getCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

export async function GET(req: Request, context: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
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

export async function POST(req: Request) {
  const { id, annotation } = await req.json();

  if (!id || !annotation || !annotation.title || !annotation.type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          annotations: {
            _id: new ObjectId(),
            title: annotation.title,
            type: annotation.type,
            options: annotation.options || [],
            answers: annotation.answers || null,
          } as any,           /* eslint-disable-line @typescript-eslint/no-explicit-any */
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to add annotation" }, { status: 500 });
    }

    return NextResponse.json({ message: "Annotation added successfully" });
  } catch (error) {
    console.error("Error adding annotation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete an annotation
export async function DELETE(req: Request) {
  try {
    const { id, annotationId } = await req.json();

    if (!id || !annotationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ObjectId.isValid(id) || !ObjectId.isValid(annotationId)) {
      return NextResponse.json({ error: "Invalid ID(s)" }, { status: 400 });
    }

    const collection = await getCollection();

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { annotations: { _id: new ObjectId(annotationId) } } } as any           /* eslint-disable-line @typescript-eslint/no-explicit-any */
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to delete annotation" }, { status: 500 });
    }

    return NextResponse.json({ message: "Annotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting annotation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// Annotator response update
export async function PATCH(req: Request) {
  try {
    const { id, annotationId, updatedFields } = await req.json();

    // Validate required fields
    if (!id || !annotationId || !updatedFields) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ObjectId.isValid(id) || !ObjectId.isValid(annotationId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const collection = await getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id), "annotations._id": new ObjectId(annotationId) },
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
      return NextResponse.json({ error: "Failed to update annotation" }, { status: 500 });
    }

    return NextResponse.json({ message: "Annotation updated successfully" });
  } catch (error) {
    console.error("Error updating annotation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
