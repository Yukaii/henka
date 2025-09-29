"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DIFFICULTY_LEVELS } from "@/lib/chord-generator"
import { Star, TrendingUp, Zap, RotateCcw, Heart, Wrench } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"
import { useSettings } from "@/components/settings-provider"
import {
  formatChordTypeBadge,
  formatExtraChordTypes,
  formatInversionProbability,
  formatKeysWithOptions,
} from "@/lib/i18n"

interface DifficultySelectorProps {
  selectedDifficulty: string | null
  onDifficultySelect: (difficulty: string) => void
  onEditCustomDifficulty?: () => void
}

const DIFFICULTY_ICONS = {
  easy: Heart,
  beginner: Star,
  intermediate: TrendingUp,
  advanced: Zap,
  custom: Wrench,
}

export function DifficultySelector({ selectedDifficulty, onDifficultySelect, onEditCustomDifficulty }: DifficultySelectorProps) {
  const t = useTranslations()
  const { language, customDifficulty } = useSettings()

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{t.home.difficultyHeading}</h3>

      <div className="space-y-3">
        {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => {
          const Icon = DIFFICULTY_ICONS[key as keyof typeof DIFFICULTY_ICONS]
          const messages = t.difficulties?.[key]
          const displayName = messages?.name ?? level.name
          const description = messages?.description ?? level.description
          const isCustom = key === "custom"
          const chordTypes = isCustom ? customDifficulty.chordTypes : level.chordTypes
          const useInversions = isCustom ? customDifficulty.useInversions : level.useInversions
          const inversionProbability = isCustom ? customDifficulty.inversionProbability : level.inversionProbability
          const maxInversion = isCustom ? customDifficulty.maxInversion : level.maxInversion
          const allowedKeys = isCustom ? customDifficulty.allowedKeys : level.allowedKeys

          return (
            <Card
              key={key}
              className={`cursor-pointer transition-colors ${
                selectedDifficulty === key ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
              onClick={() => onDifficultySelect(key)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {displayName}
                  </div>
                  <div className="flex items-center gap-2">
                    {isCustom && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation()
                          onEditCustomDifficulty?.()
                        }}
                      >
                        {t.customDifficulty.actions.configure}
                      </Button>
                    )}
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {formatChordTypeBadge(language, chordTypes.length)}
                      </Badge>
                      {useInversions && (
                        <Badge variant="outline" className="text-xs">
                          <RotateCcw className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                    <div className="flex flex-wrap gap-1">
                      {chordTypes.slice(0, 4).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    {chordTypes.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        {formatExtraChordTypes(language, chordTypes.length - 4)}
                      </Badge>
                    )}
                  </div>
                  {useInversions && (
                    <p className="text-xs text-muted-foreground">
                      {formatInversionProbability(language, inversionProbability, maxInversion)}
                    </p>
                  )}
                  {allowedKeys && (
                    <p className="text-xs text-muted-foreground">
                      {formatKeysWithOptions(
                        language,
                        allowedKeys,
                        allowedKeys.length * chordTypes.length,
                      )}
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
