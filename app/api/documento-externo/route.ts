import { NextRequest, NextResponse } from "next/server"

/**
 * Proxy route to fetch external document data by codigoDocumento.
 * Update EXTERNAL_API_BASE_URL with the actual API endpoint when available.
 * The client calls this route, and this route calls the external API,
 * avoiding CORS issues and keeping API keys server-side.
 */
const EXTERNAL_API_BASE_URL =
  process.env.EXTERNAL_DOC_API_URL || "https://api.portaldatransparencia.gov.br/api-de-dados/despesas/documentos"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const codigoDocumento = searchParams.get("codigo")

    if (!codigoDocumento) {
      return NextResponse.json(
        { error: "codigo is required" },
        { status: 400 }
      )
    }

    const externalUrl = `${EXTERNAL_API_BASE_URL}/${encodeURIComponent(codigoDocumento)}`

    const externalRes = await fetch(externalUrl, {
      headers: {
        Accept: "*/*",
        'chave-api-dados': 'dd031ccb78dbbc5b4a4d1c042c1a5ce9'
      },
      next: { revalidate: 3600 },
    })

    if (!externalRes.ok) {
      // Return a structured error so client can show appropriate message
      return NextResponse.json(
        {
          error: "Documento nao encontrado na API externa",
          status: externalRes.status,
          codigo: codigoDocumento,
        },
        { status: externalRes.status }
      )
    }

    const contentType = externalRes.headers.get("content-type") || ""

    // If it's JSON, parse and return
    if (contentType.includes("application/json")) {
      const data = await externalRes.json()
      return NextResponse.json({
        codigo: codigoDocumento,
        data,
        contentType: "json",
      })
    }

    // If it's a PDF or other binary, return the URL for the client to open
    if (
      contentType.includes("application/pdf") ||
      contentType.includes("image/")
    ) {
      return NextResponse.json({
        codigo: codigoDocumento,
        url: externalUrl,
        contentType: contentType,
      })
    }

    // Fallback: return text
    const text = await externalRes.text()
    return NextResponse.json({
      codigo: codigoDocumento,
      data: text,
      contentType: "text",
    })
  } catch (error) {
    console.error("Documento externo API error:", error)
    return NextResponse.json(
      { error: "Erro ao buscar documento externo" },
      { status: 500 }
    )
  }
}
