import { useState } from 'react'
import { Loader2, Play, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePromptStore } from '@/stores/prompt-store'
import { useResultStore } from '@/stores/result-store'
import { callLLM, parseModelSelection } from '@/lib/llm'
import { evaluate } from '@/lib/evaluator'
import type { EvalMode, EvalResult } from '@/lib/evaluator'

interface TestCase {
  variables: Record<string, string>
  expected: string
  mode: EvalMode
}

interface TestCaseResult extends TestCase {
  actual: string
  evalResult: EvalResult | null
  error?: string
}

const VAR_REGEX = /\{\{(\w+)\}\}/g

function parseVariables(template: string): string[] {
  const matches = new Set<string>()
  let match: RegExpExecArray | null
  const regex = new RegExp(VAR_REGEX)
  while ((match = regex.exec(template)) !== null) {
    matches.add(match[1])
  }
  return [...matches]
}

export function UnitTest() {
  const template = usePromptStore((s) => s.template)
  const selectedModel = usePromptStore((s) => s.selectedModel)
  const addResult = useResultStore((s) => s.addResult)

  const vars = parseVariables(template)

  const [cases, setCases] = useState<TestCase[]>([
    { variables: {}, expected: '', mode: 'semantic' },
  ])
  const [results, setResults] = useState<TestCaseResult[]>([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const canRun = selectedModel && template.trim() && cases.some((c) => c.expected.trim())

  function addCase() {
    setCases([...cases, { variables: {}, expected: '', mode: 'semantic' }])
  }

  function removeCase(index: number) {
    setCases(cases.filter((_, i) => i !== index))
  }

  function updateCase(index: number, updates: Partial<TestCase>) {
    setCases(cases.map((c, i) => (i === index ? { ...c, ...updates } : c)))
  }

  function updateVariable(index: number, key: string, value: string) {
    const c = cases[index]
    updateCase(index, { variables: { ...c.variables, [key]: value } })
  }

  async function runTests() {
    if (!canRun) return
    setRunning(true)
    setProgress(0)
    setResults([])

    const { provider, model } = parseModelSelection(selectedModel)
    const testResults: TestCaseResult[] = []

    for (let i = 0; i < cases.length; i++) {
      const tc = cases[i]
      const prompt = template.replace(VAR_REGEX, (_, key) => tc.variables[key] ?? `{{${key}}}`)

      try {
        const res = await callLLM(provider, model, prompt)
        const evalResult = await evaluate(res.text, tc.expected, tc.mode, provider, model)
        testResults.push({ ...tc, actual: res.text, evalResult })
      } catch (e) {
        testResults.push({
          ...tc,
          actual: '',
          evalResult: null,
          error: e instanceof Error ? e.message : 'Unknown error',
        })
      }
      setProgress(i + 1)
    }

    setResults(testResults)
    setRunning(false)

    const passed = testResults.filter((r) => r.evalResult?.pass).length
    addResult({
      type: 'unit',
      prompt: template,
      model: selectedModel,
      summary: `${passed}/${testResults.length} passed`,
      score: testResults.length > 0 ? passed / testResults.length : 0,
      data: testResults,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {cases.map((tc, i) => (
          <div key={i} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Case #{i + 1}</span>
              {cases.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeCase(i)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            {vars.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {vars.map((v) => (
                  <div key={v} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{`{{${v}}}`}</Label>
                    <Input
                      placeholder={v}
                      value={tc.variables[v] ?? ''}
                      onChange={(e) => updateVariable(i, v, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Expected</Label>
                <Input
                  placeholder="Expected result"
                  value={tc.expected}
                  onChange={(e) => updateCase(i, { expected: e.target.value })}
                />
              </div>
              <div className="w-32 space-y-1">
                <Label className="text-xs text-muted-foreground">Mode</Label>
                <Select
                  value={tc.mode}
                  onValueChange={(v) => v && updateCase(i, { mode: v as EvalMode })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semantic">Semantic</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                    <SelectItem value="exact">Exact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addCase}>
          <Plus className="h-4 w-4 mr-1" />
          Add Case
        </Button>
        <Button onClick={runTests} disabled={!canRun || running}>
          {running ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {progress}/{cases.length}
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Pass Rate</p>
            <p className="text-2xl font-bold">
              {results.filter((r) => r.evalResult?.pass).length}/{results.length}
            </p>
          </div>

          {results.map((r, i) => (
            <details key={i} className="rounded-lg border border-border">
              <summary className="px-4 py-2 cursor-pointer text-sm flex items-center gap-2">
                <span className="font-medium">Case #{i + 1}</span>
                {r.error ? (
                  <Badge variant="destructive">Error</Badge>
                ) : r.evalResult?.pass ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Pass</Badge>
                ) : (
                  <Badge variant="destructive">Fail</Badge>
                )}
              </summary>
              <div className="px-4 pb-3 text-sm space-y-1">
                {r.error ? (
                  <p className="text-destructive">{r.error}</p>
                ) : (
                  <>
                    <p><span className="text-muted-foreground">Expected:</span> {r.expected}</p>
                    <p><span className="text-muted-foreground">Actual:</span> {r.actual}</p>
                    <p><span className="text-muted-foreground">Reason:</span> {r.evalResult?.reason}</p>
                  </>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
