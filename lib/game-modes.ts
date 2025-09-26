import type { ChordProgression } from "./audio-engine"

export type GameMode = "absolute" | "transpose"

export interface GameSession {
  id: string
  mode: GameMode
  difficulty: string
  currentQuestion: number
  totalQuestions: number
  score: number
  questions: Question[]
  startTime: Date
  endTime?: Date
}

export interface Question {
  id: string
  progression: ChordProgression
  correctAnswer: string[]
  userAnswer?: string[]
  isCorrect?: boolean
  timeSpent?: number
}

export interface GameModeConfig {
  name: string
  description: string
  instructions: string
  answerFormat: string
  examples: string[]
}

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  absolute: {
    name: "Absolute Mode",
    description: "Identify chord progressions using absolute chord names",
    instructions: "Listen to the progression and identify each chord using absolute names like Cmaj7, Dm7, G7, etc.",
    answerFormat: "Chord names (e.g., Cmaj7, Dm7, G7)",
    examples: ["Cmaj7 - Am7 - Dm7 - G7", "F - Dm - Bb - C", "Em7 - A7 - Dmaj7 - Gmaj7"],
  },
  transpose: {
    name: "Transpose Mode",
    description: "Identify chord progressions using Roman numeral analysis",
    instructions:
      "Listen to the root note, then identify the progression using Roman numerals like Imaj7, vi7, ii7, V7.",
    answerFormat: "Roman numerals (e.g., Imaj7, vi7, ii7, V7)",
    examples: ["Imaj7 - vi7 - ii7 - V7", "I - vi - IV - V", "ii7 - V7 - Imaj7 - vi7"],
  },
}

export class GameModeManager {
  private currentSession: GameSession | null = null

  createSession(mode: GameMode, difficulty: string, questionCount = 10): GameSession {
    const session: GameSession = {
      id: `session_${Date.now()}`,
      mode,
      difficulty,
      currentQuestion: 0,
      totalQuestions: questionCount,
      score: 0,
      questions: [],
      startTime: new Date(),
    }

    this.currentSession = session
    return session
  }

  getCurrentSession(): GameSession | null {
    return this.currentSession
  }

  addQuestion(question: Question): void {
    if (this.currentSession) {
      this.currentSession.questions.push(question)
    }
  }

  submitAnswer(questionId: string, answer: string[]): boolean {
    if (!this.currentSession) return false

    const question = this.currentSession.questions.find((q) => q.id === questionId)
    if (!question) return false

    question.userAnswer = answer
    question.isCorrect = this.checkAnswer(question.correctAnswer, answer)

    if (question.isCorrect) {
      this.currentSession.score++
    }

    return question.isCorrect
  }

  private checkAnswer(correct: string[], user: string[]): boolean {
    if (correct.length !== user.length) return false

    return correct.every((chord, index) => {
      const correctNormalized = this.normalizeChord(chord)
      const userNormalized = this.normalizeChord(user[index])
      return correctNormalized === userNormalized
    })
  }

  private normalizeChord(chord: string): string {
    // Normalize chord notation for comparison
    return chord
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace("maj7", "M7")
      .replace("min7", "m7")
      .replace("dom7", "7")
      .replace("°7", "dim7")
      .replace("ø7", "m7b5")
  }

  nextQuestion(): void {
    if (this.currentSession) {
      this.currentSession.currentQuestion++
    }
  }

  isSessionComplete(): boolean {
    if (!this.currentSession) return false
    return this.currentSession.currentQuestion >= this.currentSession.totalQuestions
  }

  completeSession(): GameSession | null {
    if (this.currentSession) {
      this.currentSession.endTime = new Date()
      const completedSession = { ...this.currentSession }
      this.currentSession = null
      return completedSession
    }
    return null
  }

  getSessionStats(): { accuracy: number; averageTime: number; totalTime: number } | null {
    if (!this.currentSession) return null

    const answeredQuestions = this.currentSession.questions.filter((q) => q.userAnswer)
    const correctAnswers = answeredQuestions.filter((q) => q.isCorrect).length
    const accuracy = answeredQuestions.length > 0 ? (correctAnswers / answeredQuestions.length) * 100 : 0

    const totalTime = answeredQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0)
    const averageTime = answeredQuestions.length > 0 ? totalTime / answeredQuestions.length : 0

    return {
      accuracy,
      averageTime,
      totalTime,
    }
  }
}
