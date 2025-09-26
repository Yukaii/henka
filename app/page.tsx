"use client"

import { useState } from "react"
import { GameModeSelector } from "@/components/game-mode-selector"
import { DifficultySelector } from "@/components/difficulty-selector"
import { TrainingSession } from "@/components/training-session"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { GameMode } from "@/lib/game-modes"
import { QuestionGenerator } from "@/lib/question-generator"
import { ProgressTracker } from "@/lib/progress-tracker"
import { Music, Settings, BarChart3, ArrowLeft } from "lucide-react"

type AppState = "menu" | "setup" | "training" | "progress"

export default function ChordTrainerApp() {
  const [appState, setAppState] = useState<AppState>("menu")
  const [selectedMode, setSelectedMode] = useState<GameMode>("absolute")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("beginner")
  const [questionGenerator] = useState(() => new QuestionGenerator())
  const [progressTracker] = useState(() => new ProgressTracker())

  const handleStartTraining = () => {
    setAppState("training")
  }

  const handleSetup = () => {
    setAppState("setup")
  }

  const handleBackToMenu = () => {
    setAppState("menu")
  }

  const handleSessionComplete = (session: any) => {
    const newAchievements = progressTracker.recordSession(session)
    console.log("[v0] Session recorded, new achievements:", newAchievements)
  }

  const renderContent = () => {
    switch (appState) {
      case "menu":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <Music className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-balance">Chord Ear Trainer</h1>
              <p className="text-muted-foreground text-pretty max-w-md mx-auto">
                Train your ear to recognize chord progressions
              </p>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Mode</p>
                    <p className="font-medium">{selectedMode === "absolute" ? "Chord Names" : "Roman Numerals"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Difficulty</p>
                    <p className="font-medium capitalize">{selectedDifficulty}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleStartTraining} className="flex-1">
                    Start Training
                  </Button>
                  <Button onClick={handleSetup} variant="outline">
                    Setup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={() => setAppState("progress")} variant="outline" className="flex-1">
                <BarChart3 className="h-4 w-4 mr-2" />
                Progress
              </Button>
            </div>
          </div>
        )

      case "setup":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBackToMenu}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-bold">Setup Training</h2>
            </div>

            <GameModeSelector selectedMode={selectedMode} onModeSelect={setSelectedMode} />

            <DifficultySelector selectedDifficulty={selectedDifficulty} onDifficultySelect={setSelectedDifficulty} />

            <Button onClick={handleStartTraining} className="w-full" size="lg">
              Start Training
            </Button>
          </div>
        )

      case "training":
        return (
          <TrainingSession
            mode={selectedMode}
            difficulty={selectedDifficulty}
            onExit={handleBackToMenu}
            onSessionComplete={handleSessionComplete}
          />
        )

      case "progress":
        return <ProgressDashboard onClose={handleBackToMenu} />

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-md">{renderContent()}</div>
    </div>
  )
}
