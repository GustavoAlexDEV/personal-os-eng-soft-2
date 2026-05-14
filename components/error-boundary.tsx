"use client"

import type React from "react"
import { Component, type ReactNode } from "react"
import { FrogGame } from "@/components/apps/frog-game"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900">
          <FrogGame />
          <p className="mt-4 text-white text-sm">Erro no sistema! Jogue enquanto tentamos resolver...</p>
        </div>
      )
    }

    return this.props.children
  }
}
