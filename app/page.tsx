"use client"

import { useState } from "react"
import { GameModeSelector } from "@/components/game-mode-selector"
import { DifficultySelector } from "@/components/difficulty-selector"
import { QuestionSetSelector } from "@/components/question-set-selector"
import { TrainingSession } from "@/components/training-session"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { GameMode } from "@/lib/game-modes"
import type { QuestionSet } from "@/lib/question-generator"
import { QuestionGenerator } from "@/lib/question-generator"
import { ProgressTracker } from "@/lib/progress-tracker"
import { Music, Headphones, Target, BarChart3 } from "lucide-react"

type AppState = "menu" | "mode-select" | "difficulty-select" | "question-select" | "training" | "progress"

export default function ChordTrainerApp() {
  const [appState, setAppState] = useState<AppState>("menu")
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<QuestionSet | null>(null)
  const [questionGenerator] = useState(() => new QuestionGenerator())
  const [progressTracker] = useState(() => new ProgressTracker())

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode)
  }

  const handleStartWithMode = () => {
    if (selectedMode) {
      setAppState("difficulty-select")
    }
  }

  const handleDifficultySelect = (difficulty: string) => {
    setSelectedDifficulty(difficulty)
    setAppState("question-select")
  }

  const handleQuestionSetSelect = (questionSet: QuestionSet) => {
    setSelectedQuestionSet(questionSet)
    setAppState("training")
  }

  const handleGenerateRandom = () => {
    if (selectedMode && selectedDifficulty) {
      setSelectedQuestionSet(null)
      setAppState("training")
    }
  }

  const handleExitTraining = () => {
    setAppState("menu")
    setSelectedMode(null)
    setSelectedDifficulty(null)
    setSelectedQuestionSet(null)
  }

  const handleSessionComplete = (session: any) => {
    const newAchievements = progressTracker.recordSession(session)
    // Could show achievement notifications here
    console.log("[v0] Session recorded, new achievements:", newAchievements)
  }

  const renderContent = () => {
    switch (appState) {
      case "menu":
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <Music className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-balance">Chord Progression Ear Trainer</h1>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
                Develop your musical ear by identifying chord progressions in both absolute and relative modes
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Headphones className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">Two Training Modes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Practice with absolute chord names (Cmaj7, Dm7) or Roman numeral analysis (Imaj7, ii7)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-accent" />
                    <CardTitle className="text-lg">Progressive Difficulty</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Start with basic triads and advance to complex extended chords and jazz progressions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Music className="h-6 w-6 text-chart-3" />
                    <CardTitle className="text-lg">Curated Content</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Pre-generated question sets and random practice sessions for comprehensive training
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setAppState("mode-select")} size="lg" className="px-8">
                Start Training
              </Button>
              <Button onClick={() => setAppState("progress")} variant="outline" size="lg" className="px-8">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Progress
              </Button>
            </div>
          </div>
        )

      case "mode-select":
        return (
          <GameModeSelector selectedMode={selectedMode} onModeSelect={handleModeSelect} onStart={handleStartWithMode} />
        )

      case "difficulty-select":
        return (
          <DifficultySelector selectedDifficulty={selectedDifficulty} onDifficultySelect={handleDifficultySelect} />
        )

      case "question-select":
        return selectedMode && selectedDifficulty ? (
          <QuestionSetSelector
            mode={selectedMode}
            difficulty={selectedDifficulty}
            onSetSelect={handleQuestionSetSelect}
            onGenerateRandom={handleGenerateRandom}
          />
        ) : null

      case "training":
        return selectedMode && selectedDifficulty ? (
          <TrainingSession
            mode={selectedMode}
            difficulty={selectedDifficulty}
            questionSet={selectedQuestionSet || undefined}
            onExit={handleExitTraining}
            onSessionComplete={handleSessionComplete}
          />
        ) : null

      case "progress":
        return <ProgressDashboard onClose={() => setAppState("menu")} />

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">{renderContent()}</div>
      </div>
    </div>
  )
}
