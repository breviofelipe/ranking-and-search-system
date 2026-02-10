"use client"

import { useEffect, useState } from "react"

export function SchemaDebug() {
  const [schema, setSchema] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/documentos-completos/schema")
        const data = await res.json()
        console.log("[v0] documento_completo schema:", JSON.stringify(data, null, 2))
        setSchema(data)
      } catch (err) {
        console.error("[v0] Schema load error:", err)
        setError(String(err))
      }
    }
    load()
  }, [])

  if (error) return <div className="text-destructive p-4">Error: {error}</div>
  if (!schema) return <div className="text-muted-foreground p-4">Loading schema...</div>

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <h3 className="text-foreground text-sm font-semibold mb-3">documento_completo Schema Debug</h3>
      <pre className="text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(schema, null, 2)}
      </pre>
    </div>
  )
}
