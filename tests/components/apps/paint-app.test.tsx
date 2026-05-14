import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { PaintApp } from "@/components/apps/paint-app"

describe("Paint App", () => {
  it("should render canvas setup dialog initially", () => {
    render(<PaintApp />)

    expect(screen.getByText(/configurar canvas/i)).toBeTruthy()
  })

  it("should allow setting canvas dimensions", () => {
    render(<PaintApp />)

    const widthInput = screen.getByLabelText(/largura/i)
    const heightInput = screen.getByLabelText(/altura/i)

    fireEvent.change(widthInput, { target: { value: "1000" } })
    fireEvent.change(heightInput, { target: { value: "800" } })

    expect(widthInput).toHaveValue(1000)
    expect(heightInput).toHaveValue(800)
  })

  it("should have color picker", () => {
    render(<PaintApp />)

    // Create canvas first
    const createButton = screen.getByText(/criar canvas/i)
    fireEvent.click(createButton)

    const colorInput = screen.getByLabelText(/cor/i)
    expect(colorInput).toBeTruthy()
  })

  it("should have brush size control", () => {
    render(<PaintApp />)

    const createButton = screen.getByText(/criar canvas/i)
    fireEvent.click(createButton)

    const sizeInput = screen.getByLabelText(/espessura/i)
    expect(sizeInput).toBeTruthy()
  })

  it("should allow image import", () => {
    render(<PaintApp />)

    const createButton = screen.getByText(/criar canvas/i)
    fireEvent.click(createButton)

    expect(screen.getByText(/importar imagem/i)).toBeTruthy()
  })

  it("should have export options (PNG and JPG)", () => {
    render(<PaintApp />)

    const createButton = screen.getByText(/criar canvas/i)
    fireEvent.click(createButton)

    expect(screen.getByText(/salvar como png/i)).toBeTruthy()
    expect(screen.getByText(/salvar como jpg/i)).toBeTruthy()
  })
})
