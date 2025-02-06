// API for fetching all databases endpoint, containerId from the CosmosdB Database

import { NextResponse } from "next/server";
import { getDatabaseCollection } from "@/lib/cosmosdb";
import { getUserCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { uri, databaseId, containerId, name } = await req.json();

    if (!uri || !databaseId || !containerId || !name) {
      return NextResponse.json(
        { error: "Missing required fields: uri, databaseId, containerId, name" },
        { status: 400 }
      );
    }

    const databaseCollection = await getDatabaseCollection();
    const existingDatabase = await databaseCollection.findOne({
      uri,
      databaseId,
      containerId,
      name
    });

    if (existingDatabase) {
      return NextResponse.json(
        { error: "Database already exists" },
        { status: 409 }
      );
    }

    await databaseCollection.insertOne({
      uri,
      databaseId,
      containerId,
      name,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Database added successfully" });
  } catch (error) {
    console.error("Error adding database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request){
  try{
    const { _id } = await req.json();
    if (!_id) {
      return NextResponse.json(
        { error: "Missing required fields: _id and name of database" },
        { status: 400 }
      );
    }

    const objectId = new ObjectId(_id);

    const databaseCollection = await getDatabaseCollection();
    const userCollection = await getUserCollection();
    const existingDatabase = await databaseCollection.findOne({
      _id: objectId
    });

    if (!existingDatabase) {
      return NextResponse.json(
        { error: "Database does not exist" },
        { status: 404 }
      );
    }

    await databaseCollection.deleteOne({
      _id: objectId
    });

    await userCollection.updateMany(
      {
        [`assignedConversations.${_id}`]: { $exists: true }
      },
      {
        $unset: { [`assignedConversations.${_id}`]: "" }
      }
    );

    return NextResponse.json({ message: "Database deleted successfully" });
  } catch(error){
    console.error("Error deleting database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(){
  try{
    const databaseCollection = await getDatabaseCollection();
    const databases = await databaseCollection.find().toArray();
    return NextResponse.json(databases);
  } catch(error){
    console.error("Error fetching databases:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}