import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { SettingsProvider } from "@/components/settings-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: 'Henka',
  description: 'Adaptive training experiences for music creators.',
  applicationName: 'Henka',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  themeColor: '#0b0b0f',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
    other: [
      {
        rel: 'mask-icon',
        url: '/icon-maskable.png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SettingsProvider>
            {children}
            <Analytics />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
