import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    models: [
      { id: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
    ],
  },
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-5.4', label: 'GPT-5.4' },
      { id: 'gpt-5.4-mini', label: 'GPT-5.4 Mini' },
      { id: 'gpt-5.4-nano', label: 'GPT-5.4 Nano' },
      { id: 'gpt-5', label: 'GPT-5' },
      { id: 'gpt-5-mini', label: 'GPT-5 Mini' },
      { id: 'o3', label: 'o3' },
      { id: 'o4-mini', label: 'o4 Mini' },
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    ],
  },
  google: {
    name: 'Google',
    models: [
      { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    ],
  },
} as const

type ProviderId = keyof typeof PROVIDERS

interface SettingsState {
  apiKeys: Record<ProviderId, string>
  setApiKey: (provider: ProviderId, key: string) => void
  getAvailableModels: () => { provider: ProviderId; id: string; label: string }[]
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      apiKeys: {
        anthropic: '',
        openai: '',
        google: '',
      },
      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),
      getAvailableModels: () => {
        const { apiKeys } = get()
        return (Object.entries(PROVIDERS) as [ProviderId, (typeof PROVIDERS)[ProviderId]][])
          .filter(([id]) => apiKeys[id].length > 0)
          .flatMap(([providerId, provider]) =>
            provider.models.map((model) => ({
              provider: providerId,
              id: model.id,
              label: `${provider.name} / ${model.label}`,
            })),
          )
      },
    }),
    { name: 'prompt-forge-settings' },
  ),
)

export { PROVIDERS, useSettingsStore }
export type { ProviderId }
