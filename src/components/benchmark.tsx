import { useMemo, useState } from 'react'
import { Loader2, Play } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { usePromptStore } from '@/stores/prompt-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useResultStore } from '@/stores/result-store'
import { callLLM } from '@/lib/llm'
import type { ProviderId } from '@/stores/settings-store'

interface BenchmarkEntry {
  provider: ProviderId
  modelId: string
  label: string
  text: string
  latencyMs: number
  tokensUsed: number
  error?: string
}

export function Benchmark() {
  const template = usePromptStore((s) => s.template)
  const getRenderedPrompt = usePromptStore((s) => s.getRenderedPrompt)
  const apiKeys = useSettingsStore((s) => s.apiKeys)
  const availableModels = useMemo(() => useSettingsStore.getState().getAvailableModels(), [apiKeys])
  const addResult = useResultStore((s) => s.addResult)

  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set())
  const [results, setResults] = useState<BenchmarkEntry[]>([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const canRun = template.trim() && selectedModels.size >= 2

  function toggleModel(key: string) {
    setSelectedModels((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function runBenchmark() {
    if (!canRun) return
    setRunning(true)
    setProgress(0)
    setResults([])

    const prompt = getRenderedPrompt()
    const models = availableModels.filter((m) => selectedModels.has(`${m.provider}:${m.id}`))
    const entries: BenchmarkEntry[] = []

    const promises = models.map(async (m) => {
      try {
        const res = await callLLM(m.provider, m.id, prompt)
        return {
          provider: m.provider,
          modelId: m.id,
          label: m.label,
          text: res.text,
          latencyMs: res.latencyMs,
          tokensUsed: res.tokensUsed,
        }
      } catch (e) {
        return {
          provider: m.provider,
          modelId: m.id,
          label: m.label,
          text: '',
          latencyMs: 0,
          tokensUsed: 0,
          error: e instanceof Error ? e.message : 'Unknown error',
        }
      }
    })

    for (const promise of promises) {
      const entry = await promise
      entries.push(entry)
      setProgress(entries.length)
      setResults([...entries])
    }

    setRunning(false)

    addResult({
      type: 'benchmark',
      prompt: template,
      model: models.map((m) => m.label).join(', '),
      summary: `${models.length} models compared`,
      data: entries,
    })
  }

  const chartData = results
    .filter((r) => !r.error)
    .map((r) => ({
      name: r.label.split(' / ')[1] ?? r.label,
      latency: r.latencyMs,
      tokens: r.tokensUsed,
    }))

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Models (2+ required)</Label>
        <div className="flex flex-wrap gap-2">
          {availableModels.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Settings에서 API Key를 입력하세요
            </p>
          )}
          {availableModels.map((m) => {
            const key = `${m.provider}:${m.id}`
            const selected = selectedModels.has(key)
            return (
              <Badge
                key={key}
                variant={selected ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleModel(key)}
              >
                {m.label}
              </Badge>
            )
          })}
        </div>
      </div>

      <Button onClick={runBenchmark} disabled={!canRun || running}>
        {running ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {progress}/{selectedModels.size}
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Run Benchmark
          </>
        )}
      </Button>

      {results.length > 0 && (
        <div className="space-y-4">
          {chartData.length >= 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium mb-3">Latency (ms)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="latency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium mb-3">Tokens Used</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="tokens" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((r) => (
              <div key={`${r.provider}:${r.modelId}`} className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{r.label}</span>
                  {r.error ? (
                    <Badge variant="destructive">Error</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {r.latencyMs}ms · {r.tokensUsed} tokens
                    </span>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">
                  {r.error ? (
                    <span className="text-destructive">{r.error}</span>
                  ) : (
                    r.text
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
