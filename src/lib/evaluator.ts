import { callLLM } from './llm'
import type { ProviderId } from '@/stores/settings-store'

type EvalMode = 'semantic' | 'contains' | 'regex' | 'exact'

interface EvalResult {
  pass: boolean
  reason: string
}

export async function evaluate(
  actual: string,
  expected: string,
  mode: EvalMode,
  judgeProvider?: ProviderId,
  judgeModel?: string,
): Promise<EvalResult> {
  switch (mode) {
    case 'exact':
      return {
        pass: actual.trim() === expected.trim(),
        reason: actual.trim() === expected.trim() ? 'Exact match' : 'Does not match exactly',
      }
    case 'contains':
      return {
        pass: actual.toLowerCase().includes(expected.toLowerCase()),
        reason: actual.toLowerCase().includes(expected.toLowerCase())
          ? `Contains "${expected}"`
          : `Does not contain "${expected}"`,
      }
    case 'regex': {
      try {
        const regex = new RegExp(expected, 'i')
        const pass = regex.test(actual)
        return { pass, reason: pass ? `Matches /${expected}/i` : `Does not match /${expected}/i` }
      } catch {
        return { pass: false, reason: `Invalid regex: ${expected}` }
      }
    }
    case 'semantic': {
      if (!judgeProvider || !judgeModel) {
        throw new Error('Semantic evaluation requires a judge model')
      }
      const judgePrompt = `You are a strict evaluator. Determine if the ACTUAL response semantically matches the EXPECTED response.

EXPECTED: ${expected}

ACTUAL: ${actual}

Reply with exactly "PASS" if they convey the same meaning, or "FAIL: <reason>" if they don't.`

      const result = await callLLM(judgeProvider, judgeModel, judgePrompt)
      const pass = result.text.trim().toUpperCase().startsWith('PASS')
      return {
        pass,
        reason: result.text.trim(),
      }
    }
  }
}

export type { EvalMode, EvalResult }
