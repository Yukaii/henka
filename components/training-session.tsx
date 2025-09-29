"use client"

import { useState, useEffect, useCallback } from "react"
import { QuestionDisplay } from "./question-display"
import { SessionResults } from "./session-results"
import { GameModeManager, type GameSession, type Question, type GameMode } from "@/lib/game-modes"
import { QuestionGenerator, type QuestionSet } from "@/lib/question-generator"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Settings } from "lucide-react"
import { useSettings } from "@/components/settings-provider"
import { useTranslations } from "@/hooks/use-translations"

interface TrainingSessionProps {
  mode: GameMode
  difficulty: string
  questionSet?: QuestionSet
  onExit: () => void
  onSessionComplete?: (session: GameSession) => void
  onOpenSettings?: () => void
}

export function TrainingSession({
  mode,
  difficulty,
  questionSet,
  onExit,
  onSessionComplete,
  onOpenSettings,
}: TrainingSessionProps) {
  const [gameManager] = useState(() => new GameModeManager())
  const [questionGenerator] = useState(() => new QuestionGenerator())
  const [session, setSession] = useState<GameSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [completedSession, setCompletedSession] = useState<GameSession | null>(null)
  const { voiceLeading } = useSettings()
  const t = useTranslations()

  const initializeSession = useCallback(() => {
    const questionCount = questionSet?.questions.length || 10
    const newSession = gameManager.createSession(mode, difficulty, questionCount)

    setCompletedSession(null)
    if (questionSet) {
      questionSet.questions.forEach((q) => gameManager.addQuestion(q))
      setCurrentQuestion(questionSet.questions[0])
    } else {
      const firstQuestion = questionGenerator.generateQuestion(mode, difficulty, undefined, {
        voiceLeading,
      })
      gameManager.addQuestion(firstQuestion)
      setCurrentQuestion(firstQuestion)
    }

    setSession(newSession)
  }, [difficulty, gameManager, mode, questionGenerator, questionSet, voiceLeading])

  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  const handleAnswer = (answer: string[]) => {
    if (!currentQuestion || !session) return

    const isCorrect = questionGenerator.validateAnswer(currentQuestion, answer, mode)
    gameManager.submitAnswer(currentQuestion.id, answer)

    // Update the current question with the result
    const updatedQuestion = {
      ...currentQuestion,
      userAnswer: answer,
      isCorrect,
    }
    setCurrentQuestion(updatedQuestion)
    setShowResult(true)
  }

  const handleNext = () => {
    if (!session) return

    gameManager.nextQuestion()
    setShowResult(false)

    if (gameManager.isSessionComplete()) {
      const finishedSession = gameManager.completeSession()
      if (finishedSession) {
        setCompletedSession(finishedSession)
        if (onSessionComplete) {
          onSessionComplete(finishedSession)
        }
      }
      setIsComplete(true)
      return
    }

    // Load next question
    const nextQuestionIndex = session.currentQuestion + 1
    let nextQuestion: Question

    if (questionSet && questionSet.questions[nextQuestionIndex]) {
      nextQuestion = questionSet.questions[nextQuestionIndex]
    } else {
      nextQuestion = questionGenerator.generateQuestion(mode, difficulty, undefined, {
        voiceLeading,
      })
      gameManager.addQuestion(nextQuestion)
    }

    setCurrentQuestion(nextQuestion)
  }

  const handleRestart = () => {
    setIsComplete(false)
    setShowResult(false)
    setCompletedSession(null)
    initializeSession()
  }

  if (!session || !currentQuestion) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>{t.common.loadingSession}</p>
        </CardContent>
      </Card>
    )
  }

  if (isComplete) {
    return (
      <SessionResults
        session={completedSession ?? session}
        onRestart={handleRestart}
        onExit={onExit}
        mode={mode}
        difficulty={difficulty}
      />
    )
  }

  const answeredCount = session.currentQuestion + (showResult ? 1 : 0)
  const progressValue = session.totalQuestions > 0 ? (answeredCount / session.totalQuestions) * 100 : 0
  const currentQuestionNumber = Math.min(session.currentQuestion + 1, session.totalQuestions)

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-30 -mx-4 border-b border-border/60 bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onExit} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t.trainingSession.exit}</span>
          </Button>

          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t.trainingSession.questionLabel} {currentQuestionNumber} / {session.totalQuestions}
              </span>
              <span>
                {t.trainingSession.score} {session.score}
              </span>
            </div>
            <Progress value={progressValue} className="mt-2 h-2 w-full rounded-full" />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            aria-label={t.trainingSession.openSettingsAria}
            disabled={!onOpenSettings}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <QuestionDisplay
        question={currentQuestion}
        mode={mode}
        difficulty={difficulty}
        questionNumber={session.currentQuestion + 1}
        totalQuestions={session.totalQuestions}
        onAnswer={handleAnswer}
        onNext={handleNext}
        showResult={showResult}
      />
    </div>
  )
}
