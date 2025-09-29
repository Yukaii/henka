"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"
import {
  formatAbsoluteLabel,
  formatRomanLabel,
  type PlaygroundMode,
  type PlaygroundSlot,
} from "@/lib/playground"
import { ChevronLeft, ChevronRight, Play, Plus, Trash2 } from "lucide-react"

interface PlaygroundTimelineProps {
  mode: PlaygroundMode
  keySignature: string
  slots: PlaygroundSlot[]
  selectedIndex: number
  activeIndex: number | null
  onSelect: (index: number) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onMove: (index: number, direction: "left" | "right") => void
}

export function PlaygroundTimeline({
  mode,
  keySignature,
  slots,
  selectedIndex,
  activeIndex,
  onSelect,
  onAdd,
  onRemove,
  onMove,
}: PlaygroundTimelineProps) {
  const t = useTranslations()
  const isSingleSlot = slots.length <= 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t.playground?.sequenceHeading ?? "Chord Sequence"}
        </h3>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" /> {t.playground?.addSlot ?? "Add Slot"}
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {slots.map((slot, index) => {
          const isSelected = index === selectedIndex
          const isActive = index === activeIndex
          const label = slot.selection
            ? mode === "transpose"
              ? formatRomanLabel(slot.selection, keySignature)
              : formatAbsoluteLabel(slot.selection)
            : t.playground?.emptySlotLabel ?? "Empty"
          const secondary = slot.selection
            ? mode === "transpose"
              ? formatAbsoluteLabel(slot.selection)
              : formatRomanLabel(slot.selection, keySignature)
            : t.playground?.assignPrompt ?? "Tap a chord to assign"

          return (
            <div
              key={slot.id}
              className={`flex w-48 min-w-[12rem] flex-col rounded-lg border bg-muted/20 p-3 transition-all ${
                isSelected ? "ring-2 ring-primary" : "border-border/60"
              } ${isActive ? "border-primary" : ""}`}
            >
              <button
                type="button"
                onClick={() => onSelect(index)}
                className="flex flex-1 flex-col items-start text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    {label}
                  </span>
                  {isActive && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <Play className="h-3 w-3" /> {t.playground?.nowPlaying ?? "Now"}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-xs text-muted-foreground">{secondary}</span>
              </button>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={index === 0}
                    onClick={() => onMove(index, "left")}
                    aria-label={t.playground?.moveLeft ?? "Move left"}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={index === slots.length - 1}
                    onClick={() => onMove(index, "right")}
                    aria-label={t.playground?.moveRight ?? "Move right"}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={isSingleSlot}
                  onClick={() => onRemove(index)}
                  aria-label={t.playground?.removeSlot ?? "Remove slot"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
