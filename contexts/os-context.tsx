"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface DesktopIcon {
  id: string
  type: "app" | "social" | "script" | "image"
  name: string
  icon: string
  position: { x: number; y: number }
  data?: {
    url?: string
    script?: string
    imageUrl?: string
  }
}

export interface Window {
  id: string
  title: string
  component: string
  isMinimized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  data?: any
}

interface OSSettings {
  themeColor: string
  fontFamily: string
  backgroundImage: string
  username: string
  profilePicture: string
  customIcons?: Array<{ id: string; name: string; data: string }>
}

interface OSContextType {
  icons: DesktopIcon[]
  windows: Window[]
  settings: OSSettings
  isWelcomeComplete: boolean
  syncCode: string | null
  isSyncing: boolean
  completeWelcome: () => void
  addIcon: (icon: Omit<DesktopIcon, "id">) => void
  removeIcon: (id: string) => void
  updateIconPosition: (id: string, position: { x: number; y: number }) => void
  updateIconAppearance: (id: string, icon: string) => void
  alignIcons: () => void
  openWindow: (window: Omit<Window, "id" | "zIndex">) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void
  updateWindowSize: (id: string, size: { width: number; height: number }) => void
  updateSettings: (settings: Partial<OSSettings>) => void
  saveState: () => void
  loadState: () => void
  revertChanges: () => void
  syncToCloud: () => Promise<string | null>
  loadFromCloud: (code: string) => Promise<boolean>
  updateCloud: () => Promise<boolean>
  clearSyncCode: () => void
}

const OSContext = createContext<OSContextType | undefined>(undefined)

const DEFAULT_SETTINGS: OSSettings = {
  themeColor: "#6366f1",
  fontFamily: "Inter",
  backgroundImage: "",
  username: "",
  profilePicture: "",
}

const DEFAULT_ICONS: Omit<DesktopIcon, "id">[] = [
  {
    type: "app",
    name: "Opções",
    icon: "⚙️",
    position: { x: 20, y: 20 },
  },
  {
    type: "app",
    name: "Paint",
    icon: "🎨",
    position: { x: 20, y: 120 },
  },
  {
    type: "app",
    name: "Campo Minado",
    icon: "💣",
    position: { x: 20, y: 220 },
  },
  {
    type: "app",
    name: "Sapo",
    icon: "🐸",
    position: { x: 20, y: 320 },
  },
  {
    type: "app",
    name: "Gerenciar Ícones",
    icon: "📋",
    position: { x: 20, y: 420 },
  },
  {
    type: "app",
    name: "Navegador",
    icon: "🌐",
    position: { x: 20, y: 520 },
  },
]

export function OSProvider({ children }: { children: ReactNode }) {
  const [icons, setIcons] = useState<DesktopIcon[]>([])
  const [windows, setWindows] = useState<Window[]>([])
  const [settings, setSettings] = useState<OSSettings>(DEFAULT_SETTINGS)
  const [maxZIndex, setMaxZIndex] = useState(1)
  const [isWelcomeComplete, setIsWelcomeComplete] = useState(false)
  const [backupState, setBackupState] = useState<any>(null)
  const [syncCode, setSyncCode] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    loadState()
    const savedCode = localStorage.getItem("personal-os-sync-code")
    if (savedCode) setSyncCode(savedCode)
  }, [])

  const addIcon = (icon: Omit<DesktopIcon, "id">) => {
    const newIcon: DesktopIcon = {
      ...icon,
      id: `icon-${Date.now()}-${Math.random()}`,
    }
    setIcons((prev) => [...prev, newIcon])
  }

  const removeIcon = (id: string) => {
    setIcons((prev) => prev.filter((icon) => icon.id !== id))
  }

  const updateIconPosition = (id: string, position: { x: number; y: number }) => {
    setIcons((prev) => prev.map((icon) => (icon.id === id ? { ...icon, position } : icon)))
  }

  const updateIconAppearance = (id: string, icon: string) => {
    setIcons((prev) => prev.map((i) => (i.id === id ? { ...i, icon } : i)))
  }

  const alignIcons = () => {
    const ICON_SPACING = 100
    const START_X = 20
    const START_Y = 20

    setIcons((prev) =>
      prev.map((icon, index) => ({
        ...icon,
        position: {
          x: START_X,
          y: START_Y + index * ICON_SPACING,
        },
      })),
    )
  }

  const openWindow = (window: Omit<Window, "id" | "zIndex">) => {
    const newWindow: Window = {
      ...window,
      id: `window-${Date.now()}-${Math.random()}`,
      zIndex: maxZIndex + 1,
    }
    setMaxZIndex((prev) => prev + 1)
    setWindows((prev) => [...prev, newWindow])
  }

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((window) => window.id !== id))
  }

  const minimizeWindow = (id: string) => {
    setWindows((prev) => prev.map((window) => (window.id === id ? { ...window, isMinimized: true } : window)))
  }

  const restoreWindow = (id: string) => {
    setWindows((prev) => prev.map((window) => (window.id === id ? { ...window, isMinimized: false } : window)))
    focusWindow(id)
  }

  const focusWindow = (id: string) => {
    setMaxZIndex((prev) => prev + 1)
    setWindows((prev) => prev.map((window) => (window.id === id ? { ...window, zIndex: maxZIndex + 1 } : window)))
  }

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setWindows((prev) => prev.map((window) => (window.id === id ? { ...window, position } : window)))
  }

  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
    setWindows((prev) => prev.map((window) => (window.id === id ? { ...window, size } : window)))
  }

  const updateSettings = (newSettings: Partial<OSSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const completeWelcome = () => {
    setIsWelcomeComplete(true)
    saveState()
  }

  const saveState = () => {
    const state = {
      icons,
      settings,
      isWelcomeComplete,
      timestamp: new Date().toISOString(),
    }
    try {
      const current = localStorage.getItem("personal-os-state")
      if (current) {
        localStorage.setItem("personal-os-backup", current)
      }
      localStorage.setItem("personal-os-state", JSON.stringify(state))
      console.log("[v0] State saved successfully at", state.timestamp)
    } catch (error) {
      console.error("[v0] Failed to save state:", error)
      alert("Erro ao salvar! Verifique o espaço de armazenamento.")
    }
  }

  const loadState = () => {
    try {
      const saved = localStorage.getItem("personal-os-state")
      if (saved) {
        const state = JSON.parse(saved)
        setIcons(state.icons || [])
        setSettings(state.settings || DEFAULT_SETTINGS)
        setIsWelcomeComplete(state.isWelcomeComplete || false)
        console.log("[v0] State loaded from", state.timestamp || "unknown time")
      } else {
        const initialIcons = DEFAULT_ICONS.map((icon) => ({
          ...icon,
          id: `icon-${Date.now()}-${Math.random()}`,
        }))
        setIcons(initialIcons)
        setIsWelcomeComplete(false)
        console.log("[v0] Initialized with default icons")
      }
    } catch (error) {
      console.error("[v0] Failed to load state:", error)
    }
  }

  const revertChanges = () => {
    try {
      const backup = localStorage.getItem("personal-os-backup")
      if (backup) {
        const state = JSON.parse(backup)
        setIcons(state.icons || [])
        setSettings(state.settings || DEFAULT_SETTINGS)
        setIsWelcomeComplete(state.isWelcomeComplete || false)
        console.log("[v0] State reverted to backup")
      } else {
        alert("Nenhum backup disponível para reverter.")
      }
    } catch (error) {
      console.error("[v0] Failed to revert state:", error)
      alert("Erro ao reverter alterações!")
    }
  }

  const syncToCloud = async (): Promise<string | null> => {
    setIsSyncing(true)
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icons, settings, isWelcomeComplete }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao sincronizar")
      }
      const data = await res.json()
      setSyncCode(data.syncCode)
      localStorage.setItem("personal-os-sync-code", data.syncCode)
      return data.syncCode
    } catch (error) {
      console.error("syncToCloud error:", error)
      return null
    } finally {
      setIsSyncing(false)
    }
  }

  const loadFromCloud = async (code: string): Promise<boolean> => {
    setIsSyncing(true)
    try {
      const res = await fetch(`/api/sync/${code.toUpperCase()}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao carregar")
      }
      const data = await res.json()
      const state = data.stateData
      setIcons(state.icons || [])
      setSettings(state.settings || DEFAULT_SETTINGS)
      setIsWelcomeComplete(state.isWelcomeComplete || false)
      setSyncCode(code.toUpperCase())
      localStorage.setItem("personal-os-sync-code", code.toUpperCase())
      saveState()
      return true
    } catch (error) {
      console.error("loadFromCloud error:", error)
      return false
    } finally {
      setIsSyncing(false)
    }
  }

  const updateCloud = async (): Promise<boolean> => {
    if (!syncCode) return false
    setIsSyncing(true)
    try {
      const res = await fetch(`/api/sync/${syncCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icons, settings, isWelcomeComplete }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao atualizar")
      }
      return true
    } catch (error) {
      console.error("updateCloud error:", error)
      return false
    } finally {
      setIsSyncing(false)
    }
  }

  const clearSyncCode = () => {
    setSyncCode(null)
    localStorage.removeItem("personal-os-sync-code")
  }

  return (
    <OSContext.Provider
      value={{
        icons,
        windows,
        settings,
        isWelcomeComplete,
        syncCode,
        isSyncing,
        completeWelcome,
        addIcon,
        removeIcon,
        updateIconPosition,
        updateIconAppearance,
        alignIcons,
        openWindow,
        closeWindow,
        minimizeWindow,
        restoreWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowSize,
        updateSettings,
        saveState,
        loadState,
        revertChanges,
        syncToCloud,
        loadFromCloud,
        updateCloud,
        clearSyncCode,
      }}
    >
      {children}
    </OSContext.Provider>
  )
}

export function useOS() {
  const context = useContext(OSContext)
  if (!context) {
    throw new Error("useOS must be used within OSProvider")
  }
  return context
}
