import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { IconManager } from "@/components/apps/icon-manager"
import { OSProvider } from "@/contexts/os-context"

describe("Icon Manager", () => {
  it("should render all tabs", () => {
    render(
      <OSProvider>
        <IconManager />
      </OSProvider>,
    )

    expect(screen.getByText(/adicionar/i)).toBeTruthy()
    expect(screen.getByText(/gerenciar/i)).toBeTruthy()
  })

  it("should allow adding social media link", () => {
    render(
      <OSProvider>
        <IconManager />
      </OSProvider>,
    )

    expect(screen.getByPlaceholderText(/nome/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/url/i)).toBeTruthy()
  })

  it("should allow adding script", () => {
    render(
      <OSProvider>
        <IconManager />
      </OSProvider>,
    )

    fireEvent.click(screen.getByText(/script/i))

    expect(screen.getByPlaceholderText(/código javascript/i)).toBeTruthy()
  })

  it("should allow adding image", () => {
    render(
      <OSProvider>
        <IconManager />
      </OSProvider>,
    )

    fireEvent.click(screen.getByText(/imagem/i))

    const fileInput = screen.getByLabelText(/escolher imagem/i)
    expect(fileInput).toBeTruthy()
  })

  it("should show existing icons in manage tab", () => {
    render(
      <OSProvider>
        <IconManager />
      </OSProvider>,
    )

    fireEvent.click(screen.getByText(/gerenciar/i))

    // Should show default icons
    expect(screen.getAllByText(/opções|paint|campo minado|sapo/i).length).toBeGreaterThan(0)
  })

  it("should allow changing icon appearance", () => {
    render(
      <OSProvider>
        <IconManager />
      </OSProvider>,
    )

    fireEvent.click(screen.getByText(/gerenciar/i))

    const icons = screen.getAllByRole("button")
    if (icons.length > 0) {
      fireEvent.click(icons[0])

      // Modal should open with icon selection
      expect(screen.getByText(/selecionar ícone/i)).toBeTruthy()
    }
  })
})
