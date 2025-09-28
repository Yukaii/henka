"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react"
import { AudioEngine, type ChordProgression } from "@/lib/audio-engine"
import { useSettings } from "@/components/settings-provider"
import { useTranslations } from "@/hooks/use-translations"

interface AudioControlsProps {
  progression: ChordProgression | null
  onPlay?: () => void
  onStop?: () => void
}

export function AudioControls({ progression, onPlay, onStop }: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioEngine] = useState(() => new AudioEngine())
  const { instrument } = useSettings()
  const t = useTranslations()

  useEffect(() => {
    return () => {
      audioEngine.dispose()
    }
  }, [audioEngine])

  useEffect(() => {
    audioEngine.setInstrument(instrument)
  }, [audioEngine, instrument])

  const handlePlay = async () => {
    if (!progression) return

    setIsPlaying(true)
    onPlay?.()

    try {
      await audioEngine.playProgression(progression)
    } catch (error) {
      console.error("Error playing progression:", error)
    } finally {
      setIsPlaying(false)
      onStop?.()
    }
  }

  const handleStop = () => {
    audioEngine.stop()
    setIsPlaying(false)
    onStop?.()
  }

  return (
    <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
      <Button
        onClick={isPlaying ? handleStop : handlePlay}
        disabled={!progression}
        size="lg"
        className="bg-primary hover:bg-primary/90"
      >
        {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
        {isPlaying ? t.audio.stop : t.audio.play}
      </Button>

      <Button onClick={handlePlay} disabled={!progression || isPlaying} variant="outline" size="lg">
        <RotateCcw className="h-4 w-4 mr-2" />
        {t.audio.replay}
      </Button>

      <div className="flex items-center gap-2 text-muted-foreground">
        <Volume2 className="h-4 w-4" />
        <span className="text-sm">
          {progression ? t.audio.chordCount(progression.chords.length) : t.audio.noProgression}
        </span>
      </div>
    </div>
  )
}
