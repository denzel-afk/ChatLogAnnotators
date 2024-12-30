import { NextResponse } from "next/server"
import { getCollection } from "@/lib/cosmosdb"
import { ObjectId } from "mongodb"

export async function POST(req: Request, context: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    const params = await context.params;
    const { id } = params
  const { annotation } = await req.json()

  if (!id || !annotation || !annotation.title || !annotation.type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const collection = await getCollection()
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          [`messages.$[].annotations`]: {
            _id: new ObjectId(),
            title: annotation.title,
            type: annotation.type,
            options: annotation.options || [],
            answers: annotation.answers || null,
          } as any, /* eslint-disable-line @typescript-eslint/no-explicit-any */
        },
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to add annotation" }, { status: 500 })
    }
    return NextResponse.json({ message: "Annotation added successfully" })
  } catch (error) {
    console.error("Error adding annotation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}