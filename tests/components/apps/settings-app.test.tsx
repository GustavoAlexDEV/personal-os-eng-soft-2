import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { SettingsApp } from "@/components/apps/settings-app"
import { OSProvider } from "@/contexts/os-context"

describe("Settings App", () => {
  it("should render all tabs", () => {
    render(
      <OSProvider>
        <SettingsApp />
      </OSProvider>,
    )

    expect(screen.getByText(/aparência/i)).toBeTruthy()
    expect(screen.getByText(/desktop/i)).toBeTruthy()
    expect(screen.getByText(/perfil/i)).toBeTruthy()
    expect(screen.getByText(/sobre/i)).toBeTruthy()
  })

  it("should allow theme color change", () => {
    render(
      <OSProvider>
        <SettingsApp />
      </OSProvider>,
    )

    const colorInput = screen.getByLabelText(/cor do tema/i)
    expect(colorInput).toBeTruthy()

    fireEvent.change(colorInput, { target: { value: "#ff0000" } })
  })

  it("should allow font selection", () => {
    render(
      <OSProvider>
        <SettingsApp />
      </OSProvider>,
    )

    expect(screen.getByText(/fonte do sistema/i)).toBeTruthy()
  })

  it("should allow background image upload", () => {
    render(
      <OSProvider>
        <SettingsApp />
      </OSProvider>,
    )

    fireEvent.click(screen.getByText(/desktop/i))

    expect(screen.getByText(/plano de fundo/i)).toBeTruthy()
  })

  it("should allow custom icon upload", () => {
    render(
      <OSProvider>
        <SettingsApp />
      </OSProvider>,
    )

    fireEvent.click(screen.getByText(/desktop/i))

    expect(screen.getByText(/ícones personalizados/i)).toBeTruthy()
  })

  it("should have reset system option", () => {
    render(
      <OSProvider>
        <SettingsApp />
      </OSProvider>,
    )

    fireEvent.click(screen.getByText(/sobre/i))

    expect(screen.getByText(/resetar sistema/i)).toBeTruthy()
  })
})
