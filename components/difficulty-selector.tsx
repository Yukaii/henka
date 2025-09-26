"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DIFFICULTY_LEVELS } from "@/lib/chord-generator"
import { Star, TrendingUp, Zap, RotateCcw } from "lucide-react"

interface DifficultySelectorProps {
  selectedDifficulty: string | null
  onDifficultySelect: (difficulty: string) => void
}

const DIFFICULTY_ICONS = {
  beginner: Star,
  intermediate: TrendingUp,
  advanced: Zap,
}

const DIFFICULTY_COLORS = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function DifficultySelector({ selectedDifficulty, onDifficultySelect }: DifficultySelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Select Difficulty</h3>
        <p className="text-muted-foreground text-sm">Choose the complexity level for your training session</p>
      </div>

      <div className="grid gap-4">
        {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => {
          const Icon = DIFFICULTY_ICONS[key as keyof typeof DIFFICULTY_ICONS]
          const colorClass = DIFFICULTY_COLORS[key as keyof typeof DIFFICULTY_COLORS]

          return (
            <Card
              key={key}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedDifficulty === key ? "ring-2 ring-primary bg-card/80" : "hover:bg-card/60"
              }`}
              onClick={() => onDifficultySelect(key)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{level.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={colorClass}>{level.chordTypes.length} chord types</Badge>
                    {level.useInversions && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" />
                        Inversions
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Chord Types:</p>
                  <div className="flex flex-wrap gap-1">
                    {level.chordTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {level.useInversions && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Inversion Settings:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• {Math.round(level.inversionProbability * 100)}% chance of inversions</p>
                      <p>
                        • Up to{" "}
                        {level.maxInversion === 1
                          ? "1st"
                          : level.maxInversion === 2
                            ? "2nd"
                            : level.maxInversion === 3
                              ? "3rd"
                              : `${level.maxInversion}th`}{" "}
                        inversion
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Common Progressions:</p>
                  <div className="space-y-1">
                    {level.commonProgressions.slice(0, 2).map((progression, index) => (
                      <p key={index} className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        {progression.join(" - ")}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
