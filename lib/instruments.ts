export type InstrumentConfig = {
  id: InstrumentId
  label: string
  description: string
  voice: {
    oscillator: OscillatorType
    gain: number
    detune?: number
  }
  bass: {
    oscillator: OscillatorType
    gain: number
    detune?: number
  }
  envelope: {
    attack: number
    release: number
  }
}

const instrumentConfigs = {
  warm_triangle: {
    label: "Warm Keys",
    description: "Rounded triangle wave with a balanced tone.",
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
} satisfies Record<string, Omit<InstrumentConfig, "id">>

export type InstrumentId = keyof typeof instrumentConfigs

export const DEFAULT_INSTRUMENT_ID: InstrumentId = "warm_triangle"

const instrumentEntries = Object.entries(instrumentConfigs) as Array<[
  InstrumentId,
  Omit<InstrumentConfig, "id">
]>

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
