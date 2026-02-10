import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

/**
 * Converts a Brazilian-formatted currency string field (e.g. "1.234.567,89")
 * to a numeric double value in a MongoDB aggregation expression.
 */
function parseBRL(field: string) {
  return {
    $convert: {
      input: {
        $replaceAll: {
          input: {
            $replaceAll: {
              input: { $toString: { $ifNull: [`$${field}`, "0"] }, },
              find: ".",
              replacement: "",
            },
          },
          find: ",",
          replacement: ".",
        },
      },
      to: "double",
      onError: 0,
      onNull: 0,
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const field = searchParams.get("field") || "nomeAutor"
    const value = searchParams.get("value")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    if (!value) {
      return NextResponse.json({ error: "Value is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("mydb")
    const collection = db.collection("emendas_2024")

    const filter = { [field]: value }

    const [documents, total, aggregation] = await Promise.all([
      collection
        .find(filter)
        .sort({ valorEmpenhado: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
      collection
        .aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              totalValor: { $sum: parseBRL("valorEmpenhado") },
              totalPago: { $sum: parseBRL("valorPago") },
              totalLiquidado: { $sum: parseBRL("valorLiquidado") },
              autores: { $addToSet: "$nomeAutor" },
              tipos: { $addToSet: "$tipoEmenda" },
              funcoes: { $addToSet: "$funcao" },
            },
          },
        ])
        .toArray(),
    ])

    // Sub-groupings for breakdown
    const breakdownByFuncao = await collection
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$funcao",
            total: { $sum: parseBRL("valorEmpenhado") },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    const breakdownByTipo = await collection
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$tipoEmenda",
            total: { $sum: parseBRL("valorEmpenhado") },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ])
      .toArray()

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
      summary: aggregation[0] || {},
      breakdowns: {
        byFuncao: breakdownByFuncao.map((b) => ({
          name: b._id || "Sem informacao",
          total: b.total,
          count: b.count,
        })),
        byTipo: breakdownByTipo.map((b) => ({
          name: b._id || "Sem informacao",
          total: b.total,
          count: b.count,
        })),
      },
    })
  } catch (error) {
    console.error("Detail API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
