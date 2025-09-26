"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AudioControls } from "./audio-controls"
import { ChordSelector } from "./chord-selector"
import type { Question, GameMode } from "@/lib/game-modes"
import { QuestionGenerator } from "@/lib/question-generator"
import { CheckCircle, XCircle, Lightbulb, Clock } from "lucide-react"

interface QuestionDisplayProps {
  question: Question
  mode: GameMode
  difficulty: string
  questionNumber: number
  totalQuestions: number
  onAnswer: (answer: string[]) => void
  onNext: () => void
  showResult?: boolean
}

export function QuestionDisplay({
  question,
  mode,
  difficulty,
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
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <Badge variant="outline">
            {questionNumber}/{totalQuestions}
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="font-mono text-xs">{formatTime(timeSpent)}</span>
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Listen & Answer</span>
            <Badge variant={mode === "absolute" ? "default" : "secondary"} className="text-xs">
              {mode === "absolute" ? "Names" : "Numerals"}
            </Badge>
          </CardTitle>
          {mode === "transpose" && (
            <Badge variant="outline" className="text-xs w-fit">
              Key: {question.progression.key}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Audio Controls */}
          <AudioControls progression={question.progression} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Select {mode === "absolute" ? "chord names" : "Roman numerals"}:</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowHint(!showHint)}>
                <Lightbulb className="h-3 w-3" />
              </Button>
            </div>

            {showHint && (
              <div className="bg-muted/50 p-3 rounded text-xs text-muted-foreground">
                {questionGenerator.getHint(question, mode)}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.progression.chords.map((_, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-xs text-muted-foreground font-medium">Chord #{index + 1}</label>
                  <ChordSelector
                    value={userAnswers[index]}
                    onChange={(value) => handleAnswerChange(index, value)}
                    mode={mode}
                    difficulty={difficulty}
                    disabled={isAnswered}
                    placeholder={mode === "absolute" ? "Select chord" : "Select numeral"}
                  />
                  {showResult && isAnswered && (
                    <div className="flex items-center gap-1 text-xs">
                      {questionGenerator.validateAnswer(
                        { ...question, correctAnswer: [question.correctAnswer[index]] },
                        [userAnswers[index]],
                        mode,
                      ) ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>Correct</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-3 w-3" />
                          <span className="text-muted-foreground">Answer: {question.correctAnswer[index]}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {showResult && isAnswered && (
              <div className="flex items-center gap-2">
                {question.isCorrect ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Correct!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Incorrect</span>
                  </div>
                )}
              </div>
            )}
            <div className="ml-auto">
              {!isAnswered ? (
                <Button onClick={handleSubmit} disabled={!isComplete} size="sm">
                  Submit
                </Button>
              ) : (
                <Button onClick={onNext} size="sm">
                  {questionNumber === totalQuestions ? "Finish" : "Next"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
