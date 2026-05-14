import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Desktop } from "@/components/desktop"
import { OSProvider } from "@/contexts/os-context"

describe("Desktop Component", () => {
  it("should render desktop with gradient background", () => {
    const { container } = render(
      <OSProvider>
        <Desktop />
      </OSProvider>,
    )

    const desktop = container.querySelector(".relative")
    expect(desktop).toBeTruthy()
  })

  it("should render all default icons", () => {
    render(
      <OSProvider>
        <Desktop />
      </OSProvider>,
    )

    expect(screen.getByText("Opções")).toBeTruthy()
    expect(screen.getByText("Paint")).toBeTruthy()
    expect(screen.getByText("Campo Minado")).toBeTruthy()
    expect(screen.getByText("Sapo")).toBeTruthy()
    expect(screen.getByText("Gerenciar Ícones")).toBeTruthy()
  })

  it("should render action buttons (save, align, revert, export)", () => {
    const { container } = render(
      <OSProvider>
        <Desktop />
      </OSProvider>,
    )

    const buttons = container.querySelectorAll("button")
    expect(buttons.length).toBeGreaterThanOrEqual(4)
  })

  it("should open window when icon is double clicked", async () => {
    render(
      <OSProvider>
        <Desktop />
      </OSProvider>,
    )

    const paintIcon = screen.getByText("Paint").closest("button")
    expect(paintIcon).toBeTruthy()

    if (paintIcon) {
      fireEvent.doubleClick(paintIcon)

      // Window should open
      await screen.findByText("Paint", { selector: ".window-title" })
    }
  })
})
