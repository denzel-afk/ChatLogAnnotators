import { NextResponse } from "next/server";
import { getUserCollection } from "@/lib/cosmosdb";

export async function GET() {
  try {
    const usersCollection = await getUserCollection();
    const users = await usersCollection.find().toArray();

    const formattedUsers = users.map((user) => ({
      _id: user._id,
      username: user.username,
      role: user.role,
      assignedConversations: user.assignedConversations || {},
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
    const { username, role, assignedConversations = {} } = body;

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
      assignedConversations,
    };

    await usersCollection.insertOne(newUser);

    return NextResponse.json({ message: "User added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request){
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const usersCollection = await getUserCollection();
    await usersCollection.findOneAndDelete({ username });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}