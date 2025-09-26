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
        if (difficultyLevel.useInversions) {
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
      difficultyLevel.chordTypes.forEach((chordType) => {
        let romanChord = roman

        if (chordType === "major7") {
          romanChord = roman === roman.toLowerCase() ? `${roman}maj7` : `${roman}maj7`
        } else if (chordType === "minor7") {
          romanChord = roman === roman.toLowerCase() ? `${roman}7` : `${roman.toLowerCase()}7`
        } else if (chordType === "dominant7") {
          romanChord = `${roman}7`
        } else if (chordType === "diminished7") {
          romanChord = `${roman}°7`
        } else if (chordType === "halfDiminished7") {
          romanChord = `${roman}ø7`
        } else if (chordType === "major9") {
          romanChord = `${roman}maj9`
        } else if (chordType === "minor9") {
          romanChord = `${roman}9`
        } else if (chordType === "dominant9") {
          romanChord = `${roman}9`
        }

        if (!romanOptions.includes(romanChord)) {
          romanOptions.push(romanChord)

          // Add inversion options if enabled
          if (difficultyLevel.useInversions) {
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
