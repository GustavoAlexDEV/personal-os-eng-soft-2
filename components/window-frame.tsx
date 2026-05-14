"use client"

import type React from "react"

import { useOS, type Window } from "@/contexts/os-context"
import { useState, useRef, useEffect } from "react"
import { XIcon, MinusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WindowFrameProps {
  window: Window
  children: React.ReactNode
}

export function WindowFrame({ window, children }: WindowFrameProps) {
  const { closeWindow, minimizeWindow, focusWindow, updateWindowPosition, updateWindowSize } = useOS()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    focusWindow(window.id)
    setIsDragging(true)
    setOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    })
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    focusWindow(window.id)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateWindowPosition(window.id, {
          x: e.clientX - offset.x,
          y: e.clientY - offset.y,
        })
      } else if (isResizing) {
        const rect = windowRef.current?.getBoundingClientRect()
        if (rect) {
          const newWidth = Math.max(100, e.clientX - rect.left)
          const newHeight = Math.max(100, e.clientY - rect.top)
          updateWindowSize(window.id, { width: newWidth, height: newHeight })
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, offset, window.id, updateWindowPosition, updateWindowSize])

  if (window.isMinimized) return null

  return (
    <div
      ref={windowRef}
      className="absolute flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
      style={{
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex,
      }}
      onMouseDown={() => focusWindow(window.id)}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between border-b border-border bg-muted px-3 py-2 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm font-medium text-foreground">{window.title}</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => minimizeWindow(window.id)}>
            <MinusIcon className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => closeWindow(window.id)}>
            <XIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">{children}</div>

      {/* Resize Handle */}
      <div className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize" onMouseDown={handleResizeMouseDown}>
        <div className="absolute bottom-1 right-1 h-2 w-2 border-b-2 border-r-2 border-border" />
      </div>
    </div>
  )
}
