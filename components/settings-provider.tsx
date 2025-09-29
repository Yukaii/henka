"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { DEFAULT_INSTRUMENT_ID, isInstrumentId, type InstrumentId } from "@/lib/instruments"
import { DEFAULT_LANGUAGE, isSupportedLanguage, type SupportedLanguage } from "@/lib/i18n"
import {
  type CustomDifficultySettings,
  getCustomDifficultySettings,
  updateCustomDifficultySettings,
} from "@/lib/chord-generator"

type SettingsContextValue = {
  debugMode: boolean
  setDebugMode: (value: boolean) => void
  instrument: InstrumentId
  setInstrument: (value: InstrumentId) => void
  voiceLeading: boolean
  setVoiceLeading: (value: boolean) => void
  language: SupportedLanguage
  setLanguage: (value: SupportedLanguage) => void
  customDifficulty: CustomDifficultySettings
  setCustomDifficulty: (value: CustomDifficultySettings) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [debugMode, setDebugMode] = useState(false)
  const [instrument, setInstrumentState] = useState<InstrumentId>(DEFAULT_INSTRUMENT_ID)
  const [voiceLeading, setVoiceLeading] = useState(true)
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)
  const [customDifficulty, setCustomDifficultyState] = useState<CustomDifficultySettings>(() => getCustomDifficultySettings())

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
    const stored = window.localStorage.getItem("henka::customDifficulty")
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as CustomDifficultySettings
      const sanitized = updateCustomDifficultySettings({ ...getCustomDifficultySettings(), ...parsed })
      setCustomDifficultyState(sanitized)
    } catch {
      const fallback = updateCustomDifficultySettings(getCustomDifficultySettings())
      setCustomDifficultyState(fallback)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("henka::customDifficulty", JSON.stringify(customDifficulty))
  }, [customDifficulty])

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

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("henka::language")
    if (stored && isSupportedLanguage(stored)) {
      setLanguageState(stored)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("henka::language", language)
    document.documentElement.lang = language
  }, [language])

  const handleSetInstrument = useCallback((value: InstrumentId) => {
    setInstrumentState(value)
  }, [])

  const handleSetLanguage = useCallback((value: SupportedLanguage) => {
    setLanguageState(value)
  }, [])

  const handleSetCustomDifficulty = useCallback((value: CustomDifficultySettings) => {
    const sanitized = updateCustomDifficultySettings(value)
    setCustomDifficultyState(sanitized)
  }, [])

  const value = useMemo(
    () => ({
      debugMode,
      setDebugMode,
      instrument,
      setInstrument: handleSetInstrument,
      voiceLeading,
      setVoiceLeading,
      language,
      setLanguage: handleSetLanguage,
      customDifficulty,
      setCustomDifficulty: handleSetCustomDifficulty,
    }),
    [
      customDifficulty,
      debugMode,
      handleSetCustomDifficulty,
      handleSetInstrument,
      handleSetLanguage,
      instrument,
      language,
      voiceLeading,
    ],
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
