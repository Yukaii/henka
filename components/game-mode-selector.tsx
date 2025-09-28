"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type GameMode, GAME_MODES } from "@/lib/game-modes"
import { Music, Hash } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"

interface GameModeSelectorProps {
  selectedMode: GameMode | null
  onModeSelect: (mode: GameMode) => void
}

export function GameModeSelector({ selectedMode, onModeSelect }: GameModeSelectorProps) {
  const t = useTranslations()

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{t.home.trainingModeHeading}</h3>

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
                {t.gameModes?.[mode as GameMode]?.name ?? config.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.gameModes?.[mode as GameMode]?.description ?? config.description}
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                {t.home.exampleLabel} {config.examples[0]}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
