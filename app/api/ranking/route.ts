import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

/**
 * Converts a Brazilian-formatted currency string field (e.g. "1.234.567,89")
 * to a numeric double value in a MongoDB aggregation expression.
 * Steps: remove dots -> replace comma with dot -> $toDouble with onError: 0
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
    const groupBy = searchParams.get("groupBy") || "nomeAutor"
    const nomeAutor = searchParams.get("nomeAutor")
    const tipoEmenda = searchParams.get("tipoEmenda")
    const funcao = searchParams.get("funcao")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const client = await clientPromise
    const db = client.db("mydb")
    const collection = db.collection("emendas_2024")

    const matchStage: Record<string, unknown> = {}

    if (nomeAutor) matchStage.nomeAutor = nomeAutor
    if (tipoEmenda) matchStage.tipoEmenda = tipoEmenda
    if (funcao) matchStage.funcao = funcao
    if (search) {
      matchStage.$or = [
        { nomeAutor: { $regex: search, $options: "i" } },
        { tipoEmenda: { $regex: search, $options: "i" } },
        { funcao: { $regex: search, $options: "i" } },
      ]
    }

    const pipeline = [
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: `$${groupBy}`,
          totalValor: { $sum: parseBRL("valorEmpenhado") },
          totalPago: { $sum: parseBRL("valorPago") },
          totalLiquidado: { $sum: parseBRL("valorLiquidado") },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalValor: -1 as const } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]

    const result = await collection.aggregate(pipeline).toArray()
    const total = result[0]?.metadata[0]?.total || 0
    const data = result[0]?.data || []

    // Calculate grand totals
    const totalsPipeline = [
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: null,
          totalValor: { $sum: parseBRL("valorEmpenhado") },
          totalPago: { $sum: parseBRL("valorPago") },
          totalDocumentos: { $sum: 1 },
        },
      },
    ]

    const totals = await collection.aggregate(totalsPipeline).toArray()

    return NextResponse.json({
      data: data.map((item: Record<string, unknown>, index: number) => ({
        rank: (page - 1) * limit + index + 1,
        name: item._id || "Sem informacao",
        totalValor: item.totalValor,
        totalPago: item.totalPago,
        totalLiquidado: item.totalLiquidado,
        count: item.count,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalValor: totals[0]?.totalValor || 0,
        totalPago: totals[0]?.totalPago || 0,
        totalDocumentos: totals[0]?.totalDocumentos || 0,
      },
    })
  } catch (error) {
    console.error("Ranking API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
