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

export function DifficultySelector({ selectedDifficulty, onDifficultySelect }: DifficultySelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Difficulty Level</h3>

      <div className="space-y-3">
        {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => {
          const Icon = DIFFICULTY_ICONS[key as keyof typeof DIFFICULTY_ICONS]

          return (
            <Card
              key={key}
              className={`cursor-pointer transition-colors ${
                selectedDifficulty === key ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
              onClick={() => onDifficultySelect(key)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {level.name}
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {level.chordTypes.length} types
                    </Badge>
                    {level.useInversions && (
                      <Badge variant="outline" className="text-xs">
                        <RotateCcw className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {level.chordTypes.slice(0, 4).map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {level.chordTypes.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{level.chordTypes.length - 4} more
                      </Badge>
                    )}
                  </div>
                  {level.useInversions && (
                    <p className="text-xs text-muted-foreground">
                      {Math.round(level.inversionProbability * 100)}% inversions up to{" "}
                      {level.maxInversion === 1 ? "1st" : level.maxInversion === 2 ? "2nd" : "3rd"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
