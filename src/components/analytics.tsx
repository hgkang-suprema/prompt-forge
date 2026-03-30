import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useResultStore } from '@/stores/result-store'
import type { TestResult } from '@/stores/result-store'

function exportToJson(results: TestResult[]) {
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prompt-forge-results-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function Analytics() {
  const history = useResultStore((s) => s.history)

  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        No test results yet. Run a Stress Test or Unit Test to see analytics.
      </div>
    )
  }

  const scoredResults = history.filter((r) => r.score !== undefined)
  const chartData = scoredResults
    .slice(0, 10)
    .reverse()
    .map((r) => ({
      name: new Date(r.timestamp).toLocaleTimeString(),
      score: Math.round((r.score ?? 0) * 100),
      type: r.type,
    }))

  const stressResults = history.filter((r) => r.type === 'stress')
  const unitResults = history.filter((r) => r.type === 'unit')
  const avgStressScore = stressResults.length > 0
    ? stressResults.reduce((sum, r) => sum + (r.score ?? 0), 0) / stressResults.length
    : null
  const avgUnitScore = unitResults.length > 0
    ? unitResults.reduce((sum, r) => sum + (r.score ?? 0), 0) / unitResults.length
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Test Analytics</h3>
        <Button variant="outline" size="sm" onClick={() => exportToJson(history)}>
          <Download className="h-4 w-4 mr-1" />
          Export JSON
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Runs</p>
          <p className="text-2xl font-bold">{history.length}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Avg Consistency</p>
          <p className="text-2xl font-bold">
            {avgStressScore !== null ? `${(avgStressScore * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Avg Pass Rate</p>
          <p className="text-2xl font-bold">
            {avgUnitScore !== null ? `${(avgUnitScore * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      {chartData.length >= 2 && (
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium mb-3">Score Trend (recent 10)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis domain={[0, 100]} fontSize={12} />
              <Tooltip />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
