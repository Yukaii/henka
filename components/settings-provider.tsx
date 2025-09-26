"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

type SettingsContextValue = {
  debugMode: boolean
  setDebugMode: (value: boolean) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [debugMode, setDebugMode] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("henka::debugMode")
    if (stored !== null) {
      setDebugMode(stored === "true")
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("henka::debugMode", String(debugMode))
  }, [debugMode])

  const value = useMemo(
    () => ({
      debugMode,
      setDebugMode,
    }),
    [debugMode],
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
