import { describe, it, expect, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { OSProvider, useOS } from "@/contexts/os-context"
import { vi } from "vitest"

describe("OSContext", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("Initial State", () => {
    it("should initialize with default icons when no saved state", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      expect(result.current.icons).toHaveLength(5)
      expect(result.current.icons[0].name).toBe("Opções")
      expect(result.current.icons[1].name).toBe("Paint")
      expect(result.current.icons[2].name).toBe("Campo Minado")
      expect(result.current.icons[3].name).toBe("Sapo")
      expect(result.current.icons[4].name).toBe("Gerenciar Ícones")
    })

    it("should initialize with default settings", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      expect(result.current.settings.themeColor).toBe("#6366f1")
      expect(result.current.settings.fontFamily).toBe("Inter")
      expect(result.current.settings.backgroundImage).toBe("")
      expect(result.current.settings.username).toBe("")
      expect(result.current.settings.profilePicture).toBe("")
    })

    it("should start with welcome screen incomplete", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      expect(result.current.isWelcomeComplete).toBe(false)
    })

    it("should have no windows open initially", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      expect(result.current.windows).toHaveLength(0)
    })
  })

  describe("Icon Management", () => {
    it("should add a new icon", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.addIcon({
          type: "app",
          name: "Test App",
          icon: "🧪",
          position: { x: 100, y: 100 },
        })
      })

      expect(result.current.icons).toHaveLength(6)
      expect(result.current.icons[5].name).toBe("Test App")
      expect(result.current.icons[5].icon).toBe("🧪")
    })

    it("should remove an icon", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })
      const iconId = result.current.icons[0].id

      act(() => {
        result.current.removeIcon(iconId)
      })

      expect(result.current.icons).toHaveLength(4)
      expect(result.current.icons.find((i) => i.id === iconId)).toBeUndefined()
    })

    it("should update icon position", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })
      const iconId = result.current.icons[0].id

      act(() => {
        result.current.updateIconPosition(iconId, { x: 200, y: 300 })
      })

      const updatedIcon = result.current.icons.find((i) => i.id === iconId)
      expect(updatedIcon?.position).toEqual({ x: 200, y: 300 })
    })

    it("should update icon appearance", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })
      const iconId = result.current.icons[0].id

      act(() => {
        result.current.updateIconAppearance(iconId, "🎯")
      })

      const updatedIcon = result.current.icons.find((i) => i.id === iconId)
      expect(updatedIcon?.icon).toBe("🎯")
    })

    it("should align icons vertically", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.alignIcons()
      })

      result.current.icons.forEach((icon, index) => {
        expect(icon.position.x).toBe(20)
        expect(icon.position.y).toBe(20 + index * 100)
      })
    })
  })

  describe("Window Management", () => {
    it("should open a new window", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.openWindow({
          title: "Test Window",
          component: "test",
          isMinimized: false,
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        })
      })

      expect(result.current.windows).toHaveLength(1)
      expect(result.current.windows[0].title).toBe("Test Window")
      expect(result.current.windows[0].zIndex).toBeGreaterThan(0)
    })

    it("should close a window", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.openWindow({
          title: "Test Window",
          component: "test",
          isMinimized: false,
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        })
      })

      const windowId = result.current.windows[0].id

      act(() => {
        result.current.closeWindow(windowId)
      })

      expect(result.current.windows).toHaveLength(0)
    })

    it("should minimize a window", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.openWindow({
          title: "Test Window",
          component: "test",
          isMinimized: false,
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        })
      })

      const windowId = result.current.windows[0].id

      act(() => {
        result.current.minimizeWindow(windowId)
      })

      expect(result.current.windows[0].isMinimized).toBe(true)
    })

    it("should restore a minimized window", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.openWindow({
          title: "Test Window",
          component: "test",
          isMinimized: false,
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        })
      })

      const windowId = result.current.windows[0].id

      act(() => {
        result.current.minimizeWindow(windowId)
      })

      act(() => {
        result.current.restoreWindow(windowId)
      })

      expect(result.current.windows[0].isMinimized).toBe(false)
    })

    it("should focus window and increase z-index", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.openWindow({
          title: "Window 1",
          component: "test1",
          isMinimized: false,
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        })
      })

      act(() => {
        result.current.openWindow({
          title: "Window 2",
          component: "test2",
          isMinimized: false,
          position: { x: 150, y: 150 },
          size: { width: 400, height: 300 },
        })
      })

      const window1Id = result.current.windows[0].id
      const window1InitialZ = result.current.windows[0].zIndex

      act(() => {
        result.current.focusWindow(window1Id)
      })

      const window1NewZ = result.current.windows.find((w) => w.id === window1Id)?.zIndex
      expect(window1NewZ).toBeGreaterThan(window1InitialZ)
    })

    it("should update window position", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.openWindow({
          title: "Test Window",
          component: "test",
          isMinimized: false,
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        })
      })

      const windowId = result.current.windows[0].id

      act(() => {
        result.current.updateWindowPosition(windowId, { x: 200, y: 250 })
      })

      expect(result.current.windows[0].position).toEqual({ x: 200, y: 250 })
    })

    it("should update window size", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.openWindow({
          title: "Test Window",
          component: "test",
          isMinimized: false,
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        })
      })

      const windowId = result.current.windows[0].id

      act(() => {
        result.current.updateWindowSize(windowId, { width: 600, height: 500 })
      })

      expect(result.current.windows[0].size).toEqual({ width: 600, height: 500 })
    })
  })

  describe("Settings Management", () => {
    it("should update theme color", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.updateSettings({ themeColor: "#ff0000" })
      })

      expect(result.current.settings.themeColor).toBe("#ff0000")
    })

    it("should update font family", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.updateSettings({ fontFamily: "Roboto" })
      })

      expect(result.current.settings.fontFamily).toBe("Roboto")
    })

    it("should update background image", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.updateSettings({ backgroundImage: "data:image/png;base64,test" })
      })

      expect(result.current.settings.backgroundImage).toBe("data:image/png;base64,test")
    })

    it("should update username and profile picture", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.updateSettings({
          username: "TestUser",
          profilePicture: "data:image/png;base64,profile",
        })
      })

      expect(result.current.settings.username).toBe("TestUser")
      expect(result.current.settings.profilePicture).toBe("data:image/png;base64,profile")
    })
  })

  describe("State Persistence", () => {
    it("should save state to localStorage", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.updateSettings({ themeColor: "#00ff00" })
      })

      act(() => {
        result.current.saveState()
      })

      expect(localStorage.setItem).toHaveBeenCalledWith("personal-os-state", expect.any(String))
    })

    it("should create backup when saving", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      localStorage.getItem = vi.fn().mockReturnValue(
        JSON.stringify({
          icons: [],
          settings: {},
          isWelcomeComplete: true,
        }),
      )

      act(() => {
        result.current.saveState()
      })

      expect(localStorage.setItem).toHaveBeenCalledWith("personal-os-backup", expect.any(String))
    })

    it("should revert to backup state", () => {
      const backupState = {
        icons: [
          {
            id: "test-1",
            type: "app",
            name: "Backup App",
            icon: "📦",
            position: { x: 50, y: 50 },
          },
        ],
        settings: { themeColor: "#abcdef" },
        isWelcomeComplete: true,
      }

      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(backupState))

      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.revertChanges()
      })

      expect(result.current.icons[0].name).toBe("Backup App")
      expect(result.current.settings.themeColor).toBe("#abcdef")
    })
  })

  describe("Welcome Screen", () => {
    it("should complete welcome and save state", () => {
      const { result } = renderHook(() => useOS(), { wrapper: OSProvider })

      act(() => {
        result.current.completeWelcome()
      })

      expect(result.current.isWelcomeComplete).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })
})
