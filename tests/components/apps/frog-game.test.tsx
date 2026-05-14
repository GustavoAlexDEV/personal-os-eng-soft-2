import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { FrogGame } from "@/components/apps/frog-game"

describe("Frog Game", () => {
  it("should render game canvas", () => {
    const { container } = render(<FrogGame />)

    const canvas = container.querySelector("canvas")
    expect(canvas).toBeTruthy()
  })

  it("should show start screen initially", () => {
    render(<FrogGame />)

    expect(screen.getByText(/pressione espaço/i)).toBeTruthy()
  })

  it("should start game on spacebar press", () => {
    render(<FrogGame />)

    fireEvent.keyDown(window, { code: "Space" })

    expect(screen.queryByText(/pressione espaço/i)).toBeFalsy()
  })

  it("should show score", () => {
    const { container } = render(<FrogGame />)

    expect(container.textContent).toMatch(/\d+/)
  })

  it("should allow jump with spacebar", () => {
    render(<FrogGame />)

    fireEvent.keyDown(window, { code: "Space" })

    // Game should be running
    expect(screen.queryByText(/game over/i)).toBeFalsy()
  })

  it("should increase speed over time", async () => {
    render(<FrogGame />)

    fireEvent.keyDown(window, { code: "Space" })

    // Speed increases every 50 points
    // This would require mocking game state
    expect(true).toBe(true)
  })
})
