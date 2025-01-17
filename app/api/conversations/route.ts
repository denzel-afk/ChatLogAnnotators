// API routes for fetching conversations to be displayed in the conversation sidebar

import { NextResponse } from "next/server";
import { getCollection, getUserCollection, getDatabaseCollection } from "@/lib/cosmosdb";
import { ObjectId, Collection } from "mongodb";

const MAX_BSON_SIZE = 16 * 1024 * 1024; // 16 MB

async function canAddAnnotation(collection: Collection, docId: ObjectId, newAnnotation: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const document = await collection.findOne({ _id: docId });
  const currentSize = Buffer.byteLength(JSON.stringify(document));
  const newAnnotationSize = Buffer.byteLength(JSON.stringify(newAnnotation));
  return currentSize + newAnnotationSize < MAX_BSON_SIZE;
}

// GET API: Search conversations
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get("query") || "";
    const username = url.searchParams.get("username");
    const databaseId = url.searchParams.get("databaseId");

    if (!username || !databaseId) {
      return NextResponse.json(
        { error: "Missing username or databaseId parameter" },
        { status: 400 }
      );
    }

    // Fetch user information
    const userCollection = await getUserCollection();
    const user = await userCollection.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch database _id for the given databaseId
    const databaseCollection = await getDatabaseCollection();
    const database = await databaseCollection.findOne({ databaseId });
    if (!database) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }
    const databaseObjectId = database._id.toString();

    const collection = await getCollection();

    // Admin role: Fetch all conversations
    if (user.role === "admin") {
      const documents = await collection
        .find(
          {},
          {
            projection: {
              person: 1,
              Person: 1,
              stime: 1,
              last_interact: 1,
              messages: 1,
              annotations: 1,
            },
          }
        )
        .toArray();

      const conversations = documents.map((doc) => ({
        _id: doc._id.toString(),
        Person: (doc.person || doc.Person) ?? "Unknown",
        firstInteraction: doc.stime?.text || "No start time",
        lastInteraction: doc.last_interact?.text || "No last interaction",
        messages: doc.messages || [],
        annotations: doc.annotations || [],
      }));

      return NextResponse.json(conversations);
    }

    // Annotator role: Filter assigned conversations by database _id
    if (user.role === "annotator") {
      const assignedConversations =
        user.assignedConversations?.[databaseObjectId] || null;
    
      if (!assignedConversations || assignedConversations.conversations.length === 0) {
        return NextResponse.json([], { status: 200 });
      }
    
      // Extract conversation IDs from the assignedConversations
      const conversationIds = assignedConversations.conversations.map(
        (id: string) => new ObjectId(id)
      );
    
      let filter = { _id: { $in: conversationIds } };
    
      // Add search filter
      if (searchQuery) {
        const searchFilter = {
          $or: [
            { person: { $regex: searchQuery, $options: "i" } },
            { Person: { $regex: searchQuery, $options: "i" } },
            { "stime.text": { $regex: searchQuery, $options: "i" } },
            { "last_interact.text": { $regex: searchQuery, $options: "i" } },
            { "messages.content": { $regex: searchQuery, $options: "i" } },
          ],
        };
        filter = { ...filter, ...searchFilter };
      }
    
      const documents = await collection
        .find(filter, {
          projection: {
            person: 1,
            Person: 1,
            stime: 1,
            last_interact: 1,
            messages: 1,
            annotations: 1,
          },
        })
        .toArray();
    
      const conversations = documents.map((doc) => ({
        _id: doc._id.toString(),
        Person: (doc.person || doc.Person) ?? "Unknown",
        firstInteraction: doc.stime?.text || "No start time",
        lastInteraction: doc.last_interact?.text || "No last interaction",
        messages: doc.messages || [],
        annotations: doc.annotations || [],
      }));
    
      return NextResponse.json(conversations);
    }
    
    
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// POST API: Add annotation with batching
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
    const batchSize = 100; // Process 100 documents per batch
    const newAnnotation = {
      _id: new ObjectId(),
      title: annotation.title,
      type: annotation.type,
      options: annotation.options || [],
      answers: annotation.answers || [],
    };

    let skip = 0;
    let hasMoreDocuments = true;

    while (hasMoreDocuments) {
      const documents = await collection.find({}).skip(skip).limit(batchSize).toArray();

      if (documents.length === 0) {
        hasMoreDocuments = false;
        break;
      }

      for (const doc of documents) {
        if (await canAddAnnotation(collection, doc._id, newAnnotation)) {
          await collection.updateOne(
            { _id: doc._id },
            { $push: { annotations: newAnnotation } as any } // eslint-disable-line @typescript-eslint/no-explicit-any
          );
        } else {
          console.warn(`Skipping document ${doc._id} due to size limit`);
        }
      }

      skip += batchSize;
    }

    return NextResponse.json({
      message: "Annotation added successfully to eligible documents",
    });
  } catch (error) {
    console.error("Error adding annotation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE API: Remove annotation with batching
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
    const batchSize = 100;
    const annotationObjectId = new ObjectId(annotationId); // Convert annotationId to ObjectId
    let hasMoreDocuments = true;

    while (hasMoreDocuments) {
      // Fetch all documents with the annotation in batches
      const documents = await collection.find({ "annotations._id": annotationObjectId }).limit(batchSize).toArray();

      if (documents.length === 0) {
        hasMoreDocuments = false; // No more documents to process
        break;
      }

      // Process each document in the batch
      for (const doc of documents) {
        const result = await collection.updateOne(
          { _id: doc._id },
          { $pull: { annotations: { _id: annotationObjectId } as any} } // eslint-disable-line @typescript-eslint/no-explicit-any
        );

        console.log(`Deleted annotation from document ${doc._id}: ${result.modifiedCount}`);
      }
    }

    return NextResponse.json({ message: "Annotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting annotation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH API: Update annotation with batching
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
    const annotationObjectId = new ObjectId(annotationId);
    const batchSize = 100; // Process documents in batches
    let skip = 0;
    let hasMoreDocuments = true;
    let totalModified = 0;

    while (hasMoreDocuments) {
      const documents = await collection
        .find({ "annotations._id": annotationObjectId })
        .skip(skip)
        .limit(batchSize)
        .toArray();

      if (documents.length === 0) {
        hasMoreDocuments = false;
        break;
      }

      for (const doc of documents) {
        const result = await collection.updateOne(
          { _id: doc._id, "annotations._id": annotationObjectId },
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

        totalModified += result.modifiedCount;
        console.log(`Updated annotation in document ${doc._id}: ${result.modifiedCount}`);
      }

      skip += batchSize;
    }

    return NextResponse.json({
      message: `Annotation updated successfully in ${totalModified} documents`,
    });
  } catch (error) {
    console.error("Error updating annotation in all conversations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
