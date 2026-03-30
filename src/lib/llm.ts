import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { useSettingsStore } from '@/stores/settings-store'
import type { ProviderId } from '@/stores/settings-store'

interface LLMResponse {
  text: string
  tokensUsed: number
  latencyMs: number
}

function createProvider(providerId: ProviderId) {
  const apiKey = useSettingsStore.getState().apiKeys[providerId]
  if (!apiKey) throw new Error(`No API key set for ${providerId}`)

  const isDev = import.meta.env.DEV

  switch (providerId) {
    case 'anthropic':
      return createAnthropic({
        apiKey,
        ...(isDev && { baseURL: '/api/anthropic' }),
      })
    case 'openai':
      return createOpenAI({
        apiKey,
        ...(isDev && { baseURL: '/api/openai/v1' }),
      })
    case 'google':
      return createGoogleGenerativeAI({
        apiKey,
        ...(isDev && { baseURL: '/api/google/v1beta' }),
      })
  }
}

export async function callLLM(
  providerId: ProviderId,
  modelId: string,
  prompt: string,
): Promise<LLMResponse> {
  const provider = createProvider(providerId)
  const start = performance.now()

  const result = await generateText({
    model: provider(modelId),
    prompt,
  })

  const latencyMs = Math.round(performance.now() - start)

  return {
    text: result.text,
    tokensUsed: (result.usage?.inputTokens ?? 0) + (result.usage?.outputTokens ?? 0),
    latencyMs,
  }
}

export function parseModelSelection(value: string): { provider: ProviderId; model: string } {
  const [provider, model] = value.split(':') as [ProviderId, string]
  return { provider, model }
}
