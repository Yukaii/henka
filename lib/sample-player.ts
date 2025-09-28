import type { SamplePlaybackConfig, SampleDefinition, AudioSampleExtension } from "./instruments"

const DEFAULT_EXTENSIONS: AudioSampleExtension[] = ["mp3", "ogg"]
const EXTENSION_MIME: Record<AudioSampleExtension, string> = {
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
}

type LoadedSample = SampleDefinition & {
  buffer: AudioBuffer
}

function normaliseSegment(segment: string): string {
  return segment.replace(/^\/+/u, "").replace(/\/+$/u, "")
}

function buildSamplePath(config: SamplePlaybackConfig, file: string, extension: AudioSampleExtension): string {
  const segments: string[] = []

  const prefix = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  if (prefix) {
    const normalisedPrefix = normaliseSegment(prefix)
    if (normalisedPrefix) {
      segments.push(normalisedPrefix)
    }
  }

  const basePath = config.basePath ?? "/audio"
  const normalisedBase = normaliseSegment(basePath)
  if (normalisedBase) {
    segments.push(normalisedBase)
  }

  segments.push(`${file}.${extension}`)

  return `/${segments.join("/")}`
}

function detectSupportedExtension(config: SamplePlaybackConfig): AudioSampleExtension | null {
  const candidates = config.extensions?.length ? config.extensions : DEFAULT_EXTENSIONS

  if (typeof document === "undefined") {
    return candidates[0] ?? null
  }

  const audioElement = document.createElement("audio")

  for (const extension of candidates) {
    const mime = EXTENSION_MIME[extension]
    const capability = audioElement.canPlayType(mime)
    if (capability === "probably" || capability === "maybe") {
      return extension
    }
  }

  return candidates[0] ?? null
}

async function decodeAudioData(context: AudioContext, buffer: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const promise = context.decodeAudioData(buffer, resolve, reject)
    if (promise && typeof promise.then === "function") {
      promise.then(resolve).catch(reject)
    }
  })
}

export class SamplePlayer {
  private readonly context: AudioContext
  private readonly config: SamplePlaybackConfig
  private loadingPromise: Promise<void> | null = null
  private samples: LoadedSample[] = []
  private extension: AudioSampleExtension | null = null

  constructor(context: AudioContext, config: SamplePlaybackConfig) {
    this.context = context
    this.config = config
  }

  async load(): Promise<void> {
    if (this.samples.length) return
    if (this.loadingPromise) return this.loadingPromise

    this.loadingPromise = this.loadInternal()

    try {
      await this.loadingPromise
    } finally {
      this.loadingPromise = null
    }
  }

  private async loadInternal(): Promise<void> {
    const extension = detectSupportedExtension(this.config)
    if (!extension) {
      throw new Error("No supported audio format for sample playback")
    }

    this.extension = extension

    const loaded = await Promise.all(
      this.config.files.map(async (sample) => {
        const url = buildSamplePath(this.config, sample.file, extension)
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch sample: ${url}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        const buffer = await decodeAudioData(this.context, arrayBuffer)
        return { ...sample, buffer }
      }),
    )

    this.samples = loaded.sort((a, b) => a.midi - b.midi)
  }

  isReady(): boolean {
    return this.samples.length > 0
  }

  createSource(targetMidi: number, startTime: number, detuneCents = 0): AudioBufferSourceNode | null {
    if (!this.samples.length) return null

    const sample = this.getClosestSample(targetMidi)
    if (!sample) return null

    const source = this.context.createBufferSource()
    source.buffer = sample.buffer

    const totalDetune = (targetMidi - sample.midi) * 100 + detuneCents

    if (typeof source.detune !== "undefined") {
      try {
        source.detune.setValueAtTime(totalDetune, startTime)
      } catch {
        source.detune.value = totalDetune
      }
    } else {
      source.playbackRate.setValueAtTime(Math.pow(2, totalDetune / 1200), startTime)
    }

    return source
  }

  private getClosestSample(targetMidi: number): LoadedSample | null {
    if (!this.samples.length) return null

    let closest = this.samples[0]
    let smallestDistance = Math.abs(targetMidi - closest.midi)

    for (const sample of this.samples) {
      const distance = Math.abs(targetMidi - sample.midi)
      if (distance < smallestDistance) {
        smallestDistance = distance
        closest = sample
      }
    }

    return closest
  }

  dispose(): void {
    this.samples = []
    this.loadingPromise = null
    this.extension = null
  }
}
