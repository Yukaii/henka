"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AudioControls } from "./audio-controls"
import type { Question, GameMode } from "@/lib/game-modes"
import { QuestionGenerator } from "@/lib/question-generator"
import { CheckCircle, XCircle, Lightbulb, Clock } from "lucide-react"

interface QuestionDisplayProps {
  question: Question
  mode: GameMode
  questionNumber: number
  totalQuestions: number
  onAnswer: (answer: string[]) => void
  onNext: () => void
  showResult?: boolean
}

export function QuestionDisplay({
  question,
  mode,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  showResult = false,
}: QuestionDisplayProps) {
  const [userAnswers, setUserAnswers] = useState<string[]>(new Array(question.progression.chords.length).fill(""))
  const [showHint, setShowHint] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [isAnswered, setIsAnswered] = useState(false)
  const questionGenerator = new QuestionGenerator()

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isAnswered) {
        setTimeSpent((prev) => prev + 1)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isAnswered])

  useEffect(() => {
    // Reset state when question changes
    setUserAnswers(new Array(question.progression.chords.length).fill(""))
    setShowHint(false)
    setTimeSpent(0)
    setIsAnswered(false)
  }, [question.id, question.progression.chords.length])

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers]
    newAnswers[index] = value
    setUserAnswers(newAnswers)
  }

  const handleSubmit = () => {
    const filteredAnswers = userAnswers.filter((answer) => answer.trim() !== "")
    if (filteredAnswers.length === question.progression.chords.length) {
      setIsAnswered(true)
      onAnswer(userAnswers)
    }
  }

  const isComplete = userAnswers.every((answer) => answer.trim() !== "")
  const progress = (questionNumber / totalQuestions) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <Badge variant={mode === "absolute" ? "default" : "secondary"}>
              {mode === "absolute" ? "Absolute Mode" : "Transpose Mode"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-mono">{formatTime(timeSpent)}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Listen to the Chord Progression</span>
            {mode === "transpose" && (
              <Badge variant="secondary" className="text-sm">
                Key: {question.progression.key}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio Controls */}
          <AudioControls progression={question.progression} />

          {/* Answer Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Your Answer ({mode === "absolute" ? "Chord Names" : "Roman Numerals"}):
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowHint(!showHint)}>
                <Lightbulb className="h-4 w-4 mr-2" />
                {showHint ? "Hide Hint" : "Show Hint"}
              </Button>
            </div>

            {showHint && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">{questionGenerator.getHint(question, mode)}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {question.progression.chords.map((_, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Chord {index + 1}</label>
                  <Input
                    value={userAnswers[index]}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder={mode === "absolute" ? "e.g., Cmaj7" : "e.g., Imaj7"}
                    disabled={isAnswered}
                    className={
                      showResult && isAnswered
                        ? question.isCorrect
                          ? "border-green-500 bg-green-500/10"
                          : "border-red-500 bg-red-500/10"
                        : ""
                    }
                  />
                  {showResult && isAnswered && (
                    <div className="flex items-center gap-2 text-sm">
                      {questionGenerator.validateAnswer(
                        { ...question, correctAnswer: [question.correctAnswer[index]] },
                        [userAnswers[index]],
                        mode,
                      ) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-muted-foreground">Correct: {question.correctAnswer[index]}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div>
              {showResult && isAnswered && (
                <div className="flex items-center gap-2">
                  {question.isCorrect ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Correct!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Incorrect</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {!isAnswered ? (
                <Button onClick={handleSubmit} disabled={!isComplete} size="lg">
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={onNext} size="lg">
                  {questionNumber === totalQuestions ? "Finish" : "Next Question"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
