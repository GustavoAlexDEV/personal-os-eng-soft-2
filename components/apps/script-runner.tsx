"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlayIcon } from "lucide-react"

interface ScriptRunnerProps {
  script?: string
}

export function ScriptRunner({ script = "" }: ScriptRunnerProps) {
  const [output, setOutput] = useState<string[]>([])

  const runScript = () => {
    setOutput([])
    const logs: string[] = []

    // Override console.log to capture output
    const originalLog = console.log
    console.log = (...args: any[]) => {
      logs.push(args.map((arg) => String(arg)).join(" "))
      originalLog(...args)
    }

    try {
      // eslint-disable-next-line no-eval
      eval(script)
      setOutput(logs.length > 0 ? logs : ["Script executado com sucesso!"])
    } catch (error) {
      setOutput([`Erro: ${error instanceof Error ? error.message : String(error)}`])
    } finally {
      console.log = originalLog
    }
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex-1 overflow-auto rounded-md border border-border bg-muted p-4 font-mono text-sm">
        <pre className="whitespace-pre-wrap">{script}</pre>
      </div>

      <Button onClick={runScript} className="mb-4">
        <PlayIcon className="mr-2 h-4 w-4" />
        Executar Script
      </Button>

      {output.length > 0 && (
        <div className="rounded-md border border-border bg-background p-4">
          <p className="mb-2 text-sm font-medium">Saída:</p>
          <div className="space-y-1 font-mono text-sm">
            {output.map((line, i) => (
              <div key={i} className="text-muted-foreground">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
