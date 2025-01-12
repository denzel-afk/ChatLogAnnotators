import { NextResponse} from "next/server";
import { getUserCollection } from "@/lib/cosmosdb";

export async function PATCH(req: Request){
    try{
        const { userId, conversations } = await req.json();
        if(!userId || !Array.isArray(conversations)){
            return NextResponse.json({ error: "Missing required fields: userId, conversations" }, { status: 400 });
        }
        const usersCollection = await getUserCollection();
        const user = await usersCollection.findOne({ _id: userId });
        if(!user){
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        await usersCollection.updateOne({ _id: userId }, { $addToSet: { assignedConversations: {$each: conversations }} });
        return NextResponse.json({ message: "Conversations assigned successfully" });
    }catch(error){
        console.error("Error assigning conversations:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}