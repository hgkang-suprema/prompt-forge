import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sidebar } from '@/components/layout/sidebar'
import { SettingsDialog } from '@/components/settings-dialog'
import { PromptEditor } from '@/components/prompt-editor'
import { StressTest } from '@/components/stress-test'
import { UnitTest } from '@/components/unit-test'
import { Benchmark } from '@/components/benchmark'
import { Analytics } from '@/components/analytics'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="h-screen flex bg-background text-foreground">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <PromptEditor />

          <Tabs defaultValue="runner">
            <TabsList>
              <TabsTrigger value="runner">Runner</TabsTrigger>
              <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="runner" className="mt-4 space-y-6">
              <div>
                <h3 className="font-medium mb-3">Stress Test</h3>
                <StressTest />
              </div>
              <div>
                <h3 className="font-medium mb-3">Unit Test</h3>
                <UnitTest />
              </div>
            </TabsContent>

            <TabsContent value="benchmark" className="mt-4">
              <Benchmark />
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <Analytics />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}

export default App
