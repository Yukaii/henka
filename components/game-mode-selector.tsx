"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type GameMode, GAME_MODES } from "@/lib/game-modes"
import { Music, Hash } from "lucide-react"

interface GameModeSelectorProps {
  selectedMode: GameMode | null
  onModeSelect: (mode: GameMode) => void
  onStart: () => void
}

export function GameModeSelector({ selectedMode, onModeSelect, onStart }: GameModeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-balance">Choose Your Training Mode</h2>
        <p className="text-muted-foreground text-pretty">
          Select how you want to practice chord progression recognition
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(GAME_MODES).map(([mode, config]) => (
          <Card
            key={mode}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedMode === mode ? "ring-2 ring-primary bg-card/80" : "hover:bg-card/60"
            }`}
            onClick={() => onModeSelect(mode as GameMode)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                {mode === "absolute" ? (
                  <Music className="h-6 w-6 text-primary" />
                ) : (
                  <Hash className="h-6 w-6 text-accent" />
                )}
                <div>
                  <CardTitle className="text-lg">{config.name}</CardTitle>
                  <Badge variant={mode === "absolute" ? "default" : "secondary"} className="mt-1">
                    {mode === "absolute" ? "Chord Names" : "Roman Numerals"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed">{config.description}</CardDescription>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Instructions:</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{config.instructions}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Answer Format:</p>
                <p className="text-sm text-muted-foreground">{config.answerFormat}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Examples:</p>
                <div className="space-y-1">
                  {config.examples.slice(0, 2).map((example, index) => (
                    <p key={index} className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                      {example}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMode && (
        <div className="flex justify-center pt-4">
          <Button onClick={onStart} size="lg" className="px-8">
            Start Training with {GAME_MODES[selectedMode].name}
          </Button>
        </div>
      )}
    </div>
  )
}
