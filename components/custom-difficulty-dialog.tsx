"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useSettings } from "@/components/settings-provider"
import type { CustomDifficultySettings } from "@/lib/chord-generator"

const CHORD_TYPE_GROUPS: Array<{ label: string; types: string[]; helper: string }> = [
  {
    label: "Triads",
    helper: "Foundational sonorities",
    types: ["major", "minor", "diminished", "augmented"],
  },
  {
    label: "Sevenths",
    helper: "Adds leading tones",
    types: ["major7", "minor7", "dominant7", "diminished7", "halfDiminished7"],
  },
  {
    label: "Extensions",
    helper: "Color tones and tensions",
    types: ["major9", "minor9", "dominant9", "major11", "minor11"],
  },
]

const PROGRESSION_LENGTH_OPTIONS = [3, 4, 5, 6, 7, 8]
const MAX_INVERSION_OPTIONS = [1, 2, 3, 4, 5]
const INVERSION_INTENSITY_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 0.2, label: "Subtle (20%)" },
  { value: 0.4, label: "Occasional (40%)" },
  { value: 0.6, label: "Frequent (60%)" },
  { value: 0.8, label: "Bold (80%)" },
]

interface CustomDifficultyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomDifficultyDialog({ open, onOpenChange }: CustomDifficultyDialogProps) {
  const { customDifficulty, setCustomDifficulty } = useSettings()
  const [localConfig, setLocalConfig] = useState<CustomDifficultySettings>(customDifficulty)

  useEffect(() => {
    if (open) {
      setLocalConfig(customDifficulty)
    }
  }, [customDifficulty, open])

  const handleToggleChordType = (type: string) => {
    setLocalConfig((prev) => {
      const selected = prev.chordTypes.includes(type)

      if (selected && prev.chordTypes.length === 1) {
        return prev
      }

      const nextTypes = selected
        ? prev.chordTypes.filter((item) => item !== type)
        : [...prev.chordTypes, type]

      return { ...prev, chordTypes: nextTypes }
    })
  }

  const handleProgressionLengthChange = (value: string) => {
    const length = Number.parseInt(value, 10)
    if (Number.isNaN(length)) return
    setLocalConfig((prev) => ({ ...prev, progressionLength: length }))
  }

  const handleUseInversionsChange = (enabled: boolean) => {
    setLocalConfig((prev) => ({
      ...prev,
      useInversions: enabled,
      maxInversion: enabled ? Math.max(prev.maxInversion, 1) : 0,
      inversionProbability: enabled ? Math.max(prev.inversionProbability, 0.2) : 0,
    }))
  }

  const handleMaxInversionChange = (value: string) => {
    const max = Number.parseInt(value, 10)
    if (Number.isNaN(max)) return
    setLocalConfig((prev) => ({ ...prev, maxInversion: max }))
  }

  const handleInversionIntensityChange = (value: string) => {
    const numeric = Number.parseFloat(value)
    if (Number.isNaN(numeric)) return
    setLocalConfig((prev) => ({ ...prev, inversionProbability: numeric }))
  }

  const handleVoiceLeadingChange = (enabled: boolean) => {
    setLocalConfig((prev) => ({ ...prev, useVoiceLeading: enabled }))
  }

  const handleSave = () => {
    setCustomDifficulty(localConfig)
    onOpenChange(false)
  }

  const selectedChordTypes = useMemo(
    () => new Set(localConfig.chordTypes),
    [localConfig.chordTypes],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogTitle className="text-lg font-semibold">Custom difficulty</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Choose the chord families you want to drill and dial in inversion behavior.
        </DialogDescription>

        <div className="mt-4 space-y-6">
          <section className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">Chord families</h3>
              <Badge variant="outline" className="text-xs">
                {selectedChordTypes.size} selected
              </Badge>
            </div>
            <div className="space-y-3">
              {CHORD_TYPE_GROUPS.map((group) => (
                <div key={group.label} className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium">{group.label}</span>
                    <span className="text-xs text-muted-foreground">{group.helper}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.types.map((type) => {
                      const active = selectedChordTypes.has(type)
                      return (
                        <Button
                          key={type}
                          type="button"
                          variant={active ? "default" : "outline"}
                          className="h-auto rounded-full px-3 py-1 text-xs capitalize"
                          onClick={() => handleToggleChordType(type)}
                        >
                          {type}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Progression length</h3>
                <p className="text-xs text-muted-foreground">How many chords per exercise.</p>
              </div>
              <Select value={String(localConfig.progressionLength)} onValueChange={handleProgressionLengthChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRESSION_LENGTH_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option} chords
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold">Inversions</h3>
                <p className="text-xs text-muted-foreground">
                  Enable drop-in inversions and control how adventurous they are.
                </p>
              </div>
              <Switch checked={localConfig.useInversions} onCheckedChange={handleUseInversionsChange} />
            </div>

            {localConfig.useInversions && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Max inversion</p>
                  <Select value={String(localConfig.maxInversion)} onValueChange={handleMaxInversionChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAX_INVERSION_OPTIONS.map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option === 1 ? "1st" : option === 2 ? "2nd" : option === 3 ? "3rd" : `${option}th`} inversion
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inversion frequency</p>
                  <Select
                    value={String(localConfig.inversionProbability)}
                    onValueChange={handleInversionIntensityChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVERSION_INTENSITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </section>

          <section className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Voice leading</h3>
              <p className="text-xs text-muted-foreground">Keep chords smooth and closely spaced.</p>
            </div>
            <Switch checked={localConfig.useVoiceLeading} onCheckedChange={handleVoiceLeadingChange} />
          </section>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave}>
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
