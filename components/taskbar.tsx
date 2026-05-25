"use client"

import { useOS } from "@/contexts/os-context"
import { Button } from "@/components/ui/button"
import { 
  SettingsIcon, 
  PaletteIcon, 
  GamepadIcon, 
  FolderIcon, 
  GlobeIcon,
  AppWindowIcon,
  UsersIcon,
  ImageIcon,
} from "lucide-react"

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

export function Taskbar() {
  const { windows, restoreWindow, minimizeWindow, focusWindow, openWindow, settings } = useOS()

  // Encontra a janela com maior zIndex (ativa)
  const activeWindow = windows
    .filter((w) => !w.isMinimized)
    .reduce((max, w) => (w.zIndex > (max?.zIndex || 0) ? w : max), null as typeof windows[0] | null)

  // Mapeia componentes para icones
  const getWindowIcon = (component: string) => {
    switch (component) {
      case "settings":
        return <SettingsIcon className="h-5 w-5" />
      case "paint":
        return <PaletteIcon className="h-5 w-5" />
      case "minesweeper":
        return <GamepadIcon className="h-5 w-5" />
      case "icon-manager":
        return <FolderIcon className="h-5 w-5" />
      case "navegador":
        return <GlobeIcon className="h-5 w-5" />
      case "profile-browser":
        return <UsersIcon className="h-5 w-5" />
      case "image-viewer":
        return <ImageIcon className="h-5 w-5" />
      default:
        return <AppWindowIcon className="h-5 w-5" />
    }
  }

  // Ao clicar na janela na taskbar
  const handleWindowClick = (windowId: string, isMinimized: boolean, isActive: boolean) => {
    if (isMinimized) {
      restoreWindow(windowId)
    } else if (isActive) {
      minimizeWindow(windowId)
    } else {
      focusWindow(windowId)
    }
  }

  function generateTaskbarGradient(hex: string): string {
    const hsl = hexToHsl(hex)
    // Reduce luminosity by 50% for the taskbar
    const darkerLight = Math.max(0, hsl.l - 25)
    const darkerDark = Math.max(0, hsl.l - 40)

    return `linear-gradient(90deg, hsl(${hsl.h}, ${hsl.s}%, ${darkerLight}%) 0%, hsl(${hsl.h}, ${hsl.s}%, ${darkerDark}%) 100%)`
  }

  const handleOpenSettings = () => {
    openWindow({
      title: "Configurações",
      component: "settings",
      isMinimized: false,
      position: { x: 100, y: 100 },
      size: { width: 500, height: 600 },
    })
  }

  const handleOpenPaint = () => {
    openWindow({
      title: "Paint",
      component: "paint",
      isMinimized: false,
      position: { x: 150, y: 150 },
      size: { width: 700, height: 500 },
    })
  }

  const handleOpenMinesweeper = () => {
    openWindow({
      title: "Campo Minado",
      component: "minesweeper",
      isMinimized: false,
      position: { x: 200, y: 200 },
      size: { width: 400, height: 500 },
    })
  }

  const handleOpenIconManager = () => {
    openWindow({
      title: "Gerenciar Ícones",
      component: "icon-manager",
      isMinimized: false,
      position: { x: 120, y: 120 },
      size: { width: 550, height: 600 },
    })
  }

  const handleOpenBrowser = () => {
    openWindow({
      title: "Navegador",
      component: "navegador",
      isMinimized: false,
      position: { x: 180, y: 80 },
      size: { width: 500, height: 600 },
    })
  }

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex h-12 items-center gap-2 border-t px-4 backdrop-blur-md"
      style={{
        backgroundImage: generateTaskbarGradient(settings.themeColor),
        borderTopColor: `${settings.themeColor}30`,
      }}
    >
      {/* App Launcher */}
      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleOpenSettings}>
        <SettingsIcon className="h-5 w-5" />
      </Button>

      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleOpenPaint}>
        <PaletteIcon className="h-5 w-5" />
      </Button>

      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleOpenMinesweeper}>
        <GamepadIcon className="h-5 w-5" />
      </Button>

      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleOpenIconManager}>
        <FolderIcon className="h-5 w-5" />
      </Button>

      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleOpenBrowser}>
        <GlobeIcon className="h-5 w-5" />
      </Button>

      <div className="mx-2 h-8 w-px bg-white/20" />

      {/* Open Windows */}
      <div className="flex items-center gap-1">
        {windows.map((window) => {
          const isActive = activeWindow?.id === window.id && !window.isMinimized
          return (
            <Button
              key={window.id}
              variant="ghost"
              size="icon"
              title={window.title}
              className={`relative text-white transition-all ${
                isActive 
                  ? "bg-white/30 hover:bg-white/40 ring-2 ring-white/50" 
                  : window.isMinimized
                    ? "bg-white/5 hover:bg-white/15 opacity-70"
                    : "bg-white/10 hover:bg-white/20"
              }`}
              onClick={() => handleWindowClick(window.id, window.isMinimized, isActive)}
            >
              {getWindowIcon(window.component)}
              {/* Indicador de janela ativa */}
              {isActive && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full" />
              )}
              {/* Indicador de janela minimizada */}
              {window.isMinimized && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-white/50 rounded-full" />
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
