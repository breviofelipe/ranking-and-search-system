"use client"

import React from "react"

import { useState, useEffect } from "react"
import { X, ArrowLeft, ChevronDown, ChevronUp, FileText, TrendingUp, DollarSign, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatCompactCurrency, formatNumber } from "@/lib/format"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DocumentosEmenda } from "@/components/documentos-emenda"

interface DetailData {
  documents: Record<string, unknown>[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    totalValor?: number
    totalPago?: number
    totalLiquidado?: number
    autores?: string[]
    tipos?: string[]
    funcoes?: string[]
  }
  breakdowns: {
    byFuncao: { name: string; total: number; count: number }[]
    byTipo: { name: string; total: number; count: number }[]
  }
}

interface DetailPanelProps {
  field: string
  value: string
  onClose: () => void
}

export function DetailPanel({ field, value, onClose }: DetailPanelProps) {
  const [data, setData] = useState<DetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDetail() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/detail?field=${field}&value=${encodeURIComponent(value)}&page=${page}&limit=30`)
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error("Error fetching detail:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDetail()
  }, [field, value, page])

  const fieldLabel = field === "nomeAutor" ? "Autor" : field === "tipoEmenda" ? "Tipo de Emenda" : "Funcao"

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="fixed inset-y-0 right-0 w-full max-w-3xl bg-background border-l border-border shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onClose} className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao ranking
            </Button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Fechar painel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <p className="text-xs text-primary font-medium uppercase tracking-wider">{fieldLabel}</p>
            <h2 className="text-xl font-semibold text-foreground mt-1 text-balance">{value}</h2>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {isLoading ? (
              <DetailSkeleton />
            ) : data ? (
              <>
                {/* Summary stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Empenhado"
                    value={formatCompactCurrency(data.summary.totalValor || 0)}
                    accent="text-primary"
                  />
                  <StatCard
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Pago"
                    value={formatCompactCurrency(data.summary.totalPago || 0)}
                    accent="text-chart-2"
                  />
                  <StatCard
                    icon={<BarChart3 className="h-4 w-4" />}
                    label="Liquidado"
                    value={formatCompactCurrency(data.summary.totalLiquidado || 0)}
                    accent="text-chart-3"
                  />
                  <StatCard
                    icon={<FileText className="h-4 w-4" />}
                    label="Documentos"
                    value={formatNumber(data.pagination.total)}
                    accent="text-foreground"
                  />
                </div>

                {/* Breakdown cards */}
                {data.breakdowns.byFuncao.length > 0 && (
                  <BreakdownSection title="Distribuicao por Funcao" items={data.breakdowns.byFuncao} />
                )}
                {data.breakdowns.byTipo.length > 0 && (
                  <BreakdownSection title="Distribuicao por Tipo" items={data.breakdowns.byTipo} />
                )}

                {/* Documents list */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Documentos ({formatNumber(data.pagination.total)})
                  </h3>
                  <div className="space-y-2">
                    {data.documents.map((doc) => (
                      <DocumentCard
                        key={doc._id as string}
                        doc={doc}
                        isExpanded={expandedDoc === (doc._id as string)}
                        onToggle={() =>
                          setExpandedDoc(expandedDoc === (doc._id as string) ? null : (doc._id as string))
                        }
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {data.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Pagina {data.pagination.page} de {data.pagination.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 1}
                          onClick={() => setPage((p) => p - 1)}
                          className="border-border bg-transparent text-foreground"
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page >= data.pagination.totalPages}
                          onClick={() => setPage((p) => p + 1)}
                          className="border-border bg-transparent text-foreground"
                        >
                          Proximo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-10">Erro ao carregar dados.</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-lg font-semibold font-mono ${accent}`}>{value}</p>
    </div>
  )
}

function BreakdownSection({ title, items }: { title: string; items: { name: string; total: number; count: number }[] }) {
  const maxTotal = items[0]?.total || 1

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => {
          const pct = (item.total / maxTotal) * 100
          return (
            <div key={item.name} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground truncate max-w-[60%]">{item.name}</span>
                <span className="font-mono text-muted-foreground flex-shrink-0 ml-2">
                  {formatCompactCurrency(item.total)} ({item.count})
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full transition-all"
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DocumentCard({
  doc,
  isExpanded,
  onToggle,
}: {
  doc: Record<string, unknown>
  isExpanded: boolean
  onToggle: () => void
}) {
  const importantFields = ["nomeAutor", "tipoEmenda", "funcao", "subfuncao", "valorEmpenhado", "valorPago", "valorLiquidado", "localidade", "acao"]
  const hiddenFields = ["_id", ...importantFields]

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-highlight transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {doc.tipoEmenda && (
                <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary font-medium">
                  {doc.tipoEmenda as string}
                </span>
              )}
              {doc.funcao && (
                <span className="px-2 py-0.5 rounded text-xs bg-chart-2/10 text-chart-2 font-medium">
                  {doc.funcao as string}
                </span>
              )}
              {doc.subfuncao && (
                <span className="px-2 py-0.5 rounded text-xs bg-chart-3/10 text-chart-3 font-medium">
                  {doc.subfuncao as string}
                </span>
              )}
            </div>
            {doc.nomeAutor && (
              <p className="text-sm text-foreground">{doc.nomeAutor as string}</p>
            )}
            {doc.localidade && (
              <p className="text-xs text-muted-foreground mt-0.5">{doc.localidade as string}</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-sm font-mono font-semibold text-primary">
                {formatCurrency(Number(doc.valorEmpenhado) || 0)}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                Pago: {formatCurrency(Number(doc.valorPago) || 0)}
              </p>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border p-4 bg-highlight">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(doc)
              .filter(([key]) => !hiddenFields.includes(key))
              .filter(([, val]) => val !== null && val !== undefined && val !== "")
              .map(([key, val]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground">{key}</p>
                  <p className="text-sm text-foreground font-mono break-all">
                    {typeof val === "number" ? formatCurrency(val) : String(val)}
                  </p>
                </div>
              ))}
          </div>

          {/* Documentos vinculados via codigoEmenda */}
          {doc.codigoEmenda && (
            <DocumentosEmenda codigoEmenda={doc.codigoEmenda as string} />
          )}
        </div>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3">
            <div className="h-3 w-16 bg-muted rounded mb-2" />
            <div className="h-6 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <div className="h-4 w-48 bg-muted rounded mb-2" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}
