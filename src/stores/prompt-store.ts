import { create } from 'zustand'

interface PromptState {
  template: string
  variables: Record<string, string>
  selectedModel: string
  setTemplate: (template: string) => void
  setVariable: (key: string, value: string) => void
  setSelectedModel: (model: string) => void
  getRenderedPrompt: () => string
  getParsedVariables: () => string[]
}

const VAR_REGEX = /\{\{(\w+)\}\}/g

const usePromptStore = create<PromptState>()((set, get) => ({
  template: '',
  variables: {},
  selectedModel: '',
  setTemplate: (template) => {
    const parsed = parseVariables(template)
    set((state) => {
      const next: Record<string, string> = {}
      for (const v of parsed) {
        next[v] = state.variables[v] ?? ''
      }
      return { template, variables: next }
    })
  },
  setVariable: (key, value) =>
    set((state) => ({
      variables: { ...state.variables, [key]: value },
    })),
  setSelectedModel: (model) => set({ selectedModel: model }),
  getRenderedPrompt: () => {
    const { template, variables } = get()
    return template.replace(VAR_REGEX, (_, key) => variables[key] ?? `{{${key}}}`)
  },
  getParsedVariables: () => parseVariables(get().template),
}))

function parseVariables(template: string): string[] {
  const matches = new Set<string>()
  let match: RegExpExecArray | null
  const regex = new RegExp(VAR_REGEX)
  while ((match = regex.exec(template)) !== null) {
    matches.add(match[1])
  }
  return [...matches]
}

export { usePromptStore }
