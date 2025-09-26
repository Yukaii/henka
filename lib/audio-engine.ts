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

type Voice = {
  oscillator: OscillatorNode
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

  private createOscillator(
    frequency: number,
    startTime: number,
    duration: number,
    options: { type?: OscillatorType; gain?: number } = {},
  ): void {
    if (!this.audioContext || !this.masterGain) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const voice: Voice = { oscillator, gain: gainNode }

    oscillator.type = options.type ?? "triangle"
    oscillator.frequency.setValueAtTime(frequency, startTime)

    const peakLevel = 0.25 * (options.gain ?? 1)
    const attackEnd = startTime + 0.02
    const sustainEnd = Math.max(startTime + duration, attackEnd + 0.1)
    const releaseEnd = sustainEnd + 0.12

    gainNode.gain.setValueAtTime(0.0001, startTime)
    gainNode.gain.linearRampToValueAtTime(peakLevel, attackEnd)
    gainNode.gain.setValueAtTime(peakLevel, sustainEnd)
    gainNode.gain.linearRampToValueAtTime(0.0001, releaseEnd)

    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    this.activeVoices.add(voice)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
      this.activeVoices.delete(voice)
    }

    oscillator.start(startTime)
    oscillator.stop(releaseEnd)
  }

  private scheduleChord(chord: Chord, startTime: number, duration: number): void {
    const seenNotes = new Set<number>()

    chord.notes.forEach((midiNote) => {
      if (!Number.isFinite(midiNote)) return
      seenNotes.add(midiNote)
      const frequency = this.midiToFrequency(midiNote)
      this.createOscillator(frequency, startTime, duration)
    })

    if (typeof chord.rootMidi === "number") {
      const bassMidi = chord.rootMidi - 12 >= 24 ? chord.rootMidi - 12 : chord.rootMidi
      if (!seenNotes.has(bassMidi)) {
        this.createOscillator(this.midiToFrequency(bassMidi), startTime, duration, {
          type: "sine",
          gain: 1.2,
        })
      }
    }
  }

  private stopVoices(immediate: boolean): void {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const release = immediate ? 0.02 : 0.12

    for (const voice of Array.from(this.activeVoices)) {
      try {
        voice.gain.gain.cancelScheduledValues(now)
        voice.gain.gain.setTargetAtTime(0.0001, now, release)
        voice.oscillator.stop(now + release * 2)
      } catch {
        // Oscillator might already be stopped; ignore.
      }

      voice.oscillator.disconnect()
      voice.gain.disconnect()
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
    const context = await this.ensureAudioContext()
    if (!context || !this.masterGain) return

    this.stopVoices(true)

    const startTime = context.currentTime + 0.05
    this.scheduleChord(chord, startTime, duration)

    return this.startPlaybackTimer(duration + 0.25)
  }

  async playProgression(progression: ChordProgression): Promise<void> {
    if (!progression.chords.length) return

    const context = await this.ensureAudioContext()
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

    if (this.audioContext) {
      this.audioContext.close().catch(() => {})
      this.audioContext = null
      this.masterGain = null
    }

    this.iosUnlockAttempted = false
  }
}
