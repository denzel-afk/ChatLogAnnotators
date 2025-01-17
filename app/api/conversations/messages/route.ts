// Purpose: API routes for adding, updating, and deleting annotations in all messages in all documents.

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
      answers: annotation.answers || [],
    };

    const batchSize = 100; 
    let skip = 0;
    let hasMoreDocuments = true;
    let totalModified = 0;

    while (hasMoreDocuments) {
      const documents = await collection.find({}).skip(skip).limit(batchSize).toArray();

      if (documents.length === 0) {
        hasMoreDocuments = false;
        break;
      }

      for (const doc of documents) {
        const result = await collection.updateOne(
          { _id: doc._id },
          { $push: { "messages.$[].annotations": newAnnotation } as any } // eslint-disable-line @typescript-eslint/no-explicit-any
        );
        totalModified += result.modifiedCount;
      }

      skip += batchSize;   }

    return NextResponse.json({
      message: `Annotation added successfully to all messages in ${totalModified} documents`,
    });
  } catch (error) {
    console.error("Error adding annotation to all messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try{
    const { annotationId } = await req.json();
    if (!annotationId || !ObjectId.isValid(annotationId)) {
      return NextResponse.json({ error: "Invalid or missing annotation ID" }, { status: 400 });
    }
    const collection = await getCollection();
    const batchSize = 100; // Ukuran batch untuk dokumen yang akan diproses
    let skip = 0;
    let hasMoreDocuments = true;
    let totalModified = 0;
    const annotationObjectId = new ObjectId(annotationId);

    while(hasMoreDocuments){
      const documents = await collection.find({}).skip(skip).limit(batchSize).toArray();
      if(documents.length === 0){
        hasMoreDocuments = false;
        break;
      }
      for (const doc of documents) {
        const result = await collection.updateOne(
          { _id: doc._id },
          {
            $pull: {
              "messages.$[].annotations": {
                _id: annotationObjectId,
              } as any // eslint-disable-line @typescript-eslint/no-explicit-any,
            },
          }
        );

        totalModified += result.modifiedCount;
      }

      skip += batchSize;
    }
    return NextResponse.json({
      message: `Annotation removed successfully in ${totalModified} documents`,
    });
  }catch (error) {
    console.error("Error removing annotation from all messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { annotationId, updatedFields } = await req.json();

    if (!annotationId || !ObjectId.isValid(annotationId)) {
      return NextResponse.json(
        { error: "Invalid or missing annotation ID" },
        { status: 400 }
      );
    }

    const collection = await getCollection();
    const annotationObjectId = new ObjectId(annotationId);
    const batchSize = 100;
    let skip = 0;
    let hasMoreDocuments = true;
    let totalModified = 0;

    while (hasMoreDocuments) {
      const documents = await collection.find({}).skip(skip).limit(batchSize).toArray();
      if (documents.length === 0) {
        hasMoreDocuments = false;
        break;
      }

      for (const doc of documents) {
        const result = await collection.updateOne(
          { _id: doc._id },
          {
            $set: {
              "messages.$[].annotations.$[annotation].title": updatedFields.title,
              "messages.$[].annotations.$[annotation].type": updatedFields.type,
              "messages.$[].annotations.$[annotation].options": updatedFields.options || [],
            },
          },
          {
            arrayFilters: [{ "annotation._id": annotationObjectId }],
          }
        );
        totalModified += result.modifiedCount;
      }

      skip += batchSize;
    }

    return NextResponse.json({
      message: `Annotation updated successfully in ${totalModified} documents`,
    });
  } catch (error) {
    console.error("Error updating annotation in all messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
