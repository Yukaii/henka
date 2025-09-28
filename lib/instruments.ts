export type AudioSampleExtension = "mp3" | "ogg"

export type SampleDefinition = {
  midi: number
  file: string
}

export type SamplePlaybackConfig = {
  basePath?: string
  extensions?: AudioSampleExtension[]
  files: SampleDefinition[]
}

type VoiceConfig = {
  oscillator: OscillatorType
  gain: number
  detune?: number
}

type EnvelopeConfig = {
  attack: number
  release: number
}

type InstrumentConfigWithoutId = {
  label: string
  description: string
  voice: VoiceConfig
  bass: VoiceConfig
  envelope: EnvelopeConfig
  playback: "synth" | "sample"
  sample?: SamplePlaybackConfig
}

const instrumentConfigs = {
  warm_triangle: {
    label: "Warm Keys",
    description: "Rounded triangle wave with a balanced tone.",
    playback: "synth",
    voice: {
      oscillator: "triangle",
      gain: 1,
    },
    bass: {
      oscillator: "sine",
      gain: 1.2,
    },
    envelope: {
      attack: 0.02,
      release: 0.12,
    },
  },
  pure_sine: {
    label: "Pure Sine",
    description: "Smooth sine pad for gentle practice.",
    playback: "synth",
    voice: {
      oscillator: "sine",
      gain: 1.1,
    },
    bass: {
      oscillator: "sine",
      gain: 1.3,
    },
    envelope: {
      attack: 0.03,
      release: 0.16,
    },
  },
  bright_saw: {
    label: "Bright Saw",
    description: "Edgy sawtooth synth for clearer articulations.",
    playback: "synth",
    voice: {
      oscillator: "sawtooth",
      gain: 0.9,
    },
    bass: {
      oscillator: "sawtooth",
      gain: 1,
    },
    envelope: {
      attack: 0.015,
      release: 0.18,
    },
  },
  retro_square: {
    label: "Retro Square",
    description: "Chiptune-inspired square wave with a quick release.",
    playback: "synth",
    voice: {
      oscillator: "square",
      gain: 0.95,
    },
    bass: {
      oscillator: "square",
      gain: 1.05,
    },
    envelope: {
      attack: 0.01,
      release: 0.1,
    },
  },
  felt_piano: {
    label: "Soft Piano",
    description: "Plucky triangle tone with a lingering piano-like decay.",
    playback: "synth",
    voice: {
      oscillator: "triangle",
      gain: 1.1,
      detune: -4,
    },
    bass: {
      oscillator: "sine",
      gain: 1.35,
      detune: 4,
    },
    envelope: {
      attack: 0.008,
      release: 0.28,
    },
  },
  sampled_grand: {
    label: "Sampled Grand",
    description: "Layered piano samples with wide dynamic range.",
    playback: "sample",
    voice: {
      oscillator: "triangle",
      gain: 1.05,
    },
    bass: {
      oscillator: "sine",
      gain: 1.2,
    },
    envelope: {
      attack: 0.01,
      release: 0.35,
    },
    sample: {
      basePath: "/audio/piano",
      extensions: ["mp3"],
      files: [
        { midi: 36, file: "Piano.ff.C2" },
        { midi: 48, file: "Piano.ff.C3" },
        { midi: 60, file: "Piano.ff.C4" },
        { midi: 72, file: "Piano.ff.C5" },
        { midi: 84, file: "Piano.ff.C6" },
        { midi: 96, file: "Piano.ff.C7" },
      ],
    },
  },
} satisfies Record<string, InstrumentConfigWithoutId>

export type InstrumentId = keyof typeof instrumentConfigs

const instrumentEntries = Object.entries(instrumentConfigs) as Array<[
  InstrumentId,
  InstrumentConfigWithoutId
]>

export type InstrumentConfig = InstrumentConfigWithoutId & { id: InstrumentId }

export const DEFAULT_INSTRUMENT_ID: InstrumentId = "warm_triangle"

export const INSTRUMENT_OPTIONS: InstrumentConfig[] = instrumentEntries.map(([id, config]) => ({
  id,
  ...config,
}))

export function isInstrumentId(value: unknown): value is InstrumentId {
  if (typeof value !== "string") return false
  return Object.prototype.hasOwnProperty.call(instrumentConfigs, value)
}

export function getInstrumentConfig(id: InstrumentId): InstrumentConfig {
  const config = instrumentConfigs[id]
  return {
    id,
    ...config,
  }
}
