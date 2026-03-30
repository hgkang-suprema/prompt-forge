import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PROVIDERS, useSettingsStore } from '@/stores/settings-store'
import type { ProviderId } from '@/stores/settings-store'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const apiKeys = useSettingsStore((s) => s.apiKeys)
  const setApiKey = useSettingsStore((s) => s.setApiKey)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Key Settings</DialogTitle>
          <DialogDescription>
            API Key는 브라우저 로컬 스토리지에만 저장됩니다. 서버로 전송되지
            않습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {(Object.entries(PROVIDERS) as [ProviderId, (typeof PROVIDERS)[ProviderId]][]).map(
            ([id, provider]) => (
              <div key={id} className="space-y-1.5">
                <Label htmlFor={`key-${id}`}>{provider.name}</Label>
                <Input
                  id={`key-${id}`}
                  type="password"
                  placeholder={`${provider.name} API Key`}
                  value={apiKeys[id]}
                  onChange={(e) => setApiKey(id, e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Models: {provider.models.map((m) => m.label).join(', ')}
                </p>
              </div>
            ),
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
