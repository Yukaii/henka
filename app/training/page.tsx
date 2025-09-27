"use client"

import { Suspense, useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { TrainingSession } from "@/components/training-session"
import { SettingsModal } from "@/components/settings-modal"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { ProgressTracker } from "@/lib/progress-tracker"
import type { GameMode, GameSession } from "@/lib/game-modes"
import { DIFFICULTY_LEVELS } from "@/lib/chord-generator"

type DifficultyKey = keyof typeof DIFFICULTY_LEVELS

const DEFAULT_MODE: GameMode = "transpose"
const DEFAULT_DIFFICULTY: DifficultyKey = "beginner"

const isValidMode = (value: string | null): value is GameMode => value === "absolute" || value === "transpose"

const isValidDifficulty = (value: string | null): value is DifficultyKey =>
  value !== null && Object.prototype.hasOwnProperty.call(DIFFICULTY_LEVELS, value)

export default function TrainingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          Loading training session...
        </div>
      }
    >
      <TrainingPageContent />
    </Suspense>
  )
}

function TrainingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [progressTracker] = useState(() => new ProgressTracker())

  const modeParam = searchParams.get("mode")
  const difficultyParam = searchParams.get("difficulty")

  const mode: GameMode = isValidMode(modeParam) ? modeParam : DEFAULT_MODE
  const difficulty: string = isValidDifficulty(difficultyParam) ? difficultyParam : DEFAULT_DIFFICULTY

  const handleExit = useCallback(() => {
    router.push("/")
  }, [router])

  const handleSessionComplete = useCallback(
    (session: GameSession) => {
      const newAchievements = progressTracker.recordSession(session)
      console.log("[v0] Session recorded, new achievements:", newAchievements)
    },
    [progressTracker]
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-md space-y-4">
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} aria-label="Open settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <TrainingSession mode={mode} difficulty={difficulty} onExit={handleExit} onSessionComplete={handleSessionComplete} />
      </div>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
