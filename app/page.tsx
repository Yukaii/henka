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
import { useTranslations } from "@/hooks/use-translations"
import { useSettings } from "@/components/settings-provider"
import { formatChordFamilies, formatChordPhrases, formatInversionSummary, formatKeys } from "@/lib/i18n"

type AppView = "menu" | "setup" | "progress"

export default function ChordTrainerApp() {
  const router = useRouter()
  const t = useTranslations()
  const { language } = useSettings()
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
        const modeMessages = t.gameModes?.[selectedMode]
        const difficultyMessages = t.difficulties?.[selectedDifficulty]
        const modeName = modeMessages?.name ?? modeConfig.name
        const modeDescription = modeMessages?.description ?? modeConfig.description
        const modeAnswerFormat = modeMessages?.answerFormat ?? modeConfig.answerFormat
        const difficultyName = difficultyMessages?.name ?? difficultyConfig.name
        const difficultyDescription = difficultyMessages?.description ?? difficultyConfig.description
        const inversionSummary = formatInversionSummary(
          language,
          difficultyConfig.useInversions,
          difficultyConfig.maxInversion,
        )

        return (
          <div className="space-y-6 pb-32 sm:pb-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t.home.quickSetup}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{t.home.modeLabel}</div>
                  <Select value={selectedMode} onValueChange={(value) => setSelectedMode(value as GameMode)}>
                    <SelectTrigger className="w-full justify-between">
                      <SelectValue aria-label={modeName}>{modeName}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GAME_MODES).map(([mode, config]) => {
                        const itemMessages = t.gameModes?.[mode as GameMode]
                        return (
                          <SelectItem key={mode} value={mode}>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">
                                {itemMessages?.name ?? config.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {itemMessages?.answerFormat ?? config.answerFormat}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-sm">
                    <p className="font-semibold text-foreground">{modeName}</p>
                    <p className="text-muted-foreground leading-relaxed">{modeDescription}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">{t.home.answerFormatLabel}</span> {modeAnswerFormat}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground/90">
                      {t.home.exampleLabel} {modeConfig.examples[0]}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{t.home.difficultyLabel}</div>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-full justify-between capitalize">
                      <SelectValue aria-label={difficultyName}>{difficultyName}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => {
                        const itemMessages = t.difficulties?.[key]
                        return (
                          <SelectItem key={key} value={key} className="capitalize">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">
                                {itemMessages?.name ?? level.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatChordFamilies(language, level.chordTypes.length)} · {" "}
                                {formatChordPhrases(language, level.progressionLength)}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-sm">
                    <p className="font-semibold text-foreground">{difficultyName}</p>
                    <p className="text-muted-foreground leading-relaxed">{difficultyDescription}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{formatChordFamilies(language, difficultyConfig.chordTypes.length)}</span>
                      <span>{formatChordPhrases(language, difficultyConfig.progressionLength)}</span>
                      <span>{inversionSummary}</span>
                      <span>{formatKeys(language, difficultyConfig.allowedKeys)}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden gap-2 sm:grid sm:grid-cols-3">
                  <Button onClick={handleStartTraining} className="w-full" size="lg">
                    {t.home.startTraining}
                  </Button>
                  <Button onClick={handleSetup} variant="outline" className="w-full" size="lg">
                    {t.home.fullSetup}
                  </Button>
                  <Button onClick={() => setCurrentView("progress")} variant="ghost" className="w-full" size="lg">
                    <BarChart3 className="mr-2 h-4 w-4" /> {t.home.progress}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-4 pt-3 shadow-md backdrop-blur">
              <div className="grid grid-cols-1 gap-2">
                <Button onClick={handleStartTraining} className="w-full" size="default">
                  {t.home.startTraining}
                </Button>
                <Button onClick={handleSetup} variant="outline" className="w-full" size="default">
                  {t.home.fullSetup}
                </Button>
                <Button onClick={() => setCurrentView("progress")} variant="ghost" className="w-full" size="default">
                  <BarChart3 className="mr-2 h-4 w-4" /> {t.home.progress}
                </Button>
              </div>
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
              <h2 className="text-xl font-bold">{t.home.setupTitle}</h2>
            </div>

            <GameModeSelector selectedMode={selectedMode} onModeSelect={setSelectedMode} />

            <DifficultySelector selectedDifficulty={selectedDifficulty} onDifficultySelect={setSelectedDifficulty} />

            <Button onClick={handleStartTraining} className="w-full" size="lg">
              {t.home.startTraining}
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
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 pb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/welcome">{t.home.welcomeLink}</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label={t.trainingSession.openSettingsAria}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        {renderContent()}
      </div>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
