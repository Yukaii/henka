"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GameModeSelector } from "@/components/game-mode-selector"
import { DifficultySelector } from "@/components/difficulty-selector"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsModal } from "@/components/settings-modal"
import { DIFFICULTY_LEVELS } from "@/lib/chord-generator"
import { type GameMode, GAME_MODES } from "@/lib/game-modes"
import { WELCOME_SEEN_KEY } from "@/lib/storage-keys"
import { Settings, BarChart3, ArrowLeft } from "lucide-react"

type AppView = "menu" | "setup" | "progress"

export default function ChordTrainerApp() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<AppView>("menu")
  const [selectedMode, setSelectedMode] = useState<GameMode>("transpose")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("beginner")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const hasSeenWelcome = window.localStorage.getItem(WELCOME_SEEN_KEY)
    if (!hasSeenWelcome) {
      router.replace("/welcome")
      return
    }
    setIsReady(true)
  }, [router])

  const handleStartTraining = () => {
    const params = new URLSearchParams({ mode: selectedMode, difficulty: selectedDifficulty })
    router.push(`/training?${params.toString()}`)
  }

  const handleSetup = () => {
    setCurrentView("setup")
  }

  const handleBackToMenu = () => {
    setCurrentView("menu")
  }

  const renderContent = () => {
    switch (currentView) {
      case "menu": {
        const modeConfig = GAME_MODES[selectedMode]
        const difficultyConfig = DIFFICULTY_LEVELS[selectedDifficulty] ?? DIFFICULTY_LEVELS.beginner
        const inversionSummary = difficultyConfig.useInversions
          ? `Inversions up to ${
              difficultyConfig.maxInversion === 1
                ? "1st"
                : difficultyConfig.maxInversion === 2
                  ? "2nd"
                  : "3rd"
            }`
          : "Root position only"

        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Mode</div>
                  <Select value={selectedMode} onValueChange={(value) => setSelectedMode(value as GameMode)}>
                    <SelectTrigger className="w-full justify-between">
                      <SelectValue aria-label={modeConfig.name}>{modeConfig.name}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GAME_MODES).map(([mode, config]) => (
                        <SelectItem key={mode} value={mode}>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{config.name}</span>
                            <span className="text-xs text-muted-foreground">{config.answerFormat}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-sm">
                    <p className="font-semibold text-foreground">{modeConfig.name}</p>
                    <p className="text-muted-foreground leading-relaxed">{modeConfig.description}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Answer format:</span> {modeConfig.answerFormat}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground/90">Example: {modeConfig.examples[0]}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Difficulty</div>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-full justify-between capitalize">
                      <SelectValue aria-label={difficultyConfig.name}>{difficultyConfig.name}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                        <SelectItem key={key} value={key} className="capitalize">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{level.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {level.chordTypes.length} chord types · {level.progressionLength}-chord phrases
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-sm">
                    <p className="font-semibold text-foreground">{difficultyConfig.name}</p>
                    <p className="text-muted-foreground leading-relaxed">{difficultyConfig.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{difficultyConfig.chordTypes.length} chord families</span>
                      <span>{difficultyConfig.progressionLength}-chord phrases</span>
                      <span>{inversionSummary}</span>
                      <span>
                        {difficultyConfig.allowedKeys
                          ? `Keys: ${difficultyConfig.allowedKeys.join(", ")}`
                          : "All keys"
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={handleStartTraining} className="flex-1" size="lg">
                    Start Training
                  </Button>
                  <Button onClick={handleSetup} variant="outline" className="flex-1" size="lg">
                    Full Setup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={() => setCurrentView("progress")} variant="outline" className="flex-1">
                <BarChart3 className="h-4 w-4 mr-2" />
                Progress
              </Button>
            </div>
          </div>
        )
      }

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

      case "progress":
        return <ProgressDashboard onClose={handleBackToMenu} />

      default:
        return null
    }
  }

  if (!isReady) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/welcome">Welcome</Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} aria-label="Open settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        {renderContent()}
      </div>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
