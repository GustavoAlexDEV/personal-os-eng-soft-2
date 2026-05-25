"use client"

import type React from "react"

import { useOS, type DesktopIcon as IconType } from "@/contexts/os-context"
import { useState, useRef, useEffect } from "react"
import { FileIcon, Link2Icon, CodeIcon, ImageIcon } from "lucide-react"

interface DesktopIconProps {
  icon: IconType
}

export function DesktopIcon({ icon }: DesktopIconProps) {
  const { updateIconPosition, openWindow } = useOS()
  const [isDragging, setIsDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const iconRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    const rect = iconRef.current?.getBoundingClientRect()
    if (rect) {
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const newX = e.clientX - offset.x
      const newY = e.clientY - offset.y
      updateIconPosition(icon.id, { x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, offset, icon.id, updateIconPosition])

  const handleDoubleClick = () => {
    switch (icon.type) {
      case "app":
        openWindow({
          title: icon.name,
          component: icon.name.toLowerCase().replace(/\s+/g, "-"),
          icon: icon.icon,
          isMinimized: false,
          position: { x: 100, y: 100 },
          size: { width: 600, height: 400 },
        })
        break
      case "social":
        if (icon.data?.url) {
          window.open(icon.data.url, "_blank")
        }
        break
      case "script":
        openWindow({
          title: icon.name,
          component: "script-runner",
          icon: icon.icon,
          isMinimized: false,
          position: { x: 100, y: 100 },
          size: { width: 500, height: 400 },
          data: { script: icon.data?.script },
        })
        break
      case "image":
        openWindow({
          title: icon.name,
          component: "image-viewer",
          icon: icon.icon,
          isMinimized: false,
          position: { x: 100, y: 100 },
          size: { width: 600, height: 500 },
          data: { imageUrl: icon.data?.imageUrl },
        })
        break
    }
  }

  const getIcon = () => {
    switch (icon.type) {
      case "app":
        return <FileIcon className="h-8 w-8" />
      case "social":
        return <Link2Icon className="h-8 w-8" />
      case "script":
        return <CodeIcon className="h-8 w-8" />
      case "image":
        return <ImageIcon className="h-8 w-8" />
    }
  }

  const isEmoji = icon.icon && !icon.icon.startsWith("http") && !icon.icon.startsWith("data:")

  return (
    <div
      ref={iconRef}
      className="absolute flex w-16 cursor-pointer flex-col items-start gap-1 select-none"
      style={{
        left: icon.position.x,
        top: icon.position.y,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
        {icon.icon ? (
          isEmoji ? (
            <span className="text-4xl">{icon.icon}</span>
          ) : (
            <img src={icon.icon || "/placeholder.svg"} alt={icon.name} className="h-10 w-10 object-contain" />
          )
        ) : (
          getIcon()
        )}
      </div>
      <span className="w-24 -ml-4 text-center text-xs text-white drop-shadow-lg break-words">{icon.name}</span>
    </div>
  )
}
