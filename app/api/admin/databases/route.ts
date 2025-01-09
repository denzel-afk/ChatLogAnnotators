import { NextResponse } from "next/server";
import { getDatabaseCollection } from "@/lib/cosmosdb";

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