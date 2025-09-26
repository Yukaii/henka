import type { GameSession, GameMode } from "./game-modes"

export interface UserStats {
  totalSessions: number
  totalQuestions: number
  totalCorrect: number
  overallAccuracy: number
  averageSessionTime: number
  bestStreak: number
  currentStreak: number
  lastSessionDate: Date | null
}

export interface ModeStats {
  mode: GameMode
  difficulty: string
  sessionsPlayed: number
  questionsAnswered: number
  correctAnswers: number
  accuracy: number
  averageTime: number
  bestAccuracy: number
  improvementTrend: number // Positive = improving, negative = declining
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  progress?: number
  target?: number
}

interface StoredData {
  userStats: UserStats
  modeStats: ModeStats[]
  achievements: Achievement[]
  sessionHistory: GameSession[]
}

interface StoredDataJSON {
  userStats: Omit<UserStats, "lastSessionDate"> & { lastSessionDate: string | null }
  modeStats: ModeStats[]
  achievements: Array<Omit<Achievement, "unlockedAt"> & { unlockedAt?: string | null }>
  sessionHistory: Array<Omit<GameSession, "startTime" | "endTime"> & { startTime: string; endTime?: string | null }>
}

export interface ProgressSummary {
  recentImprovement: number
  strongestMode: string
  weakestMode: string
  nextMilestone: Achievement | null
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-session",
    name: "Getting Started",
    description: "Complete your first training session",
    icon: "🎵",
  },
  {
    id: "perfect-score",
    name: "Perfect Pitch",
    description: "Score 100% on a training session",
    icon: "🎯",
  },
  {
    id: "streak-5",
    name: "On a Roll",
    description: "Get 5 questions correct in a row",
    icon: "🔥",
    target: 5,
  },
  {
    id: "streak-10",
    name: "Hot Streak",
    description: "Get 10 questions correct in a row",
    icon: "⚡",
    target: 10,
  },
  {
    id: "sessions-10",
    name: "Dedicated Student",
    description: "Complete 10 training sessions",
    icon: "📚",
    target: 10,
  },
  {
    id: "sessions-50",
    name: "Ear Training Master",
    description: "Complete 50 training sessions",
    icon: "🏆",
    target: 50,
  },
  {
    id: "all-difficulties",
    name: "Well Rounded",
    description: "Complete sessions in all difficulty levels",
    icon: "🌟",
  },
  {
    id: "both-modes",
    name: "Versatile Musician",
    description: "Complete sessions in both absolute and transpose modes",
    icon: "🎼",
  },
]

export class ProgressTracker {
  private storageKey = "chord-trainer-progress"

  private getStoredData(): StoredData {
    if (typeof window === "undefined") {
      return this.getDefaultData()
    }

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as StoredDataJSON

        const userStats: UserStats = {
          ...parsed.userStats,
          lastSessionDate: parsed.userStats.lastSessionDate ? new Date(parsed.userStats.lastSessionDate) : null,
        }

        const achievements: Achievement[] = parsed.achievements.map((achievement) => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
        }))

        const sessionHistory: GameSession[] = parsed.sessionHistory.map((session) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
        }))

        return {
          userStats,
          modeStats: parsed.modeStats,
          achievements,
          sessionHistory,
        }
      }
    } catch (error) {
      console.error("Error loading progress data:", error)
    }

    return this.getDefaultData()
  }

  private getDefaultData(): StoredData {
    return {
      userStats: {
        totalSessions: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        overallAccuracy: 0,
        averageSessionTime: 0,
        bestStreak: 0,
        currentStreak: 0,
        lastSessionDate: null,
      },
      modeStats: [],
      achievements: ACHIEVEMENTS.map((a) => ({ ...a })),
      sessionHistory: [],
    }
  }

  private saveData(data: StoredData): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving progress data:", error)
    }
  }

  getUserStats(): UserStats {
    return this.getStoredData().userStats
  }

  getModeStats(mode?: GameMode, difficulty?: string): ModeStats[] {
    let stats = this.getStoredData().modeStats

    if (mode) {
      stats = stats.filter((s) => s.mode === mode)
    }

    if (difficulty) {
      stats = stats.filter((s) => s.difficulty === difficulty)
    }

    return stats
  }

  getAchievements(): Achievement[] {
    return this.getStoredData().achievements
  }

  getUnlockedAchievements(): Achievement[] {
    return this.getAchievements().filter((a) => a.unlockedAt)
  }

  getSessionHistory(limit?: number): GameSession[] {
    const history = this.getStoredData().sessionHistory
    return limit ? history.slice(-limit) : history
  }

  recordSession(session: GameSession): Achievement[] {
    const data = this.getStoredData()
    const newAchievements: Achievement[] = []

    // Add session to history
    data.sessionHistory.push(session)

    // Update user stats
    const sessionTime =
      session.endTime && session.startTime ? (session.endTime.getTime() - session.startTime.getTime()) / 1000 : 0

    data.userStats.totalSessions++
    data.userStats.totalQuestions += session.totalQuestions
    data.userStats.totalCorrect += session.score
    data.userStats.overallAccuracy = (data.userStats.totalCorrect / data.userStats.totalQuestions) * 100
    data.userStats.averageSessionTime =
      (data.userStats.averageSessionTime * (data.userStats.totalSessions - 1) + sessionTime) /
      data.userStats.totalSessions
    data.userStats.lastSessionDate = session.endTime || new Date()

    // Update streak
    const sessionAccuracy = (session.score / session.totalQuestions) * 100
    if (sessionAccuracy >= 80) {
      data.userStats.currentStreak++
      data.userStats.bestStreak = Math.max(data.userStats.bestStreak, data.userStats.currentStreak)
    } else {
      data.userStats.currentStreak = 0
    }

    // Update mode stats
    let modeStat = data.modeStats.find((s) => s.mode === session.mode && s.difficulty === session.difficulty)

    if (!modeStat) {
      modeStat = {
        mode: session.mode,
        difficulty: session.difficulty,
        sessionsPlayed: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageTime: 0,
        bestAccuracy: 0,
        improvementTrend: 0,
      }
      data.modeStats.push(modeStat)
    }

    const previousAccuracy = modeStat.accuracy
    modeStat.sessionsPlayed++
    modeStat.questionsAnswered += session.totalQuestions
    modeStat.correctAnswers += session.score
    modeStat.accuracy = (modeStat.correctAnswers / modeStat.questionsAnswered) * 100
    modeStat.averageTime =
      (modeStat.averageTime * (modeStat.sessionsPlayed - 1) + sessionTime) / modeStat.sessionsPlayed
    modeStat.bestAccuracy = Math.max(modeStat.bestAccuracy, sessionAccuracy)
    modeStat.improvementTrend = modeStat.accuracy - previousAccuracy

    // Check for achievements
    newAchievements.push(...this.checkAchievements(data, session))

    this.saveData(data)
    return newAchievements
  }

  private checkAchievements(data: StoredData, session: GameSession): Achievement[] {
    const newAchievements: Achievement[] = []

    data.achievements.forEach((achievement) => {
      if (achievement.unlockedAt) return // Already unlocked

      let shouldUnlock = false

      switch (achievement.id) {
        case "first-session":
          shouldUnlock = data.userStats.totalSessions >= 1
          break

        case "perfect-score":
          shouldUnlock = session.score === session.totalQuestions
          break

        case "streak-5":
          shouldUnlock = data.userStats.currentStreak >= 5
          achievement.progress = data.userStats.currentStreak
          break

        case "streak-10":
          shouldUnlock = data.userStats.currentStreak >= 10
          achievement.progress = data.userStats.currentStreak
          break

        case "sessions-10":
          shouldUnlock = data.userStats.totalSessions >= 10
          achievement.progress = data.userStats.totalSessions
          break

        case "sessions-50":
          shouldUnlock = data.userStats.totalSessions >= 50
          achievement.progress = data.userStats.totalSessions
          break

        case "all-difficulties":
          const difficulties = new Set(data.modeStats.map((s) => s.difficulty))
          shouldUnlock =
            difficulties.has("easy") && 
            difficulties.has("beginner") && 
            difficulties.has("intermediate") && 
            difficulties.has("advanced")
          break

        case "both-modes":
          const modes = new Set(data.modeStats.map((s) => s.mode))
          shouldUnlock = modes.has("absolute") && modes.has("transpose")
          break
      }

      if (shouldUnlock) {
        achievement.unlockedAt = new Date()
        newAchievements.push({ ...achievement })
      }
    })

    return newAchievements
  }

  getProgressSummary(): ProgressSummary {
    const data = this.getStoredData()
    const recentSessions = data.sessionHistory.slice(-5)

    let recentImprovement = 0
    if (recentSessions.length >= 2) {
      const firstHalf = recentSessions.slice(0, Math.floor(recentSessions.length / 2))
      const secondHalf = recentSessions.slice(Math.floor(recentSessions.length / 2))

      const firstAccuracy = firstHalf.reduce((sum, s) => sum + s.score / s.totalQuestions, 0) / firstHalf.length
      const secondAccuracy = secondHalf.reduce((sum, s) => sum + s.score / s.totalQuestions, 0) / secondHalf.length

      recentImprovement = (secondAccuracy - firstAccuracy) * 100
    }

    const modeStats = data.modeStats.sort((a, b) => b.accuracy - a.accuracy)
    const strongestMode = modeStats[0] ? `${modeStats[0].mode} (${modeStats[0].difficulty})` : "None"
    const weakestMode = modeStats[modeStats.length - 1]
      ? `${modeStats[modeStats.length - 1].mode} (${modeStats[modeStats.length - 1].difficulty})`
      : "None"

    const nextMilestone =
      data.achievements
        .filter((a) => !a.unlockedAt && a.target)
        .sort((a, b) => {
          const aProgress = a.progress || 0
          const bProgress = b.progress || 0
          const aRemaining = (a.target || 0) - aProgress
          const bRemaining = (b.target || 0) - bProgress
          return aRemaining - bRemaining
        })[0] || null

    return {
      recentImprovement,
      strongestMode,
      weakestMode,
      nextMilestone,
    }
  }

  resetProgress(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey)
    }
  }
}
