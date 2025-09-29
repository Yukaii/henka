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
  description: string
  chordTypes: string[]
  progressionLength: number
  commonProgressions: string[][]
  useInversions: boolean
  inversionProbability: number // 0-1, probability of using an inversion
  maxInversion: number // Maximum inversion to use (0=root, 1=first, 2=second, etc.)
  allowedKeys?: string[] // Optional: limit to specific keys for easier modes
  useVoiceLeading?: boolean
  randomizeChordTypes?: boolean
}

export interface ProgressionGenerationOptions {
  voiceLeading?: boolean
}

export interface CustomDifficultySettings {
  chordTypes: string[]
  progressionLength: number
  useInversions: boolean
  inversionProbability: number
  maxInversion: number
  allowedKeys?: string[]
  useVoiceLeading: boolean
}

const CUSTOM_TEMPLATE_BASE = ["I", "vi", "IV", "V", "ii", "iii", "vii°"]

const ALL_CHORD_TYPES = [
  "major",
  "minor",
  "diminished",
  "augmented",
  "major7",
  "minor7",
  "dominant7",
  "diminished7",
  "halfDiminished7",
  "major9",
  "minor9",
  "dominant9",
  "major11",
  "minor11",
]

export const DEFAULT_CUSTOM_DIFFICULTY_SETTINGS: CustomDifficultySettings = {
  chordTypes: ALL_CHORD_TYPES,
  progressionLength: 6,
  useInversions: true,
  inversionProbability: 0.5,
  maxInversion: 3,
  allowedKeys: undefined,
  useVoiceLeading: true,
}

function sanitizeCustomDifficultySettings(settings: CustomDifficultySettings): CustomDifficultySettings {
  const validChordTypes = settings.chordTypes
    .filter((type) => Object.prototype.hasOwnProperty.call(CHORD_TYPES, type))
  const chordTypes = validChordTypes.length > 0 ? Array.from(new Set(validChordTypes)) : ["major", "minor"]

  const rawLength = Number.isFinite(settings.progressionLength) ? Math.round(settings.progressionLength) : 4
  const progressionLength = Math.min(Math.max(rawLength, 3), 8)

  const rawMaxInversion = Number.isFinite(settings.maxInversion) ? Math.floor(settings.maxInversion) : 0
  const clampedMaxInversion = Math.min(Math.max(rawMaxInversion, 0), 5)

  const useInversions = settings.useInversions && clampedMaxInversion > 0
  const inversionProbability = useInversions
    ? Math.min(Math.max(settings.inversionProbability ?? 0, 0), 1)
    : 0
  const maxInversion = useInversions ? clampedMaxInversion : 0

  const allowedKeys = settings.allowedKeys?.filter((key) => KEYS.includes(key))
  const useVoiceLeading = settings.useVoiceLeading !== false

  return {
    chordTypes,
    progressionLength,
    useInversions,
    inversionProbability,
    maxInversion,
    allowedKeys: allowedKeys && allowedKeys.length > 0 ? allowedKeys : undefined,
    useVoiceLeading,
  }
}

function buildCustomTemplate(length: number): string[] {
  return Array.from({ length }, (_, index) => CUSTOM_TEMPLATE_BASE[index % CUSTOM_TEMPLATE_BASE.length])
}

function createCustomDifficultyLevel(settings: CustomDifficultySettings): DifficultyLevel {
  const template = buildCustomTemplate(settings.progressionLength)

  return {
    name: "Custom",
    description: "Tailor your own mix of chord families and inversion limits.",
    chordTypes: settings.chordTypes,
    progressionLength: settings.progressionLength,
    commonProgressions: [template],
    useInversions: settings.useInversions,
    inversionProbability: settings.inversionProbability,
    maxInversion: settings.maxInversion,
    allowedKeys: settings.allowedKeys,
    useVoiceLeading: settings.useVoiceLeading,
    randomizeChordTypes: true,
  }
}

let customDifficultySettings = sanitizeCustomDifficultySettings(DEFAULT_CUSTOM_DIFFICULTY_SETTINGS)
let customDifficultyLevel = createCustomDifficultyLevel(customDifficultySettings)

export function getCustomDifficultySettings(): CustomDifficultySettings {
  return { ...customDifficultySettings }
}

export function getCustomDifficultyLevel(): DifficultyLevel {
  return customDifficultyLevel
}

export function updateCustomDifficultySettings(settings: CustomDifficultySettings): CustomDifficultySettings {
  customDifficultySettings = sanitizeCustomDifficultySettings(settings)
  customDifficultyLevel = createCustomDifficultyLevel(customDifficultySettings)
  DIFFICULTY_LEVELS.custom = customDifficultyLevel
  return { ...customDifficultySettings }
}

export const DIFFICULTY_LEVELS: Record<string, DifficultyLevel> = {
  easy: {
    name: "Easy",
    description: "Foundational major/minor triads in the friendliest keys with no inversions.",
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
    description: "Adds basic inversions and ii–V–I motion while staying in comfortable keys.",
    chordTypes: ["major", "minor"],
    progressionLength: 4,
    commonProgressions: [
      ["I", "V", "vi", "IV"],
      ["vi", "IV", "I", "V"],
      ["I", "vi", "IV", "V"],
      ["ii", "V", "I", "vi"],
    ],
    useInversions: true,
    inversionProbability: 0,
    maxInversion: 2,
    useVoiceLeading: true,
  },
  intermediate: {
    name: "Intermediate",
    description: "Introduces seventh chords and light voice-leading with occasional inversions.",
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
    useVoiceLeading: true,
  },
  advanced: {
    name: "Advanced",
    description:
      "Extended harmony across six-chord phrases with frequent inversions and richer tensions.",
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
    useVoiceLeading: true,
  },
  custom: customDifficultyLevel,
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
    const baseRoman = roman.split("/")[0]
    if (baseRoman.includes("maj11")) return "major11"
    if (baseRoman.includes("11")) return baseRoman.includes("m") ? "minor11" : "major11"
    if (baseRoman.includes("maj9")) return "major9"
    if (baseRoman.includes("maj7")) return "major7"
    if (baseRoman.includes("+")) return "augmented"
    if (baseRoman.includes("9")) return baseRoman.includes("m") ? "minor9" : "dominant9"
    if (baseRoman.includes("7")) {
      if (baseRoman.includes("°")) return "diminished7"
      if (baseRoman.includes("ø")) return "halfDiminished7"
      return baseRoman === baseRoman.toUpperCase() ? "dominant7" : "minor7"
    }
    if (baseRoman.includes("°")) return "diminished"
    return baseRoman === baseRoman.toUpperCase() ? "major" : "minor"
  }

  private romanToDegree(roman: string): number {
    const cleanRoman = roman
      .replace(/maj/gi, "")
      .replace(/m(?=\d)/g, "")
      .replace(/[°ø+]/g, "")
      .replace(/\d/g, "")
      .split("/")[0]
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

  private extractInversion(roman: string): number | null {
    const parts = roman.split("/")
    if (parts.length < 2) return null

    const match = parts[1].match(/(\d+)/)
    if (!match) return null

    const inversion = Number.parseInt(match[1], 10)
    return Number.isNaN(inversion) ? null : inversion
  }

  private adjustNotesForVoiceLeading(previousNotes: number[], candidateNotes: number[]): number[] {
    if (!previousNotes.length) return [...candidateNotes]

    const previousSorted = [...previousNotes].sort((a, b) => a - b)
    const candidateSorted = [...candidateNotes].sort((a, b) => a - b)

    const tightened = candidateSorted.map((note, index) => {
      const targetIndex = Math.min(index, previousSorted.length - 1)
      const target = previousSorted[targetIndex]
      let adjusted = note

      while (adjusted - target > 6) {
        adjusted -= 12
      }

      while (target - adjusted > 6) {
        adjusted += 12
      }

      return adjusted
    })

    return tightened.sort((a, b) => a - b)
  }

  private calculateVoiceLeadingDistance(previousNotes: number[], candidateNotes: number[]): number {
    const previousSorted = [...previousNotes].sort((a, b) => a - b)
    const candidateSorted = [...candidateNotes].sort((a, b) => a - b)
    const pairs = Math.min(previousSorted.length, candidateSorted.length)

    let distance = 0

    for (let index = 0; index < pairs; index++) {
      distance += Math.abs(previousSorted[index] - candidateSorted[index])
    }

    if (candidateSorted.length > pairs) {
      const anchor = previousSorted[previousSorted.length - 1] ?? candidateSorted[pairs - 1]
      for (let index = pairs; index < candidateSorted.length; index++) {
        distance += Math.abs(candidateSorted[index] - anchor)
      }
    } else if (previousSorted.length > pairs) {
      const anchor = candidateSorted[candidateSorted.length - 1] ?? previousSorted[pairs - 1]
      for (let index = pairs; index < previousSorted.length; index++) {
        distance += Math.abs(previousSorted[index] - anchor)
      }
    }

    return distance
  }

  private findBestVoiceLeadingConfiguration(
    previousChord: Chord | null,
    rootNote: string,
    chordType: string,
    maxInversion: number,
    fixedInversion?: number,
  ): { inversion: number; octave: number } {
    const intervals = CHORD_TYPES[chordType as keyof typeof CHORD_TYPES]
    if (!intervals) {
      const inversion = fixedInversion ?? 0
      return { inversion, octave: 4 }
    }

    const maxAvailableInversion = intervals.length - 1
    const cappedFixedInversion = fixedInversion !== undefined ? Math.min(fixedInversion, maxAvailableInversion) : undefined
    const allowedMaxInversion = Math.min(maxInversion, maxAvailableInversion)

    const inversionCandidates = cappedFixedInversion !== undefined
      ? [cappedFixedInversion]
      : Array.from({ length: allowedMaxInversion + 1 }, (_, index) => index)

    if (!previousChord) {
      const defaultInversion = inversionCandidates[0] ?? 0
      return { inversion: defaultInversion, octave: 4 }
    }

    const previousNotes = previousChord.notes
    const octaveOffsets = [-1, 0, 1]
    let bestInversion = inversionCandidates[0] ?? 0
    let bestOctave = 4
    let bestDistance = Number.POSITIVE_INFINITY

    for (const inversion of inversionCandidates) {
      for (const offset of octaveOffsets) {
        const octave = Math.max(1, 4 + offset)
        const candidate = this.generateChord(rootNote, chordType, octave, inversion)
        const adjustedNotes = this.adjustNotesForVoiceLeading(previousNotes, candidate.notes)
        const distance = this.calculateVoiceLeadingDistance(previousNotes, adjustedNotes)

        if (distance < bestDistance) {
          bestDistance = distance
          bestInversion = inversion
          bestOctave = octave
        }
      }
    }

    return { inversion: bestInversion, octave: bestOctave }
  }

  private formatRomanForChordType(baseRoman: string, chordType: string): string {
    const core = baseRoman.replace(/[°ø]/g, "")

    switch (chordType) {
      case "major":
        return core.toUpperCase()
      case "minor":
        return core.toLowerCase()
      case "diminished":
        return `${core.toLowerCase()}°`
      case "augmented":
        return `${core.toUpperCase()}+`
      case "major7":
        return `${core.toUpperCase()}maj7`
      case "minor7":
        return `${core.toLowerCase()}7`
      case "dominant7":
        return `${core.toUpperCase()}7`
      case "diminished7":
        return `${core.toLowerCase()}°7`
      case "halfDiminished7":
        return `${core.toLowerCase()}ø7`
      case "major9":
        return `${core.toUpperCase()}maj9`
      case "minor9":
        return `${core.toLowerCase()}m9`
      case "dominant9":
        return `${core.toUpperCase()}9`
      case "major11":
        return `${core.toUpperCase()}maj11`
      case "minor11":
        return `${core.toLowerCase()}m11`
      default:
        return core
    }
  }

  private generateCustomProgressionTemplate(level: DifficultyLevel): string[] {
    const bases = CUSTOM_TEMPLATE_BASE
    const chords: string[] = []

    for (let index = 0; index < level.progressionLength; index++) {
      const base = bases[Math.floor(Math.random() * bases.length)]
      const chordTypeIndex = Math.floor(Math.random() * level.chordTypes.length)
      const chordType = level.chordTypes[chordTypeIndex]

      chords.push(this.formatRomanForChordType(base, chordType))
    }

    return chords
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

  generateProgressionFromRoman(
    romanProgression: string[],
    key: string,
    difficulty?: string,
    options?: ProgressionGenerationOptions,
  ): ChordProgression {
    const keyIndex = KEYS.indexOf(key)
    if (keyIndex === -1) {
      throw new Error(`Unknown key: ${key}`)
    }
    const scale = [0, 2, 4, 5, 7, 9, 11] // Major scale intervals

    const difficultyLevel = difficulty ? DIFFICULTY_LEVELS[difficulty] : null
    const applyVoiceLeading = options?.voiceLeading ?? difficultyLevel?.useVoiceLeading ?? false

    let previousChord: Chord | null = null

    const chords = romanProgression.map((roman) => {
      const degree = this.romanToDegree(roman)
      const chordType = this.romanToChordType(roman)
      const rootInterval = scale[degree]
      const rootNote = KEYS[(keyIndex + rootInterval) % 12]

      const intervals = CHORD_TYPES[chordType as keyof typeof CHORD_TYPES]
      if (!intervals) {
        throw new Error(`Unsupported chord type for roman numeral: ${roman}`)
      }

      const maxInversionsForChord = intervals.length - 1
      const difficultyMaxInversion = difficultyLevel
        ? Math.min(difficultyLevel.maxInversion, maxInversionsForChord)
        : maxInversionsForChord
      const explicitInversion = this.extractInversion(roman)
      const clampedExplicitInversion = explicitInversion !== null ? Math.min(explicitInversion, maxInversionsForChord) : null

      let inversion = clampedExplicitInversion ?? 0
      let octave = 4

      if (applyVoiceLeading) {
        const { inversion: selectedInversion, octave: selectedOctave } = this.findBestVoiceLeadingConfiguration(
          previousChord,
          rootNote,
          chordType,
          clampedExplicitInversion !== null ? clampedExplicitInversion : difficultyMaxInversion,
          clampedExplicitInversion ?? undefined,
        )

        inversion = selectedInversion
        octave = selectedOctave
      } else if (
        clampedExplicitInversion === null &&
        difficultyLevel?.useInversions &&
        Math.random() < (difficultyLevel?.inversionProbability ?? 0)
      ) {
        inversion = Math.floor(Math.random() * (difficultyMaxInversion + 1))
      }

      const chord = this.generateChord(rootNote, chordType, octave, inversion)
      chord.romanNumeral = roman

      if (applyVoiceLeading && previousChord) {
        chord.notes = this.adjustNotesForVoiceLeading(previousChord.notes, chord.notes)
      }

      previousChord = chord
      return chord
    })

    return {
      chords,
      key,
      tempo: 120,
    }
  }

  generateRandomProgression(
    difficulty: string,
    key?: string,
    options?: ProgressionGenerationOptions,
  ): ChordProgression {
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
    const template = level.randomizeChordTypes
      ? this.generateCustomProgressionTemplate(level)
      : level.commonProgressions[Math.floor(Math.random() * level.commonProgressions.length)]

    return this.generateProgressionFromRoman(template, selectedKey, difficulty, options)
  }
}
