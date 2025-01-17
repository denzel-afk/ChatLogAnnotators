// Purpose: API route to switch the active database to a new one.

import { NextResponse } from "next/server";
import { getDatabaseCollection } from "@/lib/cosmosdb";
import { switchDatabase, getActiveDatabase } from "@/lib/databaseManager";

export async function POST(req: Request) {
  try {
    const { uri, databaseId, containerId, name } = await req.json();

    console.log("[Switch API] Received request to switch database with:", {
      uri,
      databaseId,
      containerId,
      name,
    });

    if (!uri || !databaseId || !containerId || !name) {
      return NextResponse.json(
        { error: "Missing required fields: uri, databaseId, containerId, name" },
        { status: 400 }
      );
    }

    const databaseCollection = await getDatabaseCollection();
    const matchingDatabase = await databaseCollection.findOne({
      uri,
      databaseId,
      containerId,
      name,
    });

    if (!matchingDatabase) {
      console.log("[Switch API] Database not found in the collection.");
      return NextResponse.json(
        { error: "Database not found in available list" },
        { status: 404 }
      );
    }
    
    console.log("[Switch API] Switching to database:", { uri, databaseId, containerId, name });
    switchDatabase({ uri, databaseId, containerId, name });

    const activeDatabase = getActiveDatabase();
    console.log("[Switch API] Active database after switch:", activeDatabase);

    return NextResponse.json(activeDatabase);
  } catch (error) {
    console.error("[Switch API] Error switching database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
