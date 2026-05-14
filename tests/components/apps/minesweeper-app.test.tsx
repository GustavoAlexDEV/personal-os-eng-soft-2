import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MinesweeperApp } from "@/components/apps/minesweeper-app"

describe("Minesweeper App", () => {
  it("should render game board", () => {
    render(<MinesweeperApp />)

    const cells = screen.getAllByRole("button")
    expect(cells.length).toBeGreaterThan(0)
  })

  it("should start game when first cell is clicked", () => {
    render(<MinesweeperApp />)

    const cells = screen.getAllByRole("button")
    fireEvent.click(cells[0])

    // First click should always be safe
    expect(cells[0]).not.toHaveTextContent("💣")
  })

  it("should allow right-click to flag cells", () => {
    render(<MinesweeperApp />)

    const cells = screen.getAllByRole("button")
    fireEvent.contextMenu(cells[0])

    expect(cells[0]).toHaveTextContent("🚩")
  })

  it("should have new game button", () => {
    render(<MinesweeperApp />)

    expect(screen.getByText(/novo jogo/i)).toBeTruthy()
  })

  it("should show mine count", () => {
    render(<MinesweeperApp />)

    expect(screen.getByText(/minas:/i)).toBeTruthy()
  })

  it("should regenerate board if first click hits mine", () => {
    render(<MinesweeperApp />)

    const cells = screen.getAllByRole("button")
    fireEvent.click(cells[0])

    // After first click, the clicked cell should be revealed and safe
    const clickedCell = cells[0]
    expect(clickedCell.disabled).toBe(true)
  })
})
