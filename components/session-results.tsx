"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { GameSession, GameMode } from "@/lib/game-modes"
import { Trophy, Target, Clock, RotateCcw, Home, TrendingUp } from "lucide-react"

interface SessionResultsProps {
  session: GameSession | null
  onRestart: () => void
  onExit: () => void
  mode: GameMode
  difficulty: string
}

export function SessionResults({ session, onRestart, onExit, mode, difficulty }: SessionResultsProps) {
  if (!session) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>No session data available</p>
        </CardContent>
      </Card>
    )
  }

  const accuracy = (session.score / session.totalQuestions) * 100
  const totalTime =
    session.endTime && session.startTime
      ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)
      : 0
  const averageTime = totalTime / session.totalQuestions

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: "Excellent", color: "text-green-500", bgColor: "bg-green-500/10" }
    if (accuracy >= 75) return { level: "Good", color: "text-blue-500", bgColor: "bg-blue-500/10" }
    if (accuracy >= 60) return { level: "Fair", color: "text-yellow-500", bgColor: "bg-yellow-500/10" }
    return { level: "Needs Practice", color: "text-red-500", bgColor: "bg-red-500/10" }
  }

  const performance = getPerformanceLevel(accuracy)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className={`p-4 rounded-full ${performance.bgColor}`}>
            <Trophy className={`h-8 w-8 ${performance.color}`} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-balance">Training Session Complete!</h2>
        <p className="text-muted-foreground">
          You completed {session.totalQuestions} questions in {mode} mode at {difficulty} difficulty
        </p>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Accuracy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{accuracy.toFixed(1)}%</span>
                <Badge className={`${performance.bgColor} ${performance.color} border-0`}>{performance.level}</Badge>
              </div>
            </div>
            <Progress value={accuracy} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {session.score} correct out of {session.totalQuestions} questions
            </p>
          </div>

          {/* Timing */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Total Time</span>
              </div>
              <p className="text-xl font-bold">{formatTime(totalTime)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Average per Question</span>
              </div>
              <p className="text-xl font-bold">{formatTime(averageTime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Question Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {session.questions.map((question, index) => (
              <div key={question.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Q{index + 1}</span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{question.correctAnswer.join(" - ")}</p>
                    {question.userAnswer && (
                      <p className="text-xs text-muted-foreground">Your answer: {question.userAnswer.join(" - ")}</p>
                    )}
                  </div>
                </div>
                <Badge variant={question.isCorrect ? "default" : "destructive"}>
                  {question.isCorrect ? "Correct" : "Incorrect"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onRestart} size="lg" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
        <Button onClick={onExit} variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
          <Home className="h-4 w-4" />
          Back to Menu
        </Button>
      </div>

      {/* Tips for Improvement */}
      {accuracy < 75 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-yellow-600">Tips for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Practice identifying chord qualities (major, minor, dominant 7th)</li>
              <li>• Listen to the bass line to identify root movement</li>
              <li>• Start with simpler progressions and gradually increase difficulty</li>
              <li>• Use the hint feature to learn common progression patterns</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
