import { useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePromptStore } from '@/stores/prompt-store'
import { useSettingsStore } from '@/stores/settings-store'

const UNCLOSED_REGEX = /\{\{(?!\w+\}\})/
const VAR_REGEX = /\{\{(\w+)\}\}/g

function parseVarsFromTemplate(template: string): string[] {
  const matches = new Set<string>()
  let match: RegExpExecArray | null
  const regex = new RegExp(VAR_REGEX)
  while ((match = regex.exec(template)) !== null) {
    matches.add(match[1])
  }
  return [...matches]
}

export function PromptEditor() {
  const template = usePromptStore((s) => s.template)
  const variables = usePromptStore((s) => s.variables)
  const selectedModel = usePromptStore((s) => s.selectedModel)
  const setTemplate = usePromptStore((s) => s.setTemplate)
  const setVariable = usePromptStore((s) => s.setVariable)
  const setSelectedModel = usePromptStore((s) => s.setSelectedModel)
  const apiKeys = useSettingsStore((s) => s.apiKeys)

  const parsedVars = useMemo(() => parseVarsFromTemplate(template), [template])
  const availableModels = useMemo(() => useSettingsStore.getState().getAvailableModels(), [apiKeys])

  const hasUnclosed = UNCLOSED_REGEX.test(template)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt-template">Prompt Template</Label>
          <Select value={selectedModel} onValueChange={(v) => v && setSelectedModel(v)}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.length === 0 && (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">
                  Settings에서 API Key를 입력하세요
                </p>
              )}
              {availableModels.map((m) => (
                <SelectItem key={`${m.provider}:${m.id}`} value={`${m.provider}:${m.id}`}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea
          id="prompt-template"
          placeholder="Enter your prompt... Use {{variable}} for template variables"
          className="min-h-[120px] font-mono text-sm"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />
        {hasUnclosed && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Unclosed {'{{'}  detected
          </p>
        )}
      </div>

      {parsedVars.length > 0 && (
        <div className="space-y-2">
          <Label>Variables</Label>
          <div className="grid grid-cols-2 gap-2">
            {parsedVars.map((v) => (
              <div key={v} className="space-y-1">
                <Label htmlFor={`var-${v}`} className="text-xs text-muted-foreground">
                  {`{{${v}}}`}
                </Label>
                <Input
                  id={`var-${v}`}
                  placeholder={v}
                  value={variables[v] ?? ''}
                  onChange={(e) => setVariable(v, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
