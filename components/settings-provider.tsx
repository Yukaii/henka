"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { DEFAULT_INSTRUMENT_ID, isInstrumentId, type InstrumentId } from "@/lib/instruments"

type SettingsContextValue = {
  debugMode: boolean
  setDebugMode: (value: boolean) => void
  instrument: InstrumentId
  setInstrument: (value: InstrumentId) => void
  voiceLeading: boolean
  setVoiceLeading: (value: boolean) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [debugMode, setDebugMode] = useState(false)
  const [instrument, setInstrumentState] = useState<InstrumentId>(DEFAULT_INSTRUMENT_ID)
  const [voiceLeading, setVoiceLeading] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("henka::debugMode")
    if (stored !== null) {
      setDebugMode(stored === "true")
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("henka::voiceLeading")
    if (stored !== null) {
      setVoiceLeading(stored !== "false")
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("henka::debugMode", String(debugMode))
  }, [debugMode])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("henka::voiceLeading", String(voiceLeading))
  }, [voiceLeading])

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("henka::instrument")
    if (stored && isInstrumentId(stored)) {
      setInstrumentState(stored)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("henka::instrument", instrument)
  }, [instrument])

  const handleSetInstrument = useCallback((value: InstrumentId) => {
    setInstrumentState(value)
  }, [])

  const value = useMemo(
    () => ({
      debugMode,
      setDebugMode,
      instrument,
      setInstrument: handleSetInstrument,
      voiceLeading,
      setVoiceLeading,
    }),
    [debugMode, handleSetInstrument, instrument, voiceLeading],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
