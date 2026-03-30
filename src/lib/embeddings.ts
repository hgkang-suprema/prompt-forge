import { useSettingsStore } from '@/stores/settings-store'

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = useSettingsStore.getState().apiKeys.openai
  if (!apiKey) {
    throw new Error('OpenAI API key is required for embedding-based similarity')
  }

  const isDev = import.meta.env.DEV
  const baseUrl = isDev ? '/api/openai/v1' : 'https://api.openai.com/v1'

  const response = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Embedding API error: ${error}`)
  }

  const data = await response.json()
  return data.data.map((item: { embedding: number[] }) => item.embedding)
}
