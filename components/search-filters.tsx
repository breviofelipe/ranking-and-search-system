"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { Search, X, Filter, Users, Tag, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FilterOption {
  autores: string[]
  tipos: string[]
  funcoes: string[]
}

interface ActiveFilters {
  nomeAutor: string
  tipoEmenda: string
  funcao: string
  search: string
  groupBy: string
}

interface SearchFiltersProps {
  filters: ActiveFilters
  onFiltersChange: (filters: ActiveFilters) => void
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [options, setOptions] = useState<FilterOption>({ autores: [], tipos: [], funcoes: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search)

  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch("/api/filters")
        const data = await res.json()
        setOptions(data)
      } catch (err) {
        console.error("Error fetching filters:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFilters()
  }, [])

  const debouncedSearch = useCallback(
    (() => {
      let timeout: NodeJS.Timeout
      return (value: string) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          onFiltersChange({ ...filters, search: value })
        }, 400)
      }
    })(),
    [filters, onFiltersChange]
  )

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    debouncedSearch(value)
  }

  const handleFilterChange = (key: keyof ActiveFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setSearchInput("")
    onFiltersChange({ nomeAutor: "", tipoEmenda: "", funcao: "", search: "", groupBy: filters.groupBy })
  }

  const hasActiveFilters = filters.nomeAutor || filters.tipoEmenda || filters.funcao || filters.search

  const groupByOptions = [
    { value: "nomeAutor", label: "Autor", icon: Users },
    { value: "tipoEmenda", label: "Tipo de Emenda", icon: Tag },
    { value: "funcao", label: "Funcao", icon: Briefcase },
  ]

  return (
    <div className="space-y-4">
      {/* Search bar and controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por autor, tipo ou funcao..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-card border-border h-11 text-foreground placeholder:text-muted-foreground"
          />
          {searchInput && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`h-11 gap-2 border-border bg-card text-foreground ${showFilters ? "border-primary text-primary" : ""}`}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {[filters.nomeAutor, filters.tipoEmenda, filters.funcao, filters.search].filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="h-11 gap-2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Group by tabs */}
      <div className="flex gap-1 p-1 bg-card rounded-lg border border-border w-fit">
        {groupByOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleFilterChange("groupBy", opt.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filters.groupBy === opt.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <opt.icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Expanded filter dropdowns */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-card border border-border">
          <FilterSelect
            label="Autor"
            icon={<Users className="h-4 w-4" />}
            value={filters.nomeAutor}
            onChange={(v) => handleFilterChange("nomeAutor", v)}
            options={options.autores}
            isLoading={isLoading}
            placeholder="Todos os autores"
          />
          <FilterSelect
            label="Tipo de Emenda"
            icon={<Tag className="h-4 w-4" />}
            value={filters.tipoEmenda}
            onChange={(v) => handleFilterChange("tipoEmenda", v)}
            options={options.tipos}
            isLoading={isLoading}
            placeholder="Todos os tipos"
          />
          <FilterSelect
            label="Funcao"
            icon={<Briefcase className="h-4 w-4" />}
            value={filters.funcao}
            onChange={(v) => handleFilterChange("funcao", v)}
            options={options.funcoes}
            isLoading={isLoading}
            placeholder="Todas as funcoes"
          />
        </div>
      )}
    </div>
  )
}

function FilterSelect({
  label,
  icon,
  value,
  onChange,
  options,
  isLoading,
  placeholder,
}: {
  label: string
  icon: React.ReactNode
  value: string
  onChange: (v: string) => void
  options: string[]
  isLoading: boolean
  placeholder: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
