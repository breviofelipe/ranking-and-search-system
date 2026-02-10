"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Eye,
  Files,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DocumentViewer } from "@/components/document-viewer"

interface DocumentoEmenda {
  _id: string
  emenda_id: string
  codigoDocumento?: string
  [key: string]: unknown
}

interface DocumentosData {
  documents: DocumentoEmenda[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface DocumentosEmendaProps {
  codigoEmenda: string
}

export function DocumentosEmenda({ codigoEmenda }: DocumentosEmendaProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<DocumentosData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [viewingDoc, setViewingDoc] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    async function fetchDocumentos() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/documentos?emenda_id=${encodeURIComponent(codigoEmenda)}&page=${page}&limit=20`
        )
        if (!res.ok) throw new Error("Erro ao buscar documentos")
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocumentos()
  }, [isOpen, codigoEmenda, page])

  return (
    <div className="mt-3">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors group"
      >
        <Files className="h-3.5 w-3.5" />
        <span>Documentos vinculados</span>
        {isOpen ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="mt-3 rounded-lg border border-border bg-background overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Carregando documentos...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 py-8 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          ) : data && data.documents.length > 0 ? (
            <>
              {/* Count header */}
              <div className="px-4 py-2.5 border-b border-border bg-highlight flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {data.pagination.total}{" "}
                  {data.pagination.total === 1 ? "documento" : "documentos"}{" "}
                  encontrados
                </span>
                {data.pagination.totalPages > 1 && (
                  <span className="text-xs text-muted-foreground">
                    Pagina {data.pagination.page} de{" "}
                    {data.pagination.totalPages}
                  </span>
                )}
              </div>

              {/* Document list */}
              <ScrollArea className="max-h-96">
                <div className="divide-y divide-border">
                  {data.documents.map((doc) => (
                    <DocumentoItem
                      key={doc._id}
                      doc={doc}
                      onView={(codigo) => setViewingDoc(codigo)}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="px-4 py-2.5 border-t border-border bg-highlight flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-7 px-2 text-xs text-muted-foreground"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-7 px-2 text-xs text-muted-foreground"
                  >
                    Proximo
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mb-2 opacity-40" />
              <span className="text-sm">
                Nenhum documento vinculado encontrado
              </span>
            </div>
          )}
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <DocumentViewer
          codigoDocumento={viewingDoc}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  )
}

function DocumentoItem({
  doc,
  onView,
}: {
  doc: DocumentoEmenda
  onView: (codigo: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hiddenFields = ["_id", "emenda_id", "codigoDocumento"]

  const displayFields = Object.entries(doc).filter(
    ([key, val]) =>
      !hiddenFields.includes(key) &&
      val !== null &&
      val !== undefined &&
      val !== ""
  )

  // Pick a few fields for the preview line
  const previewFields = displayFields.slice(0, 3)

  return (
    <div className="group">
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-highlight transition-colors">
        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {doc.codigoDocumento && (
              <span className="text-sm font-mono font-medium text-foreground">
                {doc.codigoDocumento as string}
              </span>
            )}
          </div>
          {previewFields.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
              {previewFields.map(([key, val]) => (
                <span key={key} className="text-xs text-muted-foreground">
                  <span className="opacity-60">{key}:</span>{" "}
                  {String(val).substring(0, 60)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {doc.codigoDocumento && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onView(doc.codigoDocumento as string)
              }}
              className="h-7 px-2 text-xs text-primary hover:text-primary/80 gap-1"
            >
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Visualizar</span>
            </Button>
          )}
          {displayFields.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={
                isExpanded ? "Recolher detalhes" : "Expandir detalhes"
              }
            >
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded fields */}
      {isExpanded && (
        <div className="px-4 pb-3 pl-11">
          <div className="rounded-md bg-highlight border border-border p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {displayFields.map(([key, val]) => (
              <div key={key}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {key}
                </p>
                <p className="text-xs text-foreground font-mono break-all">
                  {String(val)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
