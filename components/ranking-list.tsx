"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SummaryCards } from "@/components/summary-cards"
import { SearchFilters } from "@/components/search-filters"
import { RankingCard, RankingCardSkeleton } from "@/components/ranking-card"
import { DetailPanel } from "@/components/detail-panel"

interface RankingItem {
  rank: number
  name: string
  totalValor: number
  totalPago: number
  totalLiquidado: number
  count: number
}

interface RankingData {
  data: RankingItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    totalValor: number
    totalPago: number
    totalDocumentos: number
  }
}

interface ActiveFilters {
  nomeAutor: string
  tipoEmenda: string
  funcao: string
  search: string
  groupBy: string
}

export function RankingList() {
  const [data, setData] = useState<RankingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filters, setFilters] = useState<ActiveFilters>({
    nomeAutor: "",
    tipoEmenda: "",
    funcao: "",
    search: "",
    groupBy: "nomeAutor",
  })
  const [selectedItem, setSelectedItem] = useState<{ field: string; value: string } | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        groupBy: filters.groupBy,
      })
      if (filters.nomeAutor) params.set("nomeAutor", filters.nomeAutor)
      if (filters.tipoEmenda) params.set("tipoEmenda", filters.tipoEmenda)
      if (filters.funcao) params.set("funcao", filters.funcao)
      if (filters.search) params.set("search", filters.search)

      const res = await fetch(`/api/ranking?${params}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error("Error fetching ranking:", err)
    } finally {
      setIsLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFiltersChange = (newFilters: ActiveFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const maxValor = data?.data?.[0]?.totalValor || 1

  return (
    <div className="space-y-6">
      {/* Summary */}
      <SummaryCards
        totalValor={data?.summary?.totalValor || 0}
        totalPago={data?.summary?.totalPago || 0}
        totalDocumentos={data?.summary?.totalDocumentos || 0}
        isLoading={isLoading && !data}
      />

      {/* Search and filters */}
      <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Results header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">Ranking</h2>
          {data && (
            <span className="text-sm text-muted-foreground">
              {data.pagination.total} {data.pagination.total === 1 ? "resultado" : "resultados"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Visualizacao em grade"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Visualizacao em lista"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Ranking cards */}
      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-3" : "space-y-3"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <RankingCardSkeleton key={i} />
          ))}
        </div>
      ) : data?.data.length ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-3" : "space-y-3"}>
          {data.data.map((item) => (
            <RankingCard
              key={item.name}
              item={item}
              maxValor={maxValor}
              onClick={() => setSelectedItem({ field: filters.groupBy, value: item.name })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-lg border border-border bg-card">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <List className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">Nenhum resultado encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">Tente ajustar os filtros ou termos de busca.</p>
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Pagina {data.pagination.page} de {data.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="gap-1.5 border-border bg-transparent text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1.5 border-border bg-transparent text-foreground"
            >
              Proximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selectedItem && (
        <DetailPanel
          field={selectedItem.field}
          value={selectedItem.value}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}
