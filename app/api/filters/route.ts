import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("mydb")
    const collection = db.collection("emendas_2024")

    const [autores, tipos, funcoes] = await Promise.all([
      collection.distinct("nomeAutor"),
      collection.distinct("tipoEmenda"),
      collection.distinct("funcao"),
    ])

    return NextResponse.json({
      autores: autores.filter(Boolean).sort(),
      tipos: tipos.filter(Boolean).sort(),
      funcoes: funcoes.filter(Boolean).sort(),
    })
  } catch (error) {
    console.error("Filters API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
