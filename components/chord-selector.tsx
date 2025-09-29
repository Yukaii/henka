"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KEYS, DIFFICULTY_LEVELS } from "@/lib/chord-generator"
import type { GameMode } from "@/lib/game-modes"

interface ChordSelectorProps {
  value: string
  onChange: (value: string) => void
  mode: GameMode
  difficulty: string
  disabled?: boolean
  placeholder?: string
}

export function ChordSelector({ value, onChange, mode, difficulty, disabled, placeholder }: ChordSelectorProps) {
  const difficultyLevel = DIFFICULTY_LEVELS[difficulty]
  const showInversions = (difficulty === "advanced" || difficulty === "custom") && difficultyLevel?.useInversions

  if (mode === "absolute") {
    // Generate all possible chord combinations for absolute mode
    const chordOptions: string[] = []
    
    // Use allowed keys if specified, otherwise use all keys
    const keysToUse = difficultyLevel.allowedKeys || KEYS

    keysToUse.forEach((key) => {
      difficultyLevel.chordTypes.forEach((chordType) => {
        const chordName = `${key}${chordType === "major" ? "" : chordType}`
        chordOptions.push(chordName)

        // Add inversion options if enabled
        if (showInversions) {
          for (let inv = 1; inv <= difficultyLevel.maxInversion; inv++) {
            const inversionSuffix = inv === 1 ? "/1st" : inv === 2 ? "/2nd" : inv === 3 ? "/3rd" : `/${inv}th`
            chordOptions.push(`${chordName}${inversionSuffix}`)
          }
        }
      })
    })

    // Sort chords by root note, then by type
    chordOptions.sort((a, b) => {
      const aRoot = a.charAt(0)
      const bRoot = b.charAt(0)
      if (aRoot !== bRoot) {
        return KEYS.indexOf(aRoot) - KEYS.indexOf(bRoot)
      }
      return a.localeCompare(b)
    })

    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder || "Select chord"} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {chordOptions.map((chord) => (
            <SelectItem key={chord} value={chord}>
              {chord}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  } else {
    // Roman numeral mode
    const romanOptions: string[] = []

    // Generate Roman numerals based on difficulty
    const baseRomanNumerals = ["I", "ii", "iii", "IV", "V", "vi", "vii°"]

    baseRomanNumerals.forEach((roman) => {
      const core = roman.replace(/[°]/g, "")

      difficultyLevel.chordTypes.forEach((chordType) => {
        let romanChord = roman

        switch (chordType) {
          case "major":
            romanChord = core.toUpperCase()
            break
          case "minor":
            romanChord = core.toLowerCase()
            break
          case "diminished":
            romanChord = `${core.toLowerCase()}°`
            break
          case "augmented":
            romanChord = `${core.toUpperCase()}+`
            break
          case "major7":
            romanChord = `${core.toUpperCase()}maj7`
            break
          case "minor7":
            romanChord = `${core.toLowerCase()}7`
            break
          case "dominant7":
            romanChord = `${core.toUpperCase()}7`
            break
          case "diminished7":
            romanChord = `${core.toLowerCase()}°7`
            break
          case "halfDiminished7":
            romanChord = `${core.toLowerCase()}ø7`
            break
          case "major9":
            romanChord = `${core.toUpperCase()}maj9`
            break
          case "minor9":
            romanChord = `${core.toLowerCase()}m9`
            break
          case "dominant9":
            romanChord = `${core.toUpperCase()}9`
            break
          case "major11":
            romanChord = `${core.toUpperCase()}maj11`
            break
          case "minor11":
            romanChord = `${core.toLowerCase()}m11`
            break
          default:
            romanChord = core
        }

        if (!romanOptions.includes(romanChord)) {
          romanOptions.push(romanChord)

          if (showInversions) {
            for (let inv = 1; inv <= difficultyLevel.maxInversion; inv++) {
              const inversionSuffix = inv === 1 ? "/1st" : inv === 2 ? "/2nd" : inv === 3 ? "/3rd" : `/${inv}th`
              romanOptions.push(`${romanChord}${inversionSuffix}`)
            }
          }
        }
      })
    })

    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder || "Select numeral"} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {romanOptions.map((roman) => (
            <SelectItem key={roman} value={roman}>
              {roman}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
}
