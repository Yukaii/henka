import { CHORD_TYPES, KEYS } from "@/lib/chord-generator"
import type { Chord } from "@/lib/audio-engine"
import { ChordGenerator } from "@/lib/chord-generator"

export type PlaygroundMode = "absolute" | "transpose"

export type PlaygroundChordType = keyof typeof CHORD_TYPES

export interface PlaygroundChordSelection {
  root: string
  chordType: PlaygroundChordType
}

export interface PlaygroundSlot {
  id: string
  selection: PlaygroundChordSelection | null
}

export interface PlaygroundVariation {
  id: string
  chordType: PlaygroundChordType
  label: string
  description?: string
}

export interface PlaygroundSlotSnapshot {
  selection: PlaygroundChordSelection | null
}

export interface PlaygroundSaveSlot {
  id: string
  name: string
  slots: PlaygroundSlotSnapshot[]
  updatedAt: number
}

export interface PlaygroundStateSnapshot {
  mode: PlaygroundMode
  key: string
  slots: PlaygroundSlotSnapshot[]
  tempo?: number
  voiceLeading?: boolean
}

export const PLAYGROUND_STATE_STORAGE_KEY = "henka::playground::state"
export const PLAYGROUND_SAVES_STORAGE_KEY = "henka::playground::saves"

export const DEFAULT_PLAYGROUND_KEY = "C"
export const DEFAULT_PLAYGROUND_MODE: PlaygroundMode = "absolute"
export const DEFAULT_PLAYGROUND_TEMPO = 120

export const CIRCLE_OF_FIFTHS: string[] = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "C#",
  "G#",
  "D#",
  "A#",
  "F",
]

export const DEFAULT_CHORD_TYPE: PlaygroundChordType = "major"

export const PLAYGROUND_VARIATIONS: PlaygroundVariation[] = [
  { id: "major", chordType: "major", label: "Maj" },
  { id: "minor", chordType: "minor", label: "Min" },
  { id: "dominant7", chordType: "dominant7", label: "7" },
  { id: "major7", chordType: "major7", label: "Maj7" },
  { id: "minor7", chordType: "minor7", label: "m7" },
  { id: "diminished", chordType: "diminished", label: "Dim" },
  { id: "halfDiminished7", chordType: "halfDiminished7", label: "ø7" },
  { id: "augmented", chordType: "augmented", label: "Aug" },
]

const ABSOLUTE_SUFFIX_MAP: Record<PlaygroundChordType, string> = {
  major: "",
  minor: "m",
  diminished: "dim",
  augmented: "aug",
  major7: "maj7",
  minor7: "m7",
  dominant7: "7",
  diminished7: "dim7",
  halfDiminished7: "ø7",
  major9: "maj9",
  minor9: "m9",
  dominant9: "9",
  major11: "maj11",
  minor11: "m11",
}

const SEMITONE_TO_ROMAN_BASE: Record<number, string> = {
  0: "I",
  1: "bII",
  2: "II",
  3: "bIII",
  4: "III",
  5: "IV",
  6: "#IV",
  7: "V",
  8: "bVI",
  9: "VI",
  10: "bVII",
  11: "VII",
}

function createSlotId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `slot_${Math.random().toString(36).slice(2, 10)}`
}

export function createEmptySlot(): PlaygroundSlot {
  return {
    id: createSlotId(),
    selection: null,
  }
}

export function createSlotsFromSnapshot(snapshot: PlaygroundSlotSnapshot[]): PlaygroundSlot[] {
  return snapshot.map((entry) => ({
    id: createSlotId(),
    selection: entry.selection ? { ...entry.selection } : null,
  }))
}

export function serializeSlots(slots: PlaygroundSlot[]): PlaygroundSlotSnapshot[] {
  return slots.map((slot) => ({
    selection: slot.selection ? { ...slot.selection } : null,
  }))
}

export function normalizeKeySignature(key: string): string {
  return KEYS.includes(key) ? key : DEFAULT_PLAYGROUND_KEY
}

export function formatAbsoluteLabel(selection: PlaygroundChordSelection): string {
  const suffix = ABSOLUTE_SUFFIX_MAP[selection.chordType] ?? ""
  return `${selection.root}${suffix}`
}

function extractRomanCore(baseRoman: string): {
  leading: string
  trailing: string
  letters: string
  remainder: string
} {
  const leadingMatch = baseRoman.match(/^[b#]+/)
  const trailingMatch = baseRoman.match(/[b#]+$/)
  const leading = leadingMatch?.[0] ?? ""
  const trailing = trailingMatch?.[0] ?? ""
  const start = leading.length
  const end = baseRoman.length - trailing.length
  const middle = baseRoman.slice(start, end)
  const letterMatch = middle.match(/[ivxIVX]+/)
  const letters = letterMatch?.[0] ?? middle
  const remainder = middle.slice(letters.length)
  return { leading, trailing, letters, remainder }
}

function formatRomanForChordType(base: string, chordType: PlaygroundChordType): string {
  const { leading, trailing, letters, remainder } = extractRomanCore(base)

  let targetCase: "upper" | "lower" = letters === letters.toUpperCase() ? "upper" : "lower"
  let qualitySuffix = remainder

  switch (chordType) {
    case "major":
      targetCase = "upper"
      qualitySuffix = ""
      break
    case "minor":
      targetCase = "lower"
      qualitySuffix = ""
      break
    case "diminished":
      targetCase = "lower"
      qualitySuffix = "°"
      break
    case "augmented":
      targetCase = "upper"
      qualitySuffix = "+"
      break
    case "major7":
      targetCase = "upper"
      qualitySuffix = "maj7"
      break
    case "minor7":
      targetCase = "lower"
      qualitySuffix = "7"
      break
    case "dominant7":
      targetCase = "upper"
      qualitySuffix = "7"
      break
    case "diminished7":
      targetCase = "lower"
      qualitySuffix = "°7"
      break
    case "halfDiminished7":
      targetCase = "lower"
      qualitySuffix = "ø7"
      break
    case "major9":
      targetCase = "upper"
      qualitySuffix = "maj9"
      break
    case "minor9":
      targetCase = "lower"
      qualitySuffix = "9"
      break
    case "dominant9":
      targetCase = "upper"
      qualitySuffix = "9"
      break
    case "major11":
      targetCase = "upper"
      qualitySuffix = "maj11"
      break
    case "minor11":
      targetCase = "lower"
      qualitySuffix = "m11"
      break
    default:
      break
  }

  const romanCore = targetCase === "upper" ? letters.toUpperCase() : letters.toLowerCase()
  const accidentals = `${leading}${trailing}`

  if (!leading && trailing) {
    return `${romanCore}${trailing}${qualitySuffix}`
  }

  return `${accidentals}${romanCore}${qualitySuffix}`
}

export function formatRomanLabel(selection: PlaygroundChordSelection, key: string): string {
  const keyIndex = KEYS.indexOf(key)
  const rootIndex = KEYS.indexOf(selection.root)
  if (keyIndex === -1 || rootIndex === -1) {
    return formatAbsoluteLabel(selection)
  }
  const interval = (rootIndex - keyIndex + 12) % 12
  const baseRoman = SEMITONE_TO_ROMAN_BASE[interval]
  if (!baseRoman) {
    return formatAbsoluteLabel(selection)
  }
  return formatRomanForChordType(baseRoman, selection.chordType)
}

interface PlaygroundChordOptions {
  previous?: Chord | null
  voiceLeading?: boolean
  octave?: number
}

export function createChord(
  generator: ChordGenerator,
  selection: PlaygroundChordSelection,
  options: PlaygroundChordOptions = {},
): Chord {
  const { previous = null, voiceLeading = false, octave = 4 } = options

  if (voiceLeading && typeof (generator as ChordGenerator & {
    generateChordWithVoiceLeading?: (
      root: string,
      chordType: string,
      previousChord: Chord | null,
      config?: { preferredOctave?: number }
    ) => Chord
  }).generateChordWithVoiceLeading === "function") {
    const extendedGenerator = generator as ChordGenerator & {
      generateChordWithVoiceLeading: (
        root: string,
        chordType: string,
        previousChord: Chord | null,
        config?: { preferredOctave?: number }
      ) => Chord
    }

    return extendedGenerator.generateChordWithVoiceLeading(selection.root, selection.chordType, previous, {
      preferredOctave: octave,
    })
  }

  return generator.generateChord(selection.root, selection.chordType, octave)
}

export function loadPlaygroundState(): PlaygroundStateSnapshot | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(PLAYGROUND_STATE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PlaygroundStateSnapshot
    if (!parsed || !Array.isArray(parsed.slots)) return null
    return parsed
  } catch {
    return null
  }
}

export function savePlaygroundState(state: PlaygroundStateSnapshot): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(PLAYGROUND_STATE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}

export function loadSavedSets(): PlaygroundSaveSlot[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(PLAYGROUND_SAVES_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PlaygroundSaveSlot[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveSavedSets(slots: PlaygroundSaveSlot[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(PLAYGROUND_SAVES_STORAGE_KEY, JSON.stringify(slots))
  } catch {
    // Ignore storage issues
  }
}

export function clampSlots(slots: PlaygroundSlot[], minimum = 1): PlaygroundSlot[] {
  if (slots.length >= minimum) return slots
  const next = [...slots]
  while (next.length < minimum) {
    next.push(createEmptySlot())
  }
  return next
}
