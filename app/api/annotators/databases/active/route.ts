import { NextResponse } from "next/server";
import { getUserCollection } from "@/lib/cosmosdb";

export async function GET(req: Request) {
    try {
      const url = new URL(req.url);
      const username = url.searchParams.get("username");
  
      console.log("[DEBUG] Fetching active database for username:", username);
  
      if (!username) {
        return NextResponse.json({ error: "Missing username" }, { status: 400 });
      }
  
      const userCollection = await getUserCollection();
      const user = await userCollection.findOne({ username });
  
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      if (!user.activeDatabase) {
        console.log("[DEBUG] No active database found for user:", username);
        return NextResponse.json({ error: "No active database" }, { status: 404 });
      }
  
      console.log("[DEBUG] Active databaseId:", user.activeDatabase);
      return NextResponse.json({ databaseId: user.activeDatabase });
    } catch (error) {
      console.error("[ERROR] Fetching active database failed:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  