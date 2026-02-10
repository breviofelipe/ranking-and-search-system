"use client"

import { ArrowRight, Trophy, Medal, Award } from "lucide-react"
import { formatCompactCurrency, formatCurrency, formatNumber } from "@/lib/format"

interface RankingItem {
  rank: number
  name: string
  totalValor: number
  totalPago: number
  totalLiquidado: number
  count: number
}

interface RankingCardProps {
  item: RankingItem
  maxValor: number
  onClick: () => void
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
  return null
}

function getRankStyle(rank: number) {
  if (rank === 1) return "border-yellow-400/30 bg-yellow-400/5"
  if (rank === 2) return "border-gray-300/20 bg-gray-300/5"
  if (rank === 3) return "border-amber-600/20 bg-amber-600/5"
  return "border-border"
}

export function RankingCard({ item, maxValor, onClick }: RankingCardProps) {
  const percentage = maxValor > 0 ? (item.totalValor / maxValor) * 100 : 0
  const paidPercentage = item.totalValor > 0 ? (item.totalPago / item.totalValor) * 100 : 0

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border bg-card p-5 transition-all hover:bg-highlight hover:border-primary/40 group cursor-pointer ${getRankStyle(item.rank)}`}
    >
      <div className="flex items-start gap-4">
        {/* Rank badge */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm font-bold ${
              item.rank <= 3 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {item.rank <= 3 ? getRankIcon(item.rank) : `#${item.rank}`}
          </div>
          {item.rank <= 3 && (
            <span className="text-xs font-mono text-muted-foreground">#{item.rank}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatNumber(item.count)} {item.count === 1 ? "documento" : "documentos"}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-semibold font-mono text-primary">
                {formatCompactCurrency(item.totalValor)}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Pago: {formatCompactCurrency(item.totalPago)}
              </p>
            </div>
          </div>

          {/* Progress bars */}
          <div className="mt-3 space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Proporcao do total</span>
                <span className="font-mono text-muted-foreground">{percentage.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(percentage, 1)}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Execucao (pago/empenhado)</span>
                <span className="font-mono text-muted-foreground">{paidPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(paidPercentage, 1)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Full value on hover */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              {formatCurrency(item.totalValor)}
            </span>
            <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              Ver detalhes <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export function RankingCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-muted rounded-lg" />
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded mt-2" />
            </div>
            <div className="text-right">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded mt-2" />
            </div>
          </div>
          <div className="mt-3 space-y-3">
            <div className="h-1.5 bg-muted rounded-full" />
            <div className="h-1.5 bg-muted rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
