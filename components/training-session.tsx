"use client"

import { useState, useEffect } from "react"
import { QuestionDisplay } from "./question-display"
import { SessionResults } from "./session-results"
import { GameModeManager, type GameSession, type Question, type GameMode } from "@/lib/game-modes"
import { QuestionGenerator, type QuestionSet } from "@/lib/question-generator"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface TrainingSessionProps {
  mode: GameMode
  difficulty: string
  questionSet?: QuestionSet
  onExit: () => void
  onSessionComplete?: (session: GameSession) => void
}

export function TrainingSession({ mode, difficulty, questionSet, onExit, onSessionComplete }: TrainingSessionProps) {
  const [gameManager] = useState(() => new GameModeManager())
  const [questionGenerator] = useState(() => new QuestionGenerator())
  const [session, setSession] = useState<GameSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    initializeSession()
  }, [mode, difficulty, questionSet])

  const initializeSession = () => {
    const questionCount = questionSet?.questions.length || 10
    const newSession = gameManager.createSession(mode, difficulty, questionCount)

    if (questionSet) {
      // Use preset questions
      questionSet.questions.forEach((q) => gameManager.addQuestion(q))
      setCurrentQuestion(questionSet.questions[0])
    } else {
      // Generate random questions
      const firstQuestion = questionGenerator.generateQuestion(mode, difficulty)
      gameManager.addQuestion(firstQuestion)
      setCurrentQuestion(firstQuestion)
    }

    setSession(newSession)
  }

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
      setIsComplete(true)
      const completedSession = gameManager.completeSession()
      if (completedSession && onSessionComplete) {
        onSessionComplete(completedSession)
      }
      return
    }

    // Load next question
    const nextQuestionIndex = session.currentQuestion + 1
    let nextQuestion: Question

    if (questionSet && questionSet.questions[nextQuestionIndex]) {
      nextQuestion = questionSet.questions[nextQuestionIndex]
    } else {
      nextQuestion = questionGenerator.generateQuestion(mode, difficulty)
      gameManager.addQuestion(nextQuestion)
    }

    setCurrentQuestion(nextQuestion)
  }

  const handleRestart = () => {
    setIsComplete(false)
    setShowResult(false)
    initializeSession()
  }

  if (!session || !currentQuestion) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>Loading training session...</p>
        </CardContent>
      </Card>
    )
  }

  if (isComplete) {
    const completedSession = gameManager.getCurrentSession()
    return (
      <SessionResults
        session={completedSession}
        onRestart={handleRestart}
        onExit={onExit}
        mode={mode}
        difficulty={difficulty}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Exit Training
        </Button>
        <div className="text-sm text-muted-foreground">
          Score: {session.score}/{session.currentQuestion + (showResult ? 1 : 0)}
        </div>
      </div>

      {/* Question Display */}
      <QuestionDisplay
        question={currentQuestion}
        mode={mode}
        questionNumber={session.currentQuestion + 1}
        totalQuestions={session.totalQuestions}
        onAnswer={handleAnswer}
        onNext={handleNext}
        showResult={showResult}
      />
    </div>
  )
}
