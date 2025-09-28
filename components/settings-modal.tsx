"use client"

import { useTheme } from "next-themes"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/components/settings-provider"
import { useMemo } from "react"
import { INSTRUMENT_OPTIONS, isInstrumentId } from "@/lib/instruments"
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, isSupportedLanguage } from "@/lib/i18n"
import { useTranslations } from "@/hooks/use-translations"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { debugMode, setDebugMode, instrument, setInstrument, voiceLeading, setVoiceLeading, language, setLanguage } =
    useSettings()
  const t = useTranslations()

  const selectedInstrument = useMemo(
    () => INSTRUMENT_OPTIONS.find((option) => option.id === instrument),
    [instrument],
  )
  const selectedInstrumentLabel = selectedInstrument
    ? t.instruments?.[selectedInstrument.id]?.label ?? selectedInstrument.label
    : undefined

  const handleInstrumentChange = (value: string) => {
    if (isInstrumentId(value)) {
      setInstrument(value)
    }
  }

  const handleThemeChange = (value: string) => {
    setTheme(value)
  }

  const handleLanguageChange = (value: string) => {
    if (isSupportedLanguage(value)) {
      setLanguage(value)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">{t.settings.title}</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {t.settings.description}
        </DialogDescription>

        <div className="mt-4 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">{t.settings.languageLabel}</p>
                <p className="text-xs text-muted-foreground">{t.settings.languageDescription}</p>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t.settings.languageLabel}>
                    {LANGUAGE_LABELS[language]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {LANGUAGE_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">{t.settings.themeLabel}</p>
                <p className="text-xs text-muted-foreground">{t.settings.themeDescription}</p>
              </div>
              <Select value={theme ?? resolvedTheme ?? "system"} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t.settings.themeLabel} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">{t.settings.themeOptions.system}</SelectItem>
                  <SelectItem value="light">{t.settings.themeOptions.light}</SelectItem>
                  <SelectItem value="dark">{t.settings.themeOptions.dark}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="max-w-[60%]">
                <p className="font-medium text-sm">{t.settings.instrumentLabel}</p>
                <p className="text-xs text-muted-foreground">{t.settings.instrumentDescription}</p>
              </div>
              <Select value={instrument} onValueChange={handleInstrumentChange}>
                <SelectTrigger className="w-[220px] justify-between text-left">
                  <SelectValue placeholder={t.settings.instrumentLabel}>{selectedInstrumentLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[260px]">
                  {INSTRUMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <div className="flex flex-col gap-0.5">
                        <span>{t.instruments?.[option.id]?.label ?? option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {t.instruments?.[option.id]?.description ?? option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">{t.settings.voiceLeadingLabel}</p>
              <p className="text-xs text-muted-foreground">{t.settings.voiceLeadingDescription}</p>
            </div>
            <Switch
              checked={voiceLeading}
              onCheckedChange={setVoiceLeading}
              aria-label={t.settings.voiceLeadingLabel}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">{t.settings.debugLabel}</p>
              <p className="text-xs text-muted-foreground">{t.settings.debugDescription}</p>
            </div>
            <Switch checked={debugMode} onCheckedChange={setDebugMode} aria-label={t.settings.debugLabel} />
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {t.settings.closeButton}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
