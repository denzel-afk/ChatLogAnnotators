// API for fetching the active database endpoint, containerId from the CosmosdB Database and being loaded globally in the application

import { NextResponse } from "next/server";
import { getActiveDatabase } from "@/lib/databaseManager";

export async function GET() {
  try {
    const activeDatabase = getActiveDatabase();
    if (!activeDatabase.containerId) {
        console.error("Container ID is empty:", activeDatabase);
        throw new Error("Container ID cannot be empty");
    }
    return NextResponse.json(activeDatabase);
  } catch (error) {
    console.error("Error fetching active database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
