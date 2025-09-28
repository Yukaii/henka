"use client"
import { useRouter } from "next/navigation"
import { Music, Target, Headphones, PlayCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WELCOME_SEEN_KEY } from "@/lib/storage-keys"

export default function WelcomePage() {
  const router = useRouter()

  const handleEnterTrainer = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WELCOME_SEEN_KEY, "true")
    }
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-lg font-semibold">
            <div className="rounded-full bg-primary/10 p-2">
              <Music className="h-6 w-6 text-primary" />
            </div>
            Henka Chord Trainer
          </div>
          <Button variant="ghost" size="sm" onClick={handleEnterTrainer}>
            Skip to trainer
          </Button>
        </header>

        <main className="space-y-8">
          <div className="space-y-5 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Train your ear like a session musician
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed text-pretty">
              Henka guides you through chord recognition drills that adapt to your goals. Choose your practice language—
              Roman numerals or absolute chord names—and grow from simple triads to extended harmony.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={handleEnterTrainer} className="gap-2">
                <PlayCircle className="h-5 w-5" /> Enter trainer
              </Button>
              <Button variant="ghost" size="lg" onClick={handleEnterTrainer}>
                I already know the flow
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Headphones className="h-4 w-4 text-primary" />
                  Focused listening
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Hear rich, voice-led progressions rendered with realistic instruments so every interval stands out.
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Target className="h-4 w-4 text-primary" />
                  Adaptive difficulty
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Start with friendly triads, then unlock seventh and extended chords as your accuracy and speed improve.
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Music className="h-4 w-4 text-primary" />
                  Musical feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Review correct answers, inversion usage, and key distributions to pinpoint what to practice next.
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="mt-auto text-center text-xs text-muted-foreground">
          You can revisit this introduction anytime from the trainer navigation.
        </footer>
      </div>
    </div>
  )
}
