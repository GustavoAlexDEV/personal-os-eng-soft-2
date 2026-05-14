"use client"

import { useOS } from "@/contexts/os-context"
import { WindowFrame } from "@/components/window-frame"
import { SettingsApp } from "@/components/apps/settings-app"
import { PaintApp } from "@/components/apps/paint-app"
import { MinesweeperApp } from "@/components/apps/minesweeper-app"
import { ScriptRunner } from "@/components/apps/script-runner"
import { ImageViewer } from "@/components/apps/image-viewer"
import { IconManager } from "@/components/apps/icon-manager"
import { FrogGame } from "@/components/apps/frog-game"
import { ProfileBrowser } from "@/components/apps/profile-browser"

export function WindowManager() {
  const { windows } = useOS()

  const getWindowContent = (component: string, data?: any) => {
    switch (component) {
      case "settings":
      case "configurações":
      case "opções":
        return <SettingsApp />
      case "paint":
        return <PaintApp />
      case "minesweeper":
      case "campo-minado":
        return <MinesweeperApp />
      case "dino-game":
      case "dinossauro":
      case "sapo":
        return <FrogGame />
      case "script-runner":
        return <ScriptRunner script={data?.script} />
      case "image-viewer":
        return <ImageViewer imageUrl={data?.imageUrl} />
      case "icon-manager":
      case "gerenciar-ícones":
        return <IconManager />
      case "navegador":
        return <ProfileBrowser />
      default:
        return <div className="p-4 text-foreground">App: {component}</div>
    }
  }

  return (
    <>
      {windows.map((window) => (
        <WindowFrame key={window.id} window={window}>
          {getWindowContent(window.component, window.data)}
        </WindowFrame>
      ))}
    </>
  )
}
