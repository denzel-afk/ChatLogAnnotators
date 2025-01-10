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

// Annotator response update
export async function PATCH(req: Request) {
  try {
    const { id, annotationId, updatedAnswer, name } = await req.json();

    if (!id || !annotationId || !updatedAnswer || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ObjectId.isValid(id) || !ObjectId.isValid(annotationId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const collection = await getCollection();
    const conversation = await collection.findOne({ _id: new ObjectId(id) });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Find the annotation by ID
    const annotationIndex = conversation.annotations.findIndex(
      (annotation: any) => annotation._id.equals(new ObjectId(annotationId)) // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    if (annotationIndex === -1) {
      return NextResponse.json({ error: "Annotation not found" }, { status: 404 });
    }

    const annotation = conversation.annotations[annotationIndex];

    // Ensure the answers array exists
    if (!Array.isArray(annotation.answers)) {
      annotation.answers = [];
    }

    // Check if an answer from the user already exists
    const existingAnswerIndex = annotation.answers.findIndex(
      (answer: any) => answer.name === name // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    if (existingAnswerIndex !== -1) {
      // Update the existing answer
      const updatePath = `annotations.${annotationIndex}.answers.${existingAnswerIndex}.content`;
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { [updatePath]: Array.from(new Set(updatedAnswer)) } } // Use Set to avoid duplicate answers
      );
    } else {
      // Add a new answer
      const newAnswer = {
        _id: new ObjectId(),
        name,
        timestamp: Date.now(),
        content: Array.from(new Set(updatedAnswer)), // Avoid duplicate answers
      };

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { [`annotations.${annotationIndex}.answers`]: newAnswer } as any } // eslint-disable-line @typescript-eslint/no-explicit-any 
      );
    }

    return NextResponse.json({ message: "Annotation updated successfully" });
  } catch (error) {
    console.error("Error updating annotation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}