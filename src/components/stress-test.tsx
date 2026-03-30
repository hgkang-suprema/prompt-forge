import { useState } from 'react'
import { Loader2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { usePromptStore } from '@/stores/prompt-store'
import { useResultStore } from '@/stores/result-store'
import { callLLM, parseModelSelection } from '@/lib/llm'
import { getEmbeddings } from '@/lib/embeddings'
import { averagePairwiseSimilarity, similarityLabel } from '@/lib/similarity'

interface StressResult {
  responses: { text: string; latencyMs: number; error?: string }[]
  similarityScore: number | null
  similarityInfo: { label: string; color: string } | null
}

export function StressTest() {
  const [iterations, setIterations] = useState(5)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<StressResult | null>(null)

  const getRenderedPrompt = usePromptStore((s) => s.getRenderedPrompt)
  const selectedModel = usePromptStore((s) => s.selectedModel)
  const template = usePromptStore((s) => s.template)
  const addResult = useResultStore((s) => s.addResult)

  const canRun = selectedModel && template.trim()

  async function runStressTest() {
    if (!canRun) return
    setRunning(true)
    setProgress(0)
    setResult(null)

    const prompt = getRenderedPrompt()
    const { provider, model } = parseModelSelection(selectedModel)

    const responses: StressResult['responses'] = []

    for (let i = 0; i < iterations; i++) {
      try {
        const res = await callLLM(provider, model, prompt)
        responses.push({ text: res.text, latencyMs: res.latencyMs })
      } catch (e) {
        responses.push({
          text: '',
          latencyMs: 0,
          error: e instanceof Error ? e.message : 'Unknown error',
        })
      }
      setProgress(i + 1)
    }

    const successResponses = responses.filter((r) => !r.error)
    let similarityScore: number | null = null
    let similarityInfo: StressResult['similarityInfo'] = null

    if (successResponses.length >= 2) {
      try {
        const embeddings = await getEmbeddings(successResponses.map((r) => r.text))
        similarityScore = averagePairwiseSimilarity(embeddings)
        similarityInfo = similarityLabel(similarityScore)
      } catch {
        // Embedding failed — show results without similarity
      }
    }

    const stressResult: StressResult = { responses, similarityScore, similarityInfo }
    setResult(stressResult)
    setRunning(false)

    addResult({
      type: 'stress',
      prompt: template,
      model: selectedModel,
      summary: `${successResponses.length}/${iterations} OK${similarityScore !== null ? ` · ${(similarityScore * 100).toFixed(1)}%` : ''}`,
      score: similarityScore ?? undefined,
      data: stressResult,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="iterations">Iterations</Label>
          <Input
            id="iterations"
            type="number"
            min={2}
            max={50}
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
            className="w-24"
          />
        </div>
        <Button onClick={runStressTest} disabled={!canRun || running}>
          {running ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {progress}/{iterations}
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Stress Test
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-3">
          {result.similarityScore !== null && result.similarityInfo && (
            <div className="rounded-lg border border-border p-4 flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Consistency Score</p>
                <p className="text-2xl font-bold">
                  {(result.similarityScore * 100).toFixed(1)}%
                </p>
              </div>
              <Badge variant="outline" className={result.similarityInfo.color}>
                {result.similarityInfo.label}
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            {result.responses.map((r, i) => (
              <details key={i} className="rounded-lg border border-border">
                <summary className="px-4 py-2 cursor-pointer text-sm flex items-center gap-2">
                  <span className="font-medium">Run #{i + 1}</span>
                  {r.error ? (
                    <Badge variant="destructive">Error</Badge>
                  ) : (
                    <span className="text-muted-foreground">{r.latencyMs}ms</span>
                  )}
                </summary>
                <div className="px-4 pb-3 text-sm whitespace-pre-wrap">
                  {r.error ? (
                    <p className="text-destructive">{r.error}</p>
                  ) : (
                    r.text
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
