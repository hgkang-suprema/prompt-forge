import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type TestType = 'stress' | 'unit' | 'benchmark'

interface TestResult {
  id: string
  type: TestType
  timestamp: number
  prompt: string
  model: string
  summary: string
  score?: number
  data: unknown
}

interface ResultState {
  history: TestResult[]
  selectedResultId: string | null
  addResult: (result: Omit<TestResult, 'id' | 'timestamp'>) => void
  selectResult: (id: string | null) => void
  getSelectedResult: () => TestResult | undefined
  clearHistory: () => void
}

const MAX_HISTORY = 20

const useResultStore = create<ResultState>()(
  persist(
    (set, get) => ({
      history: [],
      selectedResultId: null,
      addResult: (result) =>
        set((state) => {
          const newResult: TestResult = {
            ...result,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          }
          const history = [newResult, ...state.history].slice(0, MAX_HISTORY)
          return { history, selectedResultId: newResult.id }
        }),
      selectResult: (id) => set({ selectedResultId: id }),
      getSelectedResult: () => {
        const { history, selectedResultId } = get()
        return history.find((r) => r.id === selectedResultId)
      },
      clearHistory: () => set({ history: [], selectedResultId: null }),
    }),
    { name: 'prompt-forge-results' },
  ),
)

export { useResultStore }
export type { TestResult, TestType }
