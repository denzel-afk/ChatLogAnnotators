import { NextResponse } from "next/server";
import {getCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

// add a new annotaion to a message
export async function POST(req: Request, context: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    const { id, annotation } = await req.json();
    const params = await context.params; // Await context.params
    const { messageIndex } = params;
  
    if (!id || !annotation || messageIndex === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
  
    try {
      const collection = await getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: {
            [`messages.${messageIndex}.annotations`]: {
              _id: new ObjectId(),
              title: annotation.title,
              type: annotation.type,
              options: annotation.options || [],
              answers: annotation.answers || null,
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
  
  export async function PATCH(req: Request, context: any) {
    const { id, annotationId, updatedFields } = await req.json();
    const params = await context.params;
    const { messageIndex } = params;
  
    if (!id || !annotationId || messageIndex === undefined || !updatedFields) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
  
    try {
      const collection = await getCollection();
  
      const parsedMessageIndex = parseInt(messageIndex, 10);
  
      // Perform the update with arrayFilters
      const result = await collection.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: Object.fromEntries(
            Object.entries(updatedFields).map(([key, value]) => [
              `messages.${parsedMessageIndex}.annotations.$[annotationField].${key}`,
              value,
            ])
          ),
        },
        {
          arrayFilters: [{ "annotationField._id": new ObjectId(annotationId) }],
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
  
  

// Delete an annotation in a message
export async function DELETE(req: Request, context: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    const { id, annotationId } = await req.json();
    const params = await context.params; // Await context.params
    const { messageIndex } = params;
  
    if (!id || !annotationId || messageIndex === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
  
    try {
      const collection = await getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: {
            [`messages.${messageIndex}.annotations`]: { _id: new ObjectId(annotationId) } as any, /* eslint-disable-line @typescript-eslint/no-explicit-any */
          },
        }
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
  