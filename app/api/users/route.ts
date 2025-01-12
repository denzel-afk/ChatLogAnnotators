import { NextResponse } from "next/server";
import { getUserCollection } from "@/lib/cosmosdb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const usersCollection = await getUserCollection();
    const users = await usersCollection.find().toArray();
    const formattedUsers = users.map((user) => ({
      _id: user._id,
      username: user.username,
      role: user.role,
      assignedDatabases: user.assignedDatabases || [],
      assignedConversations: user.assignedConversations || [],
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, role, assignedDatabases = [], assignedConversations = [] } = body;

    if (!username || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const usersCollection = await getUserCollection();
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }
    const newUser = {
      username,
      role,
      assignedDatabases: Array.isArray(assignedDatabases) ? assignedDatabases : [],
      assignedConversations: Array.isArray(assignedConversations) ? assignedConversations : [],
    };

    await usersCollection.insertOne(newUser);

    return NextResponse.json({ message: "User added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const usersCollection = await getUserCollection();

    // Validate user existence
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the user's data
    const updatedFields: { assignedDatabases?: string[], assignedConversations?: string[] } = {};
    if (updates.assignedDatabases) {
      updatedFields["assignedDatabases"] = updates.assignedDatabases;
    }
    if (updates.assignedConversations) {
      updatedFields["assignedConversations"] = updates.assignedConversations;
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updatedFields }
    );

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
