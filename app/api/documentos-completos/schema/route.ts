import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("mydb")
    const collection = db.collection("documento_completo")

    // Fetch 5 sample documents to discover field names and types
    const samples = await collection.find({}).limit(5).toArray()

    // Extract field names and example values
    const fieldMap: Record<string, { type: string; example: unknown }> = {}
    for (const doc of samples) {
      for (const [key, val] of Object.entries(doc)) {
        if (!fieldMap[key]) {
          fieldMap[key] = { type: typeof val, example: val }
        }
      }
    }

    const totalCount = await collection.estimatedDocumentCount()

    return NextResponse.json({
      totalDocuments: totalCount,
      fields: fieldMap,
      sampleDocument: samples[0] || null,
    })
  } catch (error) {
    console.error("Schema sample error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
