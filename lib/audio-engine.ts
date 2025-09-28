import {
  DEFAULT_INSTRUMENT_ID,
  getInstrumentConfig,
  type InstrumentConfig,
  type InstrumentId,
} from "./instruments"
import { SamplePlayer } from "./sample-player"

// Audio engine for generating and playing chord progressions
export interface Chord {
  name: string
  notes: number[]
  rootMidi: number
  romanNumeral?: string
  inversion?: number
}

export interface ChordProgression {
  chords: Chord[]
  key: string
  tempo: number
}

type OscillatorOptions = {
  type?: OscillatorType
  gain?: number
  detune?: number
  attack?: number
  release?: number
}

type Voice = {
  source: AudioScheduledSourceNode
  gain: GainNode
}

type ExtendedWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

export class AudioEngine {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private activeVoices = new Set<Voice>()
  private playbackTimer: ReturnType<typeof setTimeout> | null = null
  private playbackResolve: (() => void) | null = null
  private iosUnlockAttempted = false
  private instrumentConfig: InstrumentConfig = getInstrumentConfig(DEFAULT_INSTRUMENT_ID)
  private samplePlayer: SamplePlayer | null = null
  private samplePlayerInstrumentId: InstrumentId | null = null
  private samplePlayerContext: AudioContext | null = null

  constructor() {
    // Audio context is created lazily to satisfy mobile autoplay policies.
  }

  private async initializeAudio(): Promise<void> {
    if (typeof window === "undefined") return
    if (this.audioContext && this.masterGain) return

    try {
      const extendedWindow = window as ExtendedWindow
      const AudioContextConstructor = extendedWindow.AudioContext ?? extendedWindow.webkitAudioContext
      if (!AudioContextConstructor) {
        console.error("Web Audio API not supported in this browser")
        return
      }

      this.audioContext = new AudioContextConstructor()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.gain.value = 0.3
      this.masterGain.connect(this.audioContext.destination)
      this.activeVoices.clear()
    } catch (error) {
      console.error("Failed to initialize audio context:", error)
    }
  }

  private async ensureAudioContext(): Promise<AudioContext | null> {
    if (typeof window === "undefined") return null

    await this.initializeAudio()

    if (!this.audioContext || !this.masterGain) {
      return null
    }

    if (this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume()
      } catch (error) {
        console.warn("Audio context resume was blocked, attempting unlock", error)
      }
    }

    if (this.audioContext.state !== "running") {
      await this.unlockIOSAudioContext()
      if (this.audioContext.state === "suspended") {
        try {
          await this.audioContext.resume()
        } catch (error) {
          console.error("Failed to resume audio context:", error)
          return null
        }
      }
    }

    return this.audioContext
  }

  private async prepareForPlayback(): Promise<AudioContext | null> {
    const context = await this.ensureAudioContext()
    if (!context || !this.masterGain) return null

    if (this.instrumentConfig.playback === "sample") {
      const sampleConfig = this.instrumentConfig.sample
      if (!sampleConfig) {
        console.error("Sample instrument missing sample configuration", this.instrumentConfig.id)
        return null
      }

      const contextChanged = this.samplePlayerContext !== context
      const instrumentChanged = this.samplePlayerInstrumentId !== this.instrumentConfig.id

      if (!this.samplePlayer || contextChanged || instrumentChanged) {
        this.samplePlayer?.dispose()
        this.samplePlayer = new SamplePlayer(context, sampleConfig)
        this.samplePlayerInstrumentId = this.instrumentConfig.id
        this.samplePlayerContext = context
      }

      try {
        await this.samplePlayer.load()
      } catch (error) {
        console.error("Failed to load instrument samples:", error)
        this.resetSamplePlayer()
        return null
      }
    }

    return context
  }

  private isIOS(): boolean {
    if (typeof navigator === "undefined") return false
    return /iP(ad|hone|od)/.test(navigator.userAgent)
  }

  private async unlockIOSAudioContext(): Promise<void> {
    if (!this.audioContext || !this.masterGain) return
    if (!this.isIOS()) return
    if (this.iosUnlockAttempted) return

    this.iosUnlockAttempted = true

    try {
      const buffer = this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate)
      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.masterGain)

      await new Promise<void>((resolve) => {
        source.onended = () => {
          source.disconnect()
          resolve()
        }

        try {
          source.start(0)
        } catch {
          resolve()
        }
      })
    } catch (error) {
      console.warn("Failed to unlock iOS audio context", error)
    }
  }

  private midiToFrequency(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12)
  }

  setInstrument(instrumentId: InstrumentId): void {
    const nextConfig = getInstrumentConfig(instrumentId)
    if (nextConfig.id === this.instrumentConfig.id) return

    this.instrumentConfig = nextConfig
    this.resetSamplePlayer()
    this.stop(true)
  }

  private resetSamplePlayer(): void {
    if (this.samplePlayer) {
      this.samplePlayer.dispose()
      this.samplePlayer = null
    }
    this.samplePlayerInstrumentId = null
    this.samplePlayerContext = null
  }

  private createOscillator(
    frequency: number,
    startTime: number,
    duration: number,
    options: OscillatorOptions = {},
  ): void {
    if (!this.audioContext || !this.masterGain) return

    const oscillator = this.audioContext.createOscillator()
    oscillator.type = options.type ?? "triangle"
    oscillator.frequency.setValueAtTime(frequency, startTime)

    if (typeof options.detune === "number") {
      oscillator.detune.setValueAtTime(options.detune, startTime)
    }
    const gainNode = this.audioContext.createGain()
    const releaseEnd = this.applyEnvelope(gainNode, startTime, duration, options)
    this.registerVoice(oscillator, gainNode, startTime, releaseEnd)
  }

  private applyEnvelope(
    gainNode: GainNode,
    startTime: number,
    duration: number,
    options: OscillatorOptions = {},
  ): number {
    const peakLevel = 0.25 * (options.gain ?? 1)
    const attackDuration = options.attack ?? 0.02
    const releaseDuration = options.release ?? 0.12
    const attackEnd = startTime + attackDuration
    const sustainEnd = Math.max(startTime + duration, attackEnd + 0.1)
    const releaseEnd = sustainEnd + releaseDuration

    gainNode.gain.setValueAtTime(0.0001, startTime)
    gainNode.gain.linearRampToValueAtTime(peakLevel, attackEnd)
    gainNode.gain.setValueAtTime(peakLevel, sustainEnd)
    gainNode.gain.linearRampToValueAtTime(0.0001, releaseEnd)

    return releaseEnd
  }

  private registerVoice(
    source: AudioScheduledSourceNode,
    gainNode: GainNode,
    startTime: number,
    releaseEnd: number,
  ): void {
    if (!this.masterGain) return

    source.connect(gainNode)
    gainNode.connect(this.masterGain)

    const voice: Voice = { source, gain: gainNode }
    this.activeVoices.add(voice)

    source.onended = () => {
      try {
        source.disconnect()
      } catch {
        // Node already disconnected.
      }
      try {
        gainNode.disconnect()
      } catch {
        // Node already disconnected.
      }
      this.activeVoices.delete(voice)
    }

    try {
      source.start(startTime)
    } catch {
      // Scheduling can fail if start time is in the past.
    }

    try {
      source.stop(releaseEnd)
    } catch {
      // Stop may throw if already stopped externally.
    }
  }

  private scheduleChord(chord: Chord, startTime: number, duration: number): void {
    if (this.instrumentConfig.playback === "sample") {
      this.scheduleSampleChord(chord, startTime, duration)
      return
    }

    const seenNotes = new Set<number>()

    const { voice, bass, envelope } = this.instrumentConfig

    chord.notes.forEach((midiNote) => {
      if (!Number.isFinite(midiNote)) return
      seenNotes.add(midiNote)
      const frequency = this.midiToFrequency(midiNote)
      this.createOscillator(frequency, startTime, duration, {
        type: voice.oscillator,
        gain: voice.gain,
        detune: voice.detune,
        attack: envelope.attack,
        release: envelope.release,
      })
    })

    if (typeof chord.rootMidi === "number") {
      const bassMidi = chord.rootMidi - 12 >= 24 ? chord.rootMidi - 12 : chord.rootMidi
      if (!seenNotes.has(bassMidi)) {
        this.createOscillator(this.midiToFrequency(bassMidi), startTime, duration, {
          type: bass.oscillator,
          gain: bass.gain,
          detune: bass.detune,
          attack: envelope.attack,
          release: envelope.release,
        })
      }
    }
  }

  private scheduleSampleChord(chord: Chord, startTime: number, duration: number): void {
    if (!this.samplePlayer || !this.audioContext || !this.masterGain) return

    const seenNotes = new Set<number>()
    const { voice, bass, envelope } = this.instrumentConfig

    chord.notes.forEach((rawNote) => {
      if (!Number.isFinite(rawNote)) return
      const midiNote = Math.round(rawNote)
      if (seenNotes.has(midiNote)) return
      seenNotes.add(midiNote)
      this.scheduleSampleNote(midiNote, startTime, duration, {
        gain: voice.gain,
        detune: voice.detune,
        attack: envelope.attack,
        release: envelope.release,
      })
    })

    if (typeof chord.rootMidi === "number") {
      const adjustedBass = chord.rootMidi - 12 >= 24 ? chord.rootMidi - 12 : chord.rootMidi
      if (!seenNotes.has(adjustedBass)) {
        this.scheduleSampleNote(adjustedBass, startTime, duration, {
          gain: bass.gain,
          detune: bass.detune,
          attack: envelope.attack,
          release: envelope.release,
        })
      }
    }
  }

  private scheduleSampleNote(
    midiNote: number,
    startTime: number,
    duration: number,
    options: OscillatorOptions,
  ): void {
    if (!this.audioContext || !this.samplePlayer || !this.masterGain) return
    const source = this.samplePlayer.createSource(midiNote, startTime, options.detune ?? 0)
    if (!source) return

    const gainNode = this.audioContext.createGain()
    const releaseEnd = this.applyEnvelope(gainNode, startTime, duration, options)
    this.registerVoice(source, gainNode, startTime, releaseEnd)
  }

  private stopVoices(immediate: boolean): void {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const release = immediate ? 0.02 : 0.12

    for (const voice of Array.from(this.activeVoices)) {
      try {
        voice.gain.gain.cancelScheduledValues(now)
        voice.gain.gain.setTargetAtTime(0.0001, now, release)
        voice.source.stop(now + release * 2)
      } catch {
        // Source might already be stopped; ignore.
      }

      try {
        voice.source.disconnect()
      } catch {
        // Already disconnected
      }
      try {
        voice.gain.disconnect()
      } catch {
        // Already disconnected
      }
      this.activeVoices.delete(voice)
    }
  }

  private finishPlayback(): void {
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer)
      this.playbackTimer = null
    }

    if (this.playbackResolve) {
      const resolve = this.playbackResolve
      this.playbackResolve = null
      resolve()
    }
  }

  private startPlaybackTimer(seconds: number): Promise<void> {
    this.finishPlayback()

    return new Promise((resolve) => {
      this.playbackResolve = () => {
        this.playbackResolve = null
        resolve()
      }

      this.playbackTimer = setTimeout(() => {
        if (this.playbackResolve) {
          const resolvePlayback = this.playbackResolve
          this.playbackResolve = null
          resolvePlayback()
        }
        this.playbackTimer = null
      }, Math.max(seconds, 0) * 1000)
    })
  }

  async playChord(chord: Chord, duration = 2): Promise<void> {
    const context = await this.prepareForPlayback()
    if (!context || !this.masterGain) return

    this.stopVoices(true)

    const startTime = context.currentTime + 0.05
    this.scheduleChord(chord, startTime, duration)

    return this.startPlaybackTimer(duration + 0.25)
  }

  async playProgression(progression: ChordProgression): Promise<void> {
    if (!progression.chords.length) return

    const context = await this.prepareForPlayback()
    if (!context || !this.masterGain) return

    this.stopVoices(true)

    const chordDuration = (60 / progression.tempo) * 2
    let currentTime = context.currentTime + 0.05

    for (const chord of progression.chords) {
      this.scheduleChord(chord, currentTime, chordDuration)
      currentTime += chordDuration
    }

    const totalDuration = currentTime - context.currentTime
    return this.startPlaybackTimer(totalDuration + 0.2)
  }

  stop(immediate = false): void {
    if (this.audioContext) {
      this.stopVoices(immediate)
    }
    this.finishPlayback()
  }

  dispose(): void {
    this.stop(true)
    this.resetSamplePlayer()

    if (this.audioContext) {
      this.audioContext.close().catch(() => {})
      this.audioContext = null
      this.masterGain = null
    }

    this.iosUnlockAttempted = false
  }
}
