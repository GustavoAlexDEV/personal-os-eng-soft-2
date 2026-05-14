"use client"

import type React from "react"
import { useState } from "react"
import { useOS } from "@/contexts/os-context"
import { DesktopIcon } from "@/components/desktop-icon"
import { WindowManager } from "@/components/window-manager"
import { Taskbar } from "@/components/taskbar"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { SaveIcon, AlignLeft, RotateCcw, Download } from "lucide-react"

// ... existing helper functions ...

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}`
    : "99, 102, 241"
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { h: 264, s: 74, l: 60 }

  const r = Number.parseInt(result[1], 16) / 255
  const g = Number.parseInt(result[2], 16) / 255
  const b = Number.parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function generateMonochromaticGradient(hex: string): { lighter: string; darker: string } {
  const hsl = hexToHsl(hex)

  const lighterLuminosity = Math.min(hsl.l + 15, 100)
  const darkerLuminosity = Math.max(hsl.l - 15, 0)

  const lighter = `hsl(${hsl.h}, ${hsl.s}%, ${lighterLuminosity}%)`
  const darker = `hsl(${hsl.h}, ${hsl.s}%, ${darkerLuminosity}%)`

  return { lighter, darker }
}

export function Desktop() {
  const { icons, settings, updateSettings, saveState, alignIcons, revertChanges } = useOS()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [gradientColors, setGradientColors] = useState({
    lighter: "hsl(264, 74%, 55%)",
    darker: "hsl(264, 74%, 30%)",
  })
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", settings.themeColor)
    document.documentElement.style.setProperty("--theme-rgb", hexToRgb(settings.themeColor))
    setGradientColors(generateMonochromaticGradient(settings.themeColor))
  }, [settings.themeColor])

  useEffect(() => {
    const interval = setInterval(() => {
      saveState()
      console.log("[v0] Auto-saved state")
    }, 30000)

    return () => clearInterval(interval)
  }, [saveState])

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader()
      reader.onload = (event) => {
        updateSettings({ backgroundImage: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleManualSave = () => {
    saveState()
    const button = document.getElementById("save-button")
    if (button) {
      button.classList.add("animate-pulse")
      setTimeout(() => {
        button.classList.remove("animate-pulse")
      }, 1000)
    }
  }

  const handleRevert = () => {
    const confirmed = confirm("Tem certeza que deseja reverter para o último salvamento?")
    if (confirmed) {
      revertChanges()
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { generateExportZip } = await import("@/utils/export-generator")
      const currentState = {
        icons,
        settings,
      }
      await generateExportZip(currentState, settings.username, settings.profilePicture)
      alert("Website exportado com sucesso!")
    } catch (error) {
      console.error("Erro ao exportar:", error)
      alert("Erro ao exportar o website. Tente novamente.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{
        backgroundImage: settings.backgroundImage
          ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${settings.backgroundImage})`
          : `linear-gradient(135deg, ${gradientColors.lighter} 0%, ${gradientColors.darker} 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: settings.fontFamily,
        backgroundColor: settings.backgroundImage ? undefined : gradientColors.darker,
      }}
    >
      {/* Desktop Icons */}
      <div className="absolute inset-0 p-4">
        {icons.map((icon) => (
          <DesktopIcon key={icon.id} icon={icon} />
        ))}
      </div>

      {/* Windows */}
      <WindowManager />

      {/* Taskbar */}
      <Taskbar />

      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          onClick={alignIcons}
          size="icon"
          className="bg-primary/80 hover:bg-primary backdrop-blur-sm"
          title="Alinhar Ícones"
        >
          <AlignLeft className="h-5 w-5" />
        </Button>
        <Button
          onClick={handleRevert}
          size="icon"
          className="bg-primary/80 hover:bg-primary backdrop-blur-sm"
          title="Reverter Alterações"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          size="icon"
          className="bg-primary/80 hover:bg-primary backdrop-blur-sm"
          title="Exportar Website"
        >
          <Download className="h-5 w-5" />
        </Button>
        <Button
          id="save-button"
          onClick={handleManualSave}
          size="icon"
          className="bg-primary/80 hover:bg-primary backdrop-blur-sm"
          title="Salvar Alterações"
        >
          <SaveIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Hidden file input for background */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleBackgroundChange}
      />
    </div>
  )
}
