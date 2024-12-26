import { getUserCollection } from "@/lib/cosmosdb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username } = body;

        if (!username) {
            return new Response('Username is required', { status: 400 });
        }

        const userCollection = await getUserCollection();
        const user = await userCollection.findOne({ username });

        if (!user) {
            return new Response('User not found', { status: 404 });
        }
        
        return new Response(JSON.stringify(user), { status: 200 });
    } catch {
        return new Response('Internal Server Error', { status: 500 });
    }
}
