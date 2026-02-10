"use client"

import { DollarSign, FileText, TrendingUp } from "lucide-react"
import { formatCompactCurrency, formatNumber } from "@/lib/format"

interface SummaryCardsProps {
  totalValor: number
  totalPago: number
  totalDocumentos: number
  isLoading: boolean
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 animate-pulse">
      <div className="h-4 w-24 bg-muted rounded mb-3" />
      <div className="h-8 w-40 bg-muted rounded mb-2" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  )
}

export function SummaryCards({ totalValor, totalPago, totalDocumentos, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  const cards = [
    {
      label: "Total Empenhado",
      value: formatCompactCurrency(totalValor),
      icon: TrendingUp,
      accent: "text-primary",
      bgAccent: "bg-primary/10",
    },
    {
      label: "Total Pago",
      value: formatCompactCurrency(totalPago),
      icon: DollarSign,
      accent: "text-chart-2",
      bgAccent: "bg-chart-2/10",
    },
    {
      label: "Total de Documentos",
      value: formatNumber(totalDocumentos),
      icon: FileText,
      accent: "text-chart-3",
      bgAccent: "bg-chart-3/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-card p-5 flex items-start gap-4 transition-colors hover:border-primary/30"
        >
          <div className={`rounded-lg p-2.5 ${card.bgAccent}`}>
            <card.icon className={`h-5 w-5 ${card.accent}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className={`text-2xl font-semibold font-mono tracking-tight mt-1 ${card.accent}`}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
