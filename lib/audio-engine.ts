// Audio engine for generating and playing chord progressions
export interface Chord {
  name: string
  notes: number[]
  romanNumeral?: string
  inversion?: number
}

export interface ChordProgression {
  chords: Chord[]
  key: string
  tempo: number
}

export class AudioEngine {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeAudio()
    }
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = 0.3
    } catch (error) {
      console.error("Failed to initialize audio context:", error)
    }
  }

  private midiToFrequency(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12)
  }

  private createOscillator(frequency: number, startTime: number, duration: number): void {
    if (!this.audioContext || !this.masterGain) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(frequency, startTime)

    // ADSR envelope
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.2, startTime + 0.2)
    gainNode.gain.setValueAtTime(0.2, startTime + duration - 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }

  async playChord(chord: Chord, duration = 2): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudio()
    }

    if (!this.audioContext) return

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume()
    }

    const startTime = this.audioContext.currentTime

    chord.notes.forEach((midiNote) => {
      const frequency = this.midiToFrequency(midiNote)
      this.createOscillator(frequency, startTime, duration)
    })
  }

  async playProgression(progression: ChordProgression): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudio()
    }

    if (!this.audioContext) return

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume()
    }

    const chordDuration = (60 / progression.tempo) * 2 // 2 beats per chord
    let currentTime = this.audioContext.currentTime

    for (const chord of progression.chords) {
      chord.notes.forEach((midiNote) => {
        const frequency = this.midiToFrequency(midiNote)
        this.createOscillator(frequency, currentTime, chordDuration)
      })
      currentTime += chordDuration
    }
  }

  stop(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
      this.masterGain = null
    }
  }
}
