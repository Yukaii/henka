"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  CIRCLE_OF_FIFTHS,
  DEFAULT_CHORD_TYPE,
  PLAYGROUND_VARIATIONS,
  type PlaygroundChordSelection,
  type PlaygroundMode,
} from "@/lib/playground"
import { formatAbsoluteLabel, formatRomanLabel } from "@/lib/playground"

const HOLD_DELAY = 130
const ROOT_RING_PERCENT = 34
const VARIATION_RING_PERCENT = 42

interface PlaygroundWheelProps {
  mode: PlaygroundMode
  keySignature: string
  selectedSelection: PlaygroundChordSelection | null
  onPreview: (selection: PlaygroundChordSelection | null) => void
  onCommit: (selection: PlaygroundChordSelection) => void
}

interface ActiveState {
  root: string
  variation: PlaygroundChordSelection
}

export function PlaygroundWheel({
  mode,
  keySignature,
  selectedSelection,
  onPreview,
  onCommit,
}: PlaygroundWheelProps) {
  const [activeState, setActiveState] = useState<ActiveState | null>(null)
  const [isOverlayOpen, setOverlayOpen] = useState(false)
  const [hoverVariation, setHoverVariation] = useState<PlaygroundChordSelection | null>(null)
  const holdTimerRef = useRef<number | null>(null)
  const latestPreviewRef = useRef<string | null>(null)

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  const closeOverlay = useCallback(() => {
    setOverlayOpen(false)
    setHoverVariation(null)
    setActiveState(null)
    clearHoldTimer()
    latestPreviewRef.current = null
    onPreview(null)
  }, [onPreview])

  const triggerPreview = useCallback(
    (selection: PlaygroundChordSelection | null) => {
      const key = selection ? `${selection.root}-${selection.chordType}` : null
      if (latestPreviewRef.current === key) return
      latestPreviewRef.current = key
      onPreview(selection)
    },
    [onPreview],
  )

  const commitSelection = useCallback(
    (selection: PlaygroundChordSelection) => {
      closeOverlay()
      onCommit(selection)
    },
    [closeOverlay, onCommit],
  )

  useEffect(() => {
    const handlePointerUp = () => {
      clearHoldTimer()
      if (!activeState) return

      const selection = hoverVariation ?? activeState.variation
      commitSelection(selection)
    }

    const handlePointerCancel = () => {
      clearHoldTimer()
      if (activeState) {
        closeOverlay()
      }
    }

    if (isOverlayOpen || holdTimerRef.current !== null) {
      window.addEventListener("pointerup", handlePointerUp)
      window.addEventListener("pointercancel", handlePointerCancel)
    }

    return () => {
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerCancel)
    }
  }, [activeState, closeOverlay, commitSelection, hoverVariation, isOverlayOpen])

  const handleRootPointerDown = (root: string) => {
    clearHoldTimer()
    holdTimerRef.current = window.setTimeout(() => {
      const defaultSelection: PlaygroundChordSelection = { root, chordType: DEFAULT_CHORD_TYPE }
      setActiveState({ root, variation: defaultSelection })
      setOverlayOpen(true)
      setHoverVariation(null)
      triggerPreview(defaultSelection)
    }, HOLD_DELAY)
  }

  const handleRootTap = (root: string) => {
    clearHoldTimer()
    const selection: PlaygroundChordSelection = { root, chordType: DEFAULT_CHORD_TYPE }
    commitSelection(selection)
  }

  const handleRootPointerUp = (root: string) => {
    if (holdTimerRef.current !== null) {
      handleRootTap(root)
    }
  }

  const handleRootPointerLeave = () => {
    if (!isOverlayOpen) {
      clearHoldTimer()
    }
  }

  useEffect(() => () => clearHoldTimer(), [])

  const renderRootLabel = (root: string) => {
    const defaultSelection: PlaygroundChordSelection = { root, chordType: DEFAULT_CHORD_TYPE }
    const roman = formatRomanLabel(defaultSelection, keySignature)
    if (mode === "transpose") {
      return (
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold">{roman}</span>
          <span className="text-xs text-muted-foreground">{root}</span>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center">
        <span className="text-lg font-semibold">{root}</span>
        <span className="text-xs text-muted-foreground">{roman}</span>
      </div>
    )
  }

  const renderVariationLabel = (selection: PlaygroundChordSelection) => {
    if (mode === "transpose") {
      return formatRomanLabel(selection, keySignature)
    }
    return formatAbsoluteLabel(selection)
  }

  return (
    <div className="mx-auto flex aspect-square w-full max-w-xs items-center justify-center sm:max-w-sm lg:max-w-md">
      <div className="relative h-full w-full">
        {CIRCLE_OF_FIFTHS.map((root, index) => {
          const angle = (index / CIRCLE_OF_FIFTHS.length) * 360
          const angleRad = ((angle - 90) * Math.PI) / 180
          const x = 50 + Math.cos(angleRad) * ROOT_RING_PERCENT
          const y = 50 + Math.sin(angleRad) * ROOT_RING_PERCENT
          const isSelected = selectedSelection?.root === root

          return (
            <button
              key={root}
              className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full border border-border/60 bg-background/90 text-center text-xs font-medium transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-14 sm:w-14 sm:text-sm lg:h-16 lg:w-16 ${
                isSelected ? "border-primary text-primary shadow" : ""
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onPointerDown={() => handleRootPointerDown(root)}
              onPointerUp={() => handleRootPointerUp(root)}
              onPointerLeave={handleRootPointerLeave}
              onPointerCancel={handleRootPointerLeave}
              type="button"
            >
              {renderRootLabel(root)}
            </button>
          )
        })}

        {isOverlayOpen && activeState && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="relative flex h-[62%] w-[62%] items-center justify-center rounded-full border border-primary/40 bg-background/95 shadow-xl sm:h-[64%] sm:w-[64%] lg:h-[66%] lg:w-[66%]"
              onPointerLeave={() => {
                setHoverVariation(null)
                triggerPreview(activeState.variation)
              }}
            >
              <button
                type="button"
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 text-xs font-medium transition-colors sm:h-14 sm:w-14 sm:text-sm lg:h-16 lg:w-16 ${
                  !hoverVariation ? "bg-primary/10 text-primary" : "bg-background"
                }`}
                onPointerEnter={() => {
                  setHoverVariation(null)
                  triggerPreview(activeState.variation)
                }}
              >
                {renderVariationLabel(activeState.variation)}
              </button>

              {PLAYGROUND_VARIATIONS.filter((variation) => variation.chordType !== DEFAULT_CHORD_TYPE).map(
                (variation, index) => {
                  const angle = (index / 7) * 360
                  const angleRad = ((angle - 90) * Math.PI) / 180
                  const x = 50 + Math.cos(angleRad) * VARIATION_RING_PERCENT
                  const y = 50 + Math.sin(angleRad) * VARIATION_RING_PERCENT
                  const selection: PlaygroundChordSelection = {
                    root: activeState.root,
                    chordType: variation.chordType,
                  }
                  const isActive = hoverVariation?.chordType === variation.chordType
                  const matchesSelection =
                    selectedSelection?.root === activeState.root &&
                    selectedSelection?.chordType === variation.chordType

                  return (
                    <button
                      key={variation.id}
                      type="button"
                      className={`absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full border text-[0.7rem] font-medium transition-all hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-12 sm:w-12 sm:text-xs lg:h-14 lg:w-14 lg:text-sm ${
                        isActive ? "border-primary text-primary shadow" : "border-border/60"
                      } ${matchesSelection ? "bg-primary/10" : "bg-background"}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onPointerEnter={() => {
                        setHoverVariation(selection)
                        triggerPreview(selection)
                      }}
                    >
                      {renderVariationLabel(selection)}
                    </button>
                  )
                },
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
