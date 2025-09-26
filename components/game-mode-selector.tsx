"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type GameMode, GAME_MODES } from "@/lib/game-modes"
import { Music, Hash } from "lucide-react"

interface GameModeSelectorProps {
  selectedMode: GameMode | null
  onModeSelect: (mode: GameMode) => void
}

export function GameModeSelector({ selectedMode, onModeSelect }: GameModeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Training Mode</h3>

      <div className="space-y-3">
        {Object.entries(GAME_MODES).map(([mode, config]) => (
          <Card
            key={mode}
            className={`cursor-pointer transition-colors ${
              selectedMode === mode ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
            }`}
            onClick={() => onModeSelect(mode as GameMode)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {mode === "absolute" ? (
                  <Music className="h-4 w-4 text-primary" />
                ) : (
                  <Hash className="h-4 w-4 text-accent" />
                )}
                {config.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">{config.description}</p>
              <p className="text-xs text-muted-foreground mt-2 font-mono">Example: {config.examples[0]}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
