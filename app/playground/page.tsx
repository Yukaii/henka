import { Suspense } from "react"
import { PlaygroundView } from "@/components/playground/playground-view"

function PlaygroundFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
      Loading playground...
    </div>
  )
}

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Suspense fallback={<PlaygroundFallback />}>
          <PlaygroundView />
        </Suspense>
      </div>
    </div>
  )
}
