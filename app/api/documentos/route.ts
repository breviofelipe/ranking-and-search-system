import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const emendaId = searchParams.get("emenda_id")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    if (!emendaId) {
      return NextResponse.json(
        { error: "emenda_id is required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("mydb")
    const collection = db.collection("documentos_emendas")

    const filter = { emenda_id: emendaId }

    const [documents, total] = await Promise.all([
      collection
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ])

    return NextResponse.json({
      documents: documents.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Documentos API error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
