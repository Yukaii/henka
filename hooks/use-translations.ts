"use client"

import { useMemo } from "react"
import { useSettings } from "@/components/settings-provider"
import { DEFAULT_LANGUAGE, getMessages } from "@/lib/i18n"

export function useTranslations() {
  const { language } = useSettings()

  return useMemo(() => getMessages(language ?? DEFAULT_LANGUAGE), [language])
}
