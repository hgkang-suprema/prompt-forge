export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dotProduct / denom
}

export function averagePairwiseSimilarity(embeddings: number[][]): number {
  if (embeddings.length < 2) return 1

  let total = 0
  let count = 0
  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      total += cosineSimilarity(embeddings[i], embeddings[j])
      count++
    }
  }
  return total / count
}

export function similarityLabel(score: number): { label: string; color: string } {
  if (score >= 0.95) return { label: 'Very Consistent', color: 'text-green-500' }
  if (score >= 0.7) return { label: 'Moderate', color: 'text-yellow-500' }
  return { label: 'Unstable', color: 'text-red-500' }
}
