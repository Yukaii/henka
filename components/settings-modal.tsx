"use client"

import { useTheme } from "next-themes"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/components/settings-provider"
import { INSTRUMENT_OPTIONS, isInstrumentId } from "@/lib/instruments"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { debugMode, setDebugMode, instrument, setInstrument } = useSettings()

  const handleInstrumentChange = (value: string) => {
    if (isInstrumentId(value)) {
      setInstrument(value)
    }
  }

  const handleThemeChange = (value: string) => {
    setTheme(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Tune the app appearance and enable developer helpers.
        </DialogDescription>

        <div className="mt-4 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Theme</p>
                <p className="text-xs text-muted-foreground">Switch between light, dark, or system preference.</p>
              </div>
              <Select value={theme ?? resolvedTheme ?? "system"} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="max-w-[60%]">
                <p className="font-medium text-sm">Instrument</p>
                <p className="text-xs text-muted-foreground">Choose the playback timbre for chord practice.</p>
              </div>
              <Select value={instrument} onValueChange={handleInstrumentChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Instrument" />
                </SelectTrigger>
                <SelectContent>
                  {INSTRUMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <div className="flex flex-col gap-0.5">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">Debug Mode</p>
              <p className="text-xs text-muted-foreground">
                Reveal the played notes and correct answers for each chord.
              </p>
            </div>
            <Switch checked={debugMode} onCheckedChange={setDebugMode} aria-label="Toggle debug mode" />
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
