import type { Chord, ChordProgression } from "./audio-engine"

// Chord definitions with MIDI note numbers (C4 = 60)
export const CHORD_TYPES = {
  // Triads
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],

  // Seventh chords
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  diminished7: [0, 3, 6, 9],
  halfDiminished7: [0, 3, 6, 10],

  // Extended chords
  major9: [0, 4, 7, 11, 14],
  minor9: [0, 3, 7, 10, 14],
  dominant9: [0, 4, 7, 10, 14],
  major11: [0, 4, 7, 11, 14, 17],
  minor11: [0, 3, 7, 10, 14, 17],
}

export const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

export const ROMAN_NUMERALS = {
  major: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  minor: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
}

export interface DifficultyLevel {
  name: string
  chordTypes: string[]
  progressionLength: number
  commonProgressions: string[][]
  useInversions: boolean
  inversionProbability: number // 0-1, probability of using an inversion
  maxInversion: number // Maximum inversion to use (0=root, 1=first, 2=second, etc.)
  allowedKeys?: string[] // Optional: limit to specific keys for easier modes
}

export const DIFFICULTY_LEVELS: Record<string, DifficultyLevel> = {
  easy: {
    name: "Easy",
    chordTypes: ["major", "minor"],
    progressionLength: 4,
    commonProgressions: [
      ["I", "V", "vi", "IV"],
      ["vi", "IV", "I", "V"],
      ["I", "vi", "IV", "V"],
    ],
    useInversions: false,
    inversionProbability: 0,
    maxInversion: 0,
    allowedKeys: ["C", "G", "F", "D"], // Limit to common, easy keys
  },
  beginner: {
    name: "Beginner",
    chordTypes: ["major", "minor"],
    progressionLength: 4,
    commonProgressions: [
      ["I", "V", "vi", "IV"],
      ["vi", "IV", "I", "V"],
      ["I", "vi", "IV", "V"],
      ["ii", "V", "I", "vi"],
    ],
    useInversions: false,
    inversionProbability: 0,
    maxInversion: 0,
  },
  intermediate: {
    name: "Intermediate",
    chordTypes: ["major", "minor", "major7", "minor7", "dominant7"],
    progressionLength: 4,
    commonProgressions: [
      ["Imaj7", "vi7", "ii7", "V7"],
      ["vi7", "ii7", "V7", "Imaj7"],
      ["Imaj7", "IV7", "vii7", "iii7"],
      ["ii7", "V7", "Imaj7", "vi7"],
    ],
    useInversions: true,
    inversionProbability: 0.3,
    maxInversion: 1,
  },
  advanced: {
    name: "Advanced",
    chordTypes: [
      "major",
      "minor",
      "major7",
      "minor7",
      "dominant7",
      "diminished7",
      "halfDiminished7",
      "major9",
      "minor9",
    ],
    progressionLength: 6,
    commonProgressions: [
      ["Imaj9", "vi7", "ii7", "V7", "iii7", "vi7"],
      ["ii7", "V7", "Imaj9", "vi7", "ii7", "V7"],
      ["Imaj7", "vii7", "iii7", "vi7", "ii7", "V7"],
    ],
    useInversions: true,
    inversionProbability: 0.6,
    maxInversion: 3,
  },
}

export class ChordGenerator {
  private keyToMidi(key: string): number {
    const keyIndex = KEYS.indexOf(key)
    if (keyIndex === -1) {
      throw new Error(`Unknown key: ${key}`)
    }
    return 60 + keyIndex // C4 = 60
  }

  private romanToChordType(roman: string): string {
    if (roman.includes("maj9")) return "major9"
    if (roman.includes("maj7")) return "major7"
    if (roman.includes("9")) return roman.includes("m") ? "minor9" : "dominant9"
    if (roman.includes("7")) {
      if (roman.includes("°")) return "diminished7"
      if (roman.includes("ø")) return "halfDiminished7"
      return roman === roman.toUpperCase() ? "dominant7" : "minor7"
    }
    if (roman.includes("°")) return "diminished"
    return roman === roman.toUpperCase() ? "major" : "minor"
  }

  private romanToDegree(roman: string): number {
    const cleanRoman = roman.replace(/[maj79°ø]/g, "").split("/")[0]
    const romanMap: Record<string, number> = {
      I: 0,
      II: 1,
      III: 2,
      IV: 3,
      V: 4,
      VI: 5,
      VII: 6,
    }
    const degree = romanMap[cleanRoman.toUpperCase()]
    if (degree === undefined) {
      throw new Error(`Unknown Roman numeral: ${roman}`)
    }
    return degree
  }

  private applyInversion(notes: number[], inversion: number): number[] {
    if (inversion === 0 || inversion >= notes.length) {
      return notes // Root position or invalid inversion
    }

    const inverted = [...notes]

    // Move the bottom notes up an octave for each inversion
    for (let i = 0; i < inversion; i++) {
      const bottomNote = inverted.shift()!
      inverted.push(bottomNote + 12) // Add octave
    }

    return inverted
  }

  private getInversionName(inversion: number): string {
    switch (inversion) {
      case 0:
        return ""
      case 1:
        return "/1st"
      case 2:
        return "/2nd"
      case 3:
        return "/3rd"
      default:
        return `/${inversion}th`
    }
  }

  generateChord(root: string, chordType: string, octave = 4, inversion = 0): Chord {
    const rootMidi = this.keyToMidi(root) + (octave - 4) * 12
    const intervals = CHORD_TYPES[chordType as keyof typeof CHORD_TYPES]

    if (!intervals) {
      throw new Error(`Unknown chord type: ${chordType}`)
    }

    let notes = intervals.map((interval) => rootMidi + interval)

    if (inversion > 0) {
      notes = this.applyInversion(notes, inversion)
    }

    const inversionSuffix = this.getInversionName(inversion)

    return {
      name: `${root}${chordType === "major" ? "" : chordType}${inversionSuffix}`,
      notes,
      rootMidi,
      inversion,
    }
  }

  generateProgressionFromRoman(romanProgression: string[], key: string, difficulty?: string): ChordProgression {
    const keyIndex = KEYS.indexOf(key)
    if (keyIndex === -1) {
      throw new Error(`Unknown key: ${key}`)
    }
    const scale = [0, 2, 4, 5, 7, 9, 11] // Major scale intervals

    const difficultyLevel = difficulty ? DIFFICULTY_LEVELS[difficulty] : null

    const chords = romanProgression.map((roman) => {
      const degree = this.romanToDegree(roman)
      const chordType = this.romanToChordType(roman)
      const rootInterval = scale[degree]
      const rootNote = KEYS[(keyIndex + rootInterval) % 12]

      let inversion = 0
      if (difficultyLevel?.useInversions && Math.random() < difficultyLevel.inversionProbability) {
        inversion = Math.floor(Math.random() * (difficultyLevel.maxInversion + 1))
      }

      const chord = this.generateChord(rootNote, chordType, 4, inversion)
      chord.romanNumeral = roman
      return chord
    })

    return {
      chords,
      key,
      tempo: 120,
    }
  }

  generateRandomProgression(difficulty: string, key?: string): ChordProgression {
    const level = DIFFICULTY_LEVELS[difficulty]
    if (!level) {
      throw new Error(`Unknown difficulty: ${difficulty}`)
    }

    let selectedKey: string
    if (key) {
      selectedKey = key
    } else if (level.allowedKeys) {
      // Use one of the allowed keys for this difficulty
      selectedKey = level.allowedKeys[Math.floor(Math.random() * level.allowedKeys.length)]
    } else {
      // Use any key
      selectedKey = KEYS[Math.floor(Math.random() * KEYS.length)]
    }
    
    const progressionTemplate = level.commonProgressions[Math.floor(Math.random() * level.commonProgressions.length)]

    return this.generateProgressionFromRoman(progressionTemplate, selectedKey, difficulty)
  }
}
