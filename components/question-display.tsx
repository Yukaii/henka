"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AudioControls } from "./audio-controls"
import { ChordSelector } from "./chord-selector"
import type { Question, GameMode } from "@/lib/game-modes"
import { QuestionGenerator } from "@/lib/question-generator"
import { useSettings } from "@/components/settings-provider"
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
  const { debugMode } = useSettings()

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
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const midiToNote = (midi: number) => {
    const pitchClasses = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    if (!Number.isFinite(midi)) return "?"
    const octave = Math.floor(midi / 12) - 1
    const pc = pitchClasses[midi % 12]
    return `${pc}${octave}`
  }

  const actionLabel = !isAnswered ? "Submit" : questionNumber === totalQuestions ? "Finish" : "Next"
  const actionDisabled = !isAnswered ? !isComplete : false
  const actionHandler = !isAnswered ? handleSubmit : onNext

  return (
    <div className="space-y-4 pb-28">
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
          <div className="sticky top-[4.5rem] z-20 -mx-6 -mt-4 bg-card/95 px-6 py-4 shadow-sm ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:rounded-xl">
            <AudioControls progression={question.progression} />
          </div>

          {debugMode && (
            <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 p-3 text-xs">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Debug Info</p>
                <span className="text-muted-foreground">Key: {question.progression.key}</span>
              </div>
              <div className="mt-2 space-y-3">
                {question.progression.chords.map((chord, index) => {
                  const answer = question.correctAnswer[index]
                  const noteNames = chord.notes.map(midiToNote).join(", ")
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">Chord #{index + 1}</p>
                        <span className="text-muted-foreground">Answer: {answer || "?"}</span>
                      </div>
                      <p className="text-muted-foreground">
                        {chord.name}
                        {chord.romanNumeral ? ` (${chord.romanNumeral})` : ""}
                      </p>
                      <p className="font-mono text-muted-foreground">Notes: {noteNames}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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

          {showResult && isAnswered && (
            <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm">
              {question.isCorrect ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Correct!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">Incorrect</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <div className="w-full max-w-md">
          <Button
            onClick={actionHandler}
            disabled={actionDisabled}
            size="lg"
            className="pointer-events-auto w-full"
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
