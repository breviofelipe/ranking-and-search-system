"use client"

import { useState, useEffect } from "react"
import {
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
  FileText,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentViewerProps {
  codigoDocumento: string
  onClose: () => void
}

interface DocumentData {
  codigo: string
  data?: Record<string, unknown> | string
  url?: string
  contentType: string
  error?: string
}

export function DocumentViewer({
  codigoDocumento,
  onClose,
}: DocumentViewerProps) {
  const [docData, setDocData] = useState<DocumentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  useEffect(() => {
    async function fetchDocument() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/documento-externo?codigo=${encodeURIComponent(codigoDocumento)}`
        )
        const json = await res.json()
        if (!res.ok) {
          setError(
            json.error || `Erro ${res.status} ao buscar documento`
          )
        } else {
          setDocData(json)
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao conectar com API externa"
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [codigoDocumento])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codigoDocumento)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Documento
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {codigoDocumento}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Copiar codigo"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-primary" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Fechar visualizador"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--border)) transparent" }}
        >
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Buscando documento na API externa...</p>
                <p className="text-xs opacity-60">
                  Codigo: {codigoDocumento}
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Erro ao carregar documento
                  </p>
                  <p className="text-xs text-muted-foreground max-w-md">
                    {error}
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsLoading(true)
                      setError(null)
                      fetch(
                        `/api/documento-externo?codigo=${encodeURIComponent(codigoDocumento)}`
                      )
                        .then((r) => r.json())
                        .then((json) => {
                          if (json.error) setError(json.error)
                          else setDocData(json)
                        })
                        .catch(() =>
                          setError("Erro ao conectar com API externa")
                        )
                        .finally(() => setIsLoading(false))
                    }}
                    className="border-border bg-transparent text-foreground"
                  >
                    Tentar novamente
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="border-border bg-transparent text-foreground"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            ) : docData ? (
              <DocumentContent data={docData} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentContent({ data }: { data: DocumentData }) {
  // PDF or image - show link/embed
  if (data.url) {
    const isPdf = data.contentType?.includes("pdf")
    const isImage = data.contentType?.includes("image")

    return (
      <div className="space-y-4">
        {isPdf && (
          <iframe
            src={data.url}
            className="w-full h-[70vh] rounded-lg border border-border"
            title={`Documento ${data.codigo}`}
          />
        )}
        {isImage && (
          <img
            src={data.url || "/placeholder.svg"}
            alt={`Documento ${data.codigo}`}
            className="max-w-full rounded-lg border border-border"
            crossOrigin="anonymous"
          />
        )}
        <div className="flex justify-center">
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir em nova aba
          </a>
        </div>
      </div>
    )
  }

  // JSON data - render as structured cards
  if (data.contentType === "json" && typeof data.data === "object" && data.data !== null) {
    return <JsonDocumentView data={data.data as Record<string, unknown>} />
  }

  // Text data
  if (data.contentType === "text" && typeof data.data === "string") {
    return (
      <div className="rounded-lg bg-highlight border border-border p-4">
        <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-all">
          {data.data}
        </pre>
      </div>
    )
  }

  return (
    <div className="text-center py-8 text-muted-foreground">
      <p className="text-sm">Formato de documento não suportado para visualização.</p>
    </div>
  )
}

function JsonDocumentView({ data }: { data: Record<string, unknown> }) {
  // Group fields by type for better display
  const entries = Object.entries(data).filter(
    ([, val]) => val !== null && val !== undefined && val !== ""
  )

  const monetaryFields = entries.filter(([key]) =>
    /valor|montante|total|preco|custo/i.test(key)
  )
  const dateFields = entries.filter(([key]) =>
    /data|date|created|updated/i.test(key)
  )
  const otherFields = entries.filter(
    ([key]) =>
      !monetaryFields.some(([k]) => k === key) &&
      !dateFields.some(([k]) => k === key)
  )

  return (
    <div className="space-y-6">
      {/* Monetary values - highlighted */}
      {monetaryFields.length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Valores
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {monetaryFields.map(([key, val]) => (
              <div
                key={key}
                className="rounded-lg bg-primary/5 border border-primary/20 p-3"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  {key}
                </p>
                <p className="text-sm font-mono font-semibold text-primary">
                  {String(val)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date fields */}
      {dateFields.length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Datas
          </h4>
          <div className="flex flex-wrap gap-3">
            {dateFields.map(([key, val]) => (
              <div
                key={key}
                className="rounded-lg bg-highlight border border-border px-3 py-2"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {key}
                </p>
                <p className="text-sm font-mono text-foreground">
                  {String(val)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other fields */}
      {otherFields.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Informações
            </h4>
            <span className="text-[10px] text-muted-foreground">
              {otherFields.length} campos
            </span>
          </div>
          <div
            className="max-h-[40vh] overflow-y-auto rounded-lg border border-border overscroll-contain"
            style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--border)) transparent" }}
          >
            <div className="divide-y divide-border">
              {otherFields.map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-start gap-4 px-4 py-2.5 hover:bg-highlight transition-colors"
                >
                  <span className="text-xs text-muted-foreground w-40 flex-shrink-0 pt-0.5 font-medium">
                    {key}
                  </span>
                  <span className="text-sm text-foreground font-mono break-all flex-1">
                    {typeof val === "object"
                      ? JSON.stringify(val, null, 2)
                      : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
