import { BarChart3 } from "lucide-react"

export function PageHeader() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-tight">Emendas 2024</h1>
              <p className="text-xs text-muted-foreground">Ranking de Gastos Parlamentares</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
              Dados Abertos
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
