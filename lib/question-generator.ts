import {
  ChordGenerator,
  DIFFICULTY_LEVELS,
  type ProgressionGenerationOptions,
} from "./chord-generator"
import type { Question, GameMode } from "./game-modes"
import type { ChordProgression } from "./audio-engine"

export interface QuestionSet {
  id: string
  name: string
  description: string
  difficulty: string
  mode: GameMode
  questions: Question[]
  createdAt: Date
}

export const PRESET_QUESTION_SETS: QuestionSet[] = [
  {
    id: "beginner-absolute-1",
    name: "Basic Triads - Absolute",
    description: "Simple major and minor triads in common keys",
    difficulty: "beginner",
    mode: "absolute",
    questions: [],
    createdAt: new Date(),
  },
  {
    id: "beginner-transpose-1",
    name: "Basic Progressions - Roman Numerals",
    description: "Common I-V-vi-IV progressions in Roman numeral notation",
    difficulty: "beginner",
    mode: "transpose",
    questions: [],
    createdAt: new Date(),
  },
  {
    id: "intermediate-absolute-1",
    name: "Seventh Chords - Absolute",
    description: "Major 7th, minor 7th, and dominant 7th chords",
    difficulty: "intermediate",
    mode: "absolute",
    questions: [],
    createdAt: new Date(),
  },
  {
    id: "intermediate-transpose-1",
    name: "Jazz Progressions - Roman Numerals",
    description: "ii-V-I and other jazz progressions",
    difficulty: "intermediate",
    mode: "transpose",
    questions: [],
    createdAt: new Date(),
  },
  {
    id: "advanced-absolute-1",
    name: "Extended Chords - Absolute",
    description: "9th, 11th chords and altered dominants",
    difficulty: "advanced",
    mode: "absolute",
    questions: [],
    createdAt: new Date(),
  },
  {
    id: "advanced-transpose-1",
    name: "Complex Jazz - Roman Numerals",
    description: "Advanced jazz progressions with extensions",
    difficulty: "advanced",
    mode: "transpose",
    questions: [],
    createdAt: new Date(),
  },
]

export class QuestionGenerator {
  private chordGenerator: ChordGenerator

  constructor() {
    this.chordGenerator = new ChordGenerator()
  }

  generateQuestion(
    mode: GameMode,
    difficulty: string,
    questionId?: string,
    options?: ProgressionGenerationOptions,
  ): Question {
    const progression = this.chordGenerator.generateRandomProgression(difficulty, undefined, options)
    const correctAnswer = this.generateCorrectAnswer(progression, mode, difficulty)

    return {
      id: questionId || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      progression,
      correctAnswer,
    }
  }

  generateQuestionSet(
    mode: GameMode,
    difficulty: string,
    count: number,
    name?: string,
    description?: string,
    options?: ProgressionGenerationOptions,
  ): QuestionSet {
    const questions: Question[] = []

    for (let i = 0; i < count; i++) {
      questions.push(this.generateQuestion(mode, difficulty, undefined, options))
    }

    return {
      id: `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name || `${difficulty} ${mode} Set`,
      description: description || `Generated ${difficulty} difficulty questions for ${mode} mode`,
      difficulty,
      mode,
      questions,
      createdAt: new Date(),
    }
  }

  private generateCorrectAnswer(
    progression: ChordProgression,
    mode: GameMode,
    difficulty: string,
  ): string[] {
    const isAdvanced = difficulty === "advanced" || difficulty === "custom"

    if (mode === "absolute") {
      return progression.chords.map((chord) => {
        if (isAdvanced) {
          return chord.name
        }

        const [baseName] = chord.name.split("/")
        return baseName
      })
    } else {
      // Transpose mode - return Roman numerals
      return progression.chords.map((chord) => {
        const roman = chord.romanNumeral || "I"
        if (isAdvanced) {
          return roman
        }

        const [baseRoman] = roman.split("/")
        return baseRoman
      })
    }
  }

  getPresetQuestionSets(mode?: GameMode, difficulty?: string): QuestionSet[] {
    let sets = PRESET_QUESTION_SETS

    if (mode) {
      sets = sets.filter((set) => set.mode === mode)
    }

    if (difficulty) {
      sets = sets.filter((set) => set.difficulty === difficulty)
    }

    // Generate questions for preset sets if they don't have any
    return sets.map((set) => {
      if (set.questions.length === 0) {
        const questionCount = DIFFICULTY_LEVELS[set.difficulty]?.progressionLength * 2 || 8
        const generatedSet = this.generateQuestionSet(
          set.mode,
          set.difficulty,
          questionCount,
          set.name,
          set.description,
        )
        return {
          ...set,
          questions: generatedSet.questions,
        }
      }
      return set
    })
  }

  validateAnswer(question: Question, userAnswer: string[], mode: GameMode): boolean {
    if (!userAnswer || userAnswer.length !== question.correctAnswer.length) {
      return false
    }

    return question.correctAnswer.every((correct, index) => {
      const userChord = userAnswer[index]?.trim()
      const correctChord = correct.trim()

      if (mode === "absolute") {
        return this.normalizeAbsoluteChord(userChord) === this.normalizeAbsoluteChord(correctChord)
      } else {
        return this.normalizeRomanNumeral(userChord) === this.normalizeRomanNumeral(correctChord)
      }
    })
  }

  private normalizeAbsoluteChord(chord: string): string {
    return chord
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace("major", "")
      .replace("maj7", "M7")
      .replace("min7", "m7")
      .replace("minor", "m")
      .replace("dom7", "7")
      .replace("diminished", "dim")
      .replace("°", "dim")
      .replace("ø", "m7b5")
      .replace("half-diminished", "m7b5")
  }

  private normalizeRomanNumeral(roman: string): string {
    return roman
      .replace(/\s+/g, "")
      .replace("maj7", "M7")
      .replace("min7", "m7")
      .replace("dom7", "7")
      .replace("°7", "dim7")
      .replace("ø7", "m7b5")
  }

  getHint(question: Question, mode: GameMode): string {
    const progression = question.progression
    const key = progression.key

    if (mode === "absolute") {
      return `The progression is in the key of ${key}. Listen for the chord qualities and root movements.`
    } else {
      return `The root note is ${key}. Identify the Roman numerals based on the scale degrees and chord qualities.`
    }
  }

  getDifficultyInfo(difficulty: string): { name: string; description: string; tips: string[] } {
    const level = DIFFICULTY_LEVELS[difficulty]
    if (!level) {
      return { name: "Unknown", description: "", tips: [] }
    }

    const tips = {
      easy: [
        "Start with just major and minor chords",
        "Focus on the bright (major) vs dark (minor) sound",
        "Only common keys (C, G, F, D) for easier recognition",
      ],
      beginner: [
        "Focus on distinguishing major from minor chords",
        "Listen to the bass line for root movement",
        "Common progressions: I-V-vi-IV, vi-IV-I-V",
      ],
      intermediate: [
        "Pay attention to 7th chord qualities",
        "Listen for the characteristic sound of dominant 7th chords",
        "Jazz progressions often use ii-V-I patterns",
      ],
      advanced: [
        "Extended chords add color tones (9ths, 11ths)",
        "Altered dominants create tension and resolution",
        "Complex progressions may have multiple key centers",
      ],
    }

    return {
      name: level.name,
      description: `Uses ${level.chordTypes.join(", ")} chord types`,
      tips: tips[difficulty as keyof typeof tips] || [],
    }
  }
}
