"use client"

import { Desktop } from "@/components/desktop"
import { OSProvider, useOS } from "@/contexts/os-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { WelcomeScreen } from "@/components/welcome-screen"

function AppContent() {
  const { isWelcomeComplete } = useOS()

  return (
    <>
      {!isWelcomeComplete && <WelcomeScreen />}
      <Desktop />
    </>
  )
}

export default function Home() {
  return (
    <ErrorBoundary>
      <OSProvider>
        <AppContent />
      </OSProvider>
    </ErrorBoundary>
  )
}
