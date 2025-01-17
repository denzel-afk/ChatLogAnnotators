// this file contains the logic for adding, deleting, and updating comments on a message

import { NextResponse } from "next/server";
import { getCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

// add a new comment to a message
export async function POST(req: Request, context: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    const { id, comment } = await req.json();
    const params = await context.params; 
    const { messageIndex } = params;
  
    if (!id || !comment || messageIndex === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
  
    try {
      const collection = await getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: {
            [`messages.${messageIndex}.comments`]: {
              _id: new ObjectId(),
              name: comment.name,
              timestamp : comment.timestamp,
              content: comment.content,
            } as any, /* eslint-disable-line @typescript-eslint/no-explicit-any */
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

  export async function DELETE(req: Request, context: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    const { id, commentId } = await req.json();
    const params = await context.params;
    const { messageIndex } = params;

    if(!id || !commentId || messageIndex === undefined){
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try{
      const collection = await getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: {
            [`messages.${messageIndex}.comments`]: {
              _id: new ObjectId(commentId),
            } as any, /* eslint-disable-line @typescript-eslint/no-explicit-any */
          },
        }
      );

      if(result.modifiedCount === 0){
        return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
      }
      return NextResponse.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  
  export async function PATCH(req: Request) {
    try {
      const { id, messageIndex, annotationId, updatedAnswer, name } = await req.json();
  
      if (!id || messageIndex === undefined || !annotationId || !updatedAnswer || !name) {
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
  
      const message = conversation.messages[messageIndex];
      if (!message) {
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
      }
  
      const annotationIndex = message.annotations.findIndex(
        (annotation: any) => annotation._id.equals(new ObjectId(annotationId)) /* eslint-disable-line @typescript-eslint/no-explicit-any */
      );
  
      if (annotationIndex === -1) {
        return NextResponse.json({ error: "Annotation not found" }, { status: 404 });
      }
  
      const existingAnswerIndex = message.annotations[annotationIndex].answers.findIndex(
        (ans: any) => ans.name === name /* eslint-disable-line @typescript-eslint/no-explicit-any */
      );
  
      if (existingAnswerIndex !== -1) {
        const updatePath = `messages.${messageIndex}.annotations.${annotationIndex}.answers.${existingAnswerIndex}.content`;
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { [updatePath]: Array.from(new Set(updatedAnswer)) } }
        );
      } else {
        const newAnswer = {
          _id: new ObjectId(),
          name,
          timestamp: Date.now(),
          content: Array.from(new Set(updatedAnswer)),
        };
  
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $push: { [`messages.${messageIndex}.annotations.${annotationIndex}.answers`]: newAnswer } as any } // eslint-disable-line @typescript-eslint/no-explicit-any
        );
      }
  
      return NextResponse.json({ message: "Answer updated successfully" });
    } catch (error) {
      console.error("Error updating answer:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  