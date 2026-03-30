import { Clock, FlaskConical, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useResultStore } from '@/stores/result-store'
import type { TestType } from '@/stores/result-store'

const TYPE_LABELS: Record<TestType, string> = {
  stress: 'Stress',
  unit: 'Unit',
  benchmark: 'Benchmark',
}

interface SidebarProps {
  onOpenSettings: () => void
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const history = useResultStore((s) => s.history)
  const selectedResultId = useResultStore((s) => s.selectedResultId)
  const selectResult = useResultStore((s) => s.selectResult)

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-4 flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-primary" />
        <h1 className="font-bold text-lg">Prompt Forge</h1>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="text-xs font-medium text-muted-foreground px-2 py-1">
          <Clock className="inline h-3 w-3 mr-1" />
          History
        </p>
        {history.length === 0 && (
          <p className="text-xs text-muted-foreground px-2 py-2">
            No results yet
          </p>
        )}
        {history.map((r) => (
          <button
            key={r.id}
            onClick={() => selectResult(r.id)}
            className={`w-full text-left px-2 py-1.5 rounded-md text-sm truncate transition-colors ${
              selectedResultId === r.id
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <span className="text-xs font-medium text-muted-foreground mr-1">
              [{TYPE_LABELS[r.type]}]
            </span>
            {r.summary}
          </button>
        ))}
      </div>

      <Separator />

      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onOpenSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </aside>
  )
}
