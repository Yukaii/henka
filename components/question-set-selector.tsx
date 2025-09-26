"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QuestionGenerator, type QuestionSet } from "@/lib/question-generator"
import type { GameMode } from "@/lib/game-modes"
import { BookOpen, Shuffle, Clock } from "lucide-react"

interface QuestionSetSelectorProps {
  mode: GameMode
  difficulty: string
  onSetSelect: (questionSet: QuestionSet) => void
  onGenerateRandom: () => void
}

export function QuestionSetSelector({ mode, difficulty, onSetSelect, onGenerateRandom }: QuestionSetSelectorProps) {
  const questionGenerator = new QuestionGenerator()
  const presetSets = questionGenerator.getPresetQuestionSets(mode, difficulty)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Choose Your Question Set</h3>
        <p className="text-muted-foreground text-sm">
          Select a pre-made set or generate random questions for {mode} mode at {difficulty} difficulty
        </p>
      </div>

      {/* Generate Random Option */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shuffle className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Generate Random Questions</CardTitle>
                <CardDescription>Create a new set of random questions for practice</CardDescription>
              </div>
            </div>
            <Button onClick={onGenerateRandom} variant="default">
              Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>10 questions</span>
            </div>
            <Badge variant="outline">{difficulty}</Badge>
            <Badge variant={mode === "absolute" ? "default" : "secondary"}>{mode}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Preset Question Sets */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Preset Question Sets
        </h4>

        {presetSets.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No preset sets available for this combination.</p>
              <p className="text-sm text-muted-foreground mt-2">Try generating random questions instead.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {presetSets.map((set) => (
              <Card key={set.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{set.name}</CardTitle>
                      <CardDescription className="mt-1">{set.description}</CardDescription>
                    </div>
                    <Button onClick={() => onSetSelect(set)} variant="outline">
                      Select
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{set.questions.length} questions</span>
                    </div>
                    <Badge variant="outline">{set.difficulty}</Badge>
                    <Badge variant={set.mode === "absolute" ? "default" : "secondary"}>{set.mode}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
