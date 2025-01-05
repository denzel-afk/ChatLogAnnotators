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
      console.error("Missing fields:", { id, annotationId, updatedAnswer, name });
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

    const annotationIndex = conversation.annotations.findIndex(
      (annotation: any) => annotation._id.equals(new ObjectId(annotationId))
    );

    if (annotationIndex === -1) {
      return NextResponse.json({ error: "Annotation not found" }, { status: 404 });
    }

    const existingAnswerIndex = conversation.annotations[annotationIndex].answers.findIndex(
      (answer: any) => answer.name === name
    );

    if (existingAnswerIndex !== -1) {
      // Update existing answer
      const updatePath = `annotations.${annotationIndex}.answers.${existingAnswerIndex}.content`;
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { [updatePath]: updatedAnswer } }
      );
    } else {
      const newAnswer = {
        _id: new ObjectId(),
        name,
        timestamp: Date.now(),
        content: updatedAnswer,
      };
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { [`annotations.${annotationIndex}.answers`]: newAnswer } as any }   // eslint-disable-line @typescript-eslint/no-explicit-any
      );
    }

    return NextResponse.json({ message: "Annotation updated successfully" });
  } catch (error) {
    console.error("Error updating annotation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
