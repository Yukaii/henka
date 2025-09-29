"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PlaygroundWheel } from "@/components/playground/playground-wheel"
import { PlaygroundTimeline } from "@/components/playground/playground-timeline"
import {
  CIRCLE_OF_FIFTHS,
  DEFAULT_PLAYGROUND_KEY,
  DEFAULT_PLAYGROUND_MODE,
  DEFAULT_PLAYGROUND_TEMPO,
  clampSlots,
  createChord,
  createEmptySlot,
  createSlotsFromSnapshot,
  formatAbsoluteLabel,
  formatRomanLabel,
  loadPlaygroundState,
  loadSavedSets,
  normalizeKeySignature,
  savePlaygroundState,
  saveSavedSets,
  serializeSlots,
  type PlaygroundChordSelection,
  type PlaygroundMode,
  type PlaygroundSaveSlot,
  type PlaygroundSlot,
} from "@/lib/playground"
import { AudioEngine, type Chord } from "@/lib/audio-engine"
import { ChordGenerator } from "@/lib/chord-generator"
import { useSettings } from "@/components/settings-provider"
import { useTranslations } from "@/hooks/use-translations"
import Link from "next/link"
import { PauseCircle, PlayCircle, Save, Upload, X, SlidersHorizontal } from "lucide-react"

const SAVE_SLOT_COUNT = 4
const MIN_TEMPO = 60
const MAX_TEMPO = 180

function createDefaultSaveSlot(index: number): PlaygroundSaveSlot {
  return {
    id: `playground-slot-${index}`,
    name: `Slot ${index + 1}`,
    slots: [],
    updatedAt: 0,
  }
}

function ensureSaveSlots(slots: PlaygroundSaveSlot[]): PlaygroundSaveSlot[] {
  const next = [...slots]
  while (next.length < SAVE_SLOT_COUNT) {
    next.push(createDefaultSaveSlot(next.length))
  }
  return next.slice(0, SAVE_SLOT_COUNT)
}

function formatTimestamp(value: number, locale: string): string {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value))
  } catch {
    return new Date(value).toLocaleString()
  }
}

export function PlaygroundView() {
  const t = useTranslations()
  const { instrument, language, voiceLeading, setVoiceLeading } = useSettings()
  const [mode, setMode] = useState<PlaygroundMode>(DEFAULT_PLAYGROUND_MODE)
  const [keySignature, setKeySignature] = useState<string>(DEFAULT_PLAYGROUND_KEY)
  const [slots, setSlots] = useState<PlaygroundSlot[]>(() => clampSlots([createEmptySlot(), createEmptySlot()]))
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isLooping, setIsLooping] = useState(false)
  const [savedSets, setSavedSets] = useState<PlaygroundSaveSlot[]>([])
  const [tempo, setTempo] = useState<number>(DEFAULT_PLAYGROUND_TEMPO)
  const [controlsOpen, setControlsOpen] = useState(false)
  const [voiceLeadingEnabled, setVoiceLeadingEnabled] = useState<boolean>(voiceLeading)

  const audioEngineRef = useRef(new AudioEngine())
  const chordGeneratorRef = useRef(new ChordGenerator())
  const slotsRef = useRef<PlaygroundSlot[]>(slots)
  const selectedIndexRef = useRef(selectedIndex)
  const handleVoiceLeadingChange = useCallback(
    (value: boolean) => {
      setVoiceLeadingEnabled(value)
      setVoiceLeading(value)
    },
    [setVoiceLeading],
  )

  const getChordDuration = useCallback(() => Math.max(0.6, 240 / Math.max(MIN_TEMPO, Math.min(MAX_TEMPO, tempo))), [tempo])

  useEffect(() => {
    slotsRef.current = slots
  }, [slots])

  useEffect(() => {
    selectedIndexRef.current = selectedIndex
  }, [selectedIndex])

  useEffect(() => {
    setVoiceLeadingEnabled(voiceLeading)
  }, [voiceLeading])

  useEffect(() => {
    const engine = audioEngineRef.current
    const storedState = loadPlaygroundState()
    if (storedState) {
      setMode(storedState.mode ?? DEFAULT_PLAYGROUND_MODE)
      setKeySignature(normalizeKeySignature(storedState.key))
      const restoredSlots = clampSlots(createSlotsFromSnapshot(storedState.slots))
      setSlots(restoredSlots)
      setTempo(storedState.tempo ?? DEFAULT_PLAYGROUND_TEMPO)
      if (typeof storedState.voiceLeading === "boolean") {
        handleVoiceLeadingChange(storedState.voiceLeading)
      }
      setSelectedIndex(0)
    }

    const storedSaves = ensureSaveSlots(loadSavedSets())
    setSavedSets(storedSaves)

    return () => {
      engine.dispose()
    }
  }, [handleVoiceLeadingChange])

  useEffect(() => {
    audioEngineRef.current.setInstrument(instrument)
  }, [instrument])

  useEffect(() => {
    savePlaygroundState({
      mode,
      key: keySignature,
      slots: serializeSlots(slots),
      tempo,
      voiceLeading: voiceLeadingEnabled,
    })
  }, [keySignature, mode, slots, tempo, voiceLeadingEnabled])

  useEffect(() => {
    saveSavedSets(savedSets)
  }, [savedSets])

  const handlePreview = useCallback(
    (selection: PlaygroundChordSelection | null) => {
      if (!selection) {
        audioEngineRef.current.stop(true)
        return
      }

      if (isLooping) {
        setIsLooping(false)
      }

      const chord = createChord(chordGeneratorRef.current, selection, {
        voiceLeading: voiceLeadingEnabled,
      })
      const previewDuration = Math.min(3.5, Math.max(1, getChordDuration()))
      void audioEngineRef.current.playChord(chord, previewDuration)
    },
    [getChordDuration, isLooping, voiceLeadingEnabled],
  )

  const handleCommit = useCallback((selection: PlaygroundChordSelection) => {
    let nextIndex = 0
    setSlots((prev) => {
      if (!prev.length) {
        nextIndex = 0
        return [{ ...createEmptySlot(), selection }]
      }
      const targetIndex = Math.min(selectedIndexRef.current, prev.length - 1)
      const next = prev.map((slot, idx) => (idx === targetIndex ? { ...slot, selection } : slot))
      nextIndex = Math.min(targetIndex + 1, next.length - 1)
      return next
    })
    setSelectedIndex(nextIndex)
  }, [])

  const handleAddSlot = useCallback(() => {
    setSlots((prev) => [...prev, createEmptySlot()])
    setSelectedIndex(slots.length)
  }, [slots.length])

  const handleRemoveSlot = useCallback(
    (index: number) => {
      if (slots.length <= 1) return
      setSlots((prev) => {
        if (prev.length <= 1) return prev
        const next = prev.filter((_, idx) => idx !== index)
        return clampSlots(next)
      })
      setSelectedIndex((prevIndex) => {
        if (prevIndex > index) return prevIndex - 1
        const newLength = Math.max(slots.length - 1, 1)
        return Math.min(prevIndex, newLength - 1)
      })
    },
    [slots.length],
  )

  const handleMoveSlot = useCallback((index: number, direction: "left" | "right") => {
    setSlots((prev) => {
      const target = direction === "left" ? index - 1 : index + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      const [removed] = next.splice(index, 1)
      next.splice(target, 0, removed)
      return next
    })
    setSelectedIndex((prevIndex) => {
      if (prevIndex === index) {
        return direction === "left" ? Math.max(0, index - 1) : Math.min(slots.length - 1, index + 1)
      }
      if (direction === "left" && prevIndex === index - 1) {
        return prevIndex + 1
      }
      if (direction === "right" && prevIndex === index + 1) {
        return prevIndex - 1
      }
      return prevIndex
    })
  }, [slots.length])

  const handleSelectSlot = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  useEffect(() => {
    if (!isLooping) {
      audioEngineRef.current.stop(true)
      setActiveIndex(null)
      return
    }

    let cancelled = false
    const engine = audioEngineRef.current
    const generator = chordGeneratorRef.current
    let carriedChord: Chord | null = null

    const playLoop = async () => {
      while (!cancelled) {
        const filledSlots = slotsRef.current.filter((slot) => slot.selection)
        if (!filledSlots.length) {
          carriedChord = null
          await new Promise((resolve) => setTimeout(resolve, 400))
          continue
        }

        let previousChord: Chord | null = voiceLeadingEnabled ? carriedChord : null

        for (const slot of filledSlots) {
          if (cancelled) break
          const selection = slot.selection!
          const visualIndex = slotsRef.current.findIndex((current) => current.id === slot.id)
          setActiveIndex(visualIndex >= 0 ? visualIndex : null)
          const chord = createChord(generator, selection, {
            voiceLeading: voiceLeadingEnabled,
            previous: voiceLeadingEnabled ? previousChord : null,
          })
          const duration = getChordDuration()
          try {
            await engine.playChord(chord, duration)
          } catch (error) {
            console.error("Playground loop error", error)
          }
          previousChord = voiceLeadingEnabled ? chord : null
        }

        carriedChord = voiceLeadingEnabled ? previousChord : null
      }
    }

    playLoop().catch((error) => console.error("Playground loop failure", error))

    return () => {
      cancelled = true
      engine.stop(true)
    }
  }, [getChordDuration, isLooping, voiceLeadingEnabled])

  const handleToggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev)
  }, [])

  const handleSaveSet = useCallback(
    (index: number) => {
      if (index < 0 || index >= SAVE_SLOT_COUNT) return
      const nameSuggestion = savedSets[index]?.name ?? `Slot ${index + 1}`
      let nextName = nameSuggestion
      if (typeof window !== "undefined") {
        const input = window.prompt(t.playground?.savePrompt ?? "Save slot as", nameSuggestion)
        if (input && input.trim().length > 0) {
          nextName = input.trim()
        }
      }
      setSavedSets((prev) => {
        const next = ensureSaveSlots(prev)
        next[index] = {
          ...next[index],
          name: nextName,
          slots: serializeSlots(slots),
          updatedAt: Date.now(),
        }
        return [...next]
      })
    },
    [savedSets, slots, t.playground?.savePrompt],
  )

  const handleLoadSet = useCallback(
    (index: number) => {
      const slot = savedSets[index]
      if (!slot || !slot.slots.length) return
      setSlots(clampSlots(createSlotsFromSnapshot(slot.slots)))
      setSelectedIndex(0)
      setIsLooping(false)
    },
    [savedSets],
  )

  const handleClearSet = useCallback((index: number) => {
    setSavedSets((prev) => {
      const next = ensureSaveSlots(prev)
      next[index] = createDefaultSaveSlot(index)
      return [...next]
    })
  }, [])

  const currentSelection = slots[selectedIndex]?.selection ?? null

  const modeLabel = useMemo(() => {
    switch (mode) {
      case "absolute":
        return t.playground?.modeAbsolute ?? "Absolute"
      case "transpose":
        return t.playground?.modeTranspose ?? "Transpose"
      default:
        return mode
    }
  }, [mode, t.playground?.modeAbsolute, t.playground?.modeTranspose])

  const modeControls = (
    <div className="space-y-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t.playground?.modeLabel ?? "Selection Mode"}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "absolute" ? "default" : "outline"}
          onClick={() => setMode("absolute")}
        >
          {t.playground?.modeAbsolute ?? "Absolute"}
        </Button>
        <Button
          type="button"
          variant={mode === "transpose" ? "default" : "outline"}
          onClick={() => setMode("transpose")}
        >
          {t.playground?.modeTranspose ?? "Transpose"}
        </Button>
      </div>
    </div>
  )

  const keyControls = (
    <div className="space-y-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t.playground?.keyLabel ?? "Key"}
      </span>
      <Select value={keySignature} onValueChange={setKeySignature}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CIRCLE_OF_FIFTHS.map((key) => (
            <SelectItem key={key} value={key}>
              {key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const tempoControls = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t.playground?.tempoLabel ?? "Tempo"}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{tempo} BPM</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={MIN_TEMPO}
          max={MAX_TEMPO}
          value={tempo}
          onChange={(event) => setTempo(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted"
          aria-label={t.playground?.tempoLabel ?? "Tempo"}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {t.playground?.tempoHint ?? "Each chord holds for a full bar."}
      </p>
    </div>
  )

  const voiceLeadingControls = (
    <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t.playground?.voiceLeadingLabel ?? "Auto Voice Leading"}
          </span>
          <p className="text-xs text-muted-foreground">
            {t.playground?.voiceLeadingHint ?? "Smooth transitions by revoicing chords automatically."}
          </p>
        </div>
        <Switch
          checked={voiceLeadingEnabled}
          onCheckedChange={handleVoiceLeadingChange}
          aria-label={t.playground?.voiceLeadingLabel ?? "Auto Voice Leading"}
        />
      </div>
    </div>
  )

  const controlPanel = (
    <div className="space-y-5">
      {modeControls}
      {keyControls}
      {tempoControls}
      {voiceLeadingControls}
    </div>
  )

  return (
    <>
      <div className="space-y-6 sm:space-y-10">
      <div className="space-y-5 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lg sm:space-y-6 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <Link href="/">
                <span className="sr-only">{t.home?.menuStart ?? "Home"}</span>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {t.playground?.title ?? "Playground"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t.playground?.subtitle ?? "Build and loop custom chord collections."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Button onClick={handleToggleLoop} size="lg" variant={isLooping ? "destructive" : "default"}>
              {isLooping ? (
                <>
                  <PauseCircle className="mr-2 h-5 w-5" />
                  {t.playground?.stopLoop ?? "Stop Loop"}
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {t.playground?.startLoop ?? "Start Loop"}
                </>
              )}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="md:hidden"
              onClick={() => setControlsOpen(true)}
            >
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              {t.playground?.controlsButton ?? "Controls"}
            </Button>
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {modeControls}
          {keyControls}
          {tempoControls}
          {voiceLeadingControls}
        </div>
      </div>

      <PlaygroundWheel
        mode={mode}
        keySignature={keySignature}
        selectedSelection={currentSelection}
        onPreview={handlePreview}
        onCommit={handleCommit}
      />

      <PlaygroundTimeline
        mode={mode}
        keySignature={keySignature}
        slots={slots}
        selectedIndex={selectedIndex}
        activeIndex={activeIndex}
        onSelect={handleSelectSlot}
        onAdd={handleAddSlot}
        onRemove={handleRemoveSlot}
        onMove={handleMoveSlot}
      />

      <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t.playground?.savedSetsLabel ?? "Saved Sets"}
          </h2>
          <span className="text-xs text-muted-foreground">
            {t.playground?.saveHint ?? "Save your chord lists locally."}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {ensureSaveSlots(savedSets).map((slot, index) => {
            const assignedCount = slot.slots.filter((entry) => entry.selection).length
            const slotSummary =
              assignedCount > 0
                ? t.playground?.chordCount?.(assignedCount) ?? `${assignedCount} chords`
                : t.playground?.emptySave ?? "Empty slot"

            return (
              <div key={slot.id} className="flex flex-col justify-between rounded-xl border border-border/60 bg-background/90 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {slot.name || `Slot ${index + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{slotSummary}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(slot.updatedAt, language ?? "en")}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={() => handleSaveSet(index)}>
                    <Save className="mr-2 h-4 w-4" />
                    {t.playground?.saveAction ?? "Save"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={assignedCount === 0}
                    onClick={() => handleLoadSet(index)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t.playground?.loadAction ?? "Load"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={assignedCount === 0}
                    onClick={() => handleClearSet(index)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t.playground?.clearAction ?? "Clear"}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {currentSelection && (
        <div className="rounded-2xl border border-border/60 bg-background/95 p-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t.playground?.currentSlotLabel ?? "Selected Slot"}
            </span>
            <span className="font-medium text-foreground">
              {mode === "transpose"
                ? formatRomanLabel(currentSelection, keySignature)
                : formatAbsoluteLabel(currentSelection)}
            </span>
            <span className="text-xs text-muted-foreground">
              {mode === "transpose"
                ? formatAbsoluteLabel(currentSelection)
                : formatRomanLabel(currentSelection, keySignature)}
            </span>
            <span className="text-xs text-muted-foreground">
              {t.playground?.modeIndicator ?? "Mode:"} {modeLabel}
            </span>
          </div>
        </div>
      )}
      <Dialog open={controlsOpen} onOpenChange={setControlsOpen}>
        <DialogContent className="bottom-0 top-auto left-1/2 w-full max-w-lg -translate-x-1/2 translate-y-0 rounded-t-3xl border bg-background p-6 pb-8 shadow-lg sm:bottom-auto sm:top-1/2 sm:max-w-md sm:-translate-y-1/2 sm:rounded-lg">
          <DialogTitle>{t.playground?.controlsButton ?? "Controls"}</DialogTitle>
          <div className="mt-4 space-y-5">{controlPanel}</div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}
