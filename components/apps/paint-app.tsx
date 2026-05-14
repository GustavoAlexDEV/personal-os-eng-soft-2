"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DownloadIcon, TrashIcon, ImageIcon } from "lucide-react"

export function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushColor, setBrushColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const [canvasWidth, setCanvasWidth] = useState(800)
  const [canvasHeight, setCanvasHeight] = useState(600)
  const [isCanvasInitialized, setIsCanvasInitialized] = useState(false)
  const [showSizeDialog, setShowSizeDialog] = useState(true)

  const initializeCanvas = () => {
    console.log("[v0] Initializing canvas with size:", canvasWidth, "x", canvasHeight)

    setShowSizeDialog(false)

    // Use setTimeout to ensure the canvas is rendered before initializing
    setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) {
        console.log("[v0] Canvas ref not available")
        return
      }

      console.log("[v0] Canvas ref found, setting dimensions")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.log("[v0] Could not get canvas context")
        return
      }

      // Set canvas size
      canvas.width = canvasWidth
      canvas.height = canvasHeight

      // Fill with white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      console.log("[v0] Canvas initialized successfully")
    }, 0)
  }

  useEffect(() => {
    if (isCanvasInitialized) {
      initializeCanvas()
    }
  }, [isCanvasInitialized])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setLastPos({ x, y })
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()

    setLastPos({ x, y })
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const importImage = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido.")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Draw image on canvas (scaled to fit)
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
        const x = (canvas.width - img.width * scale) / 2
        const y = (canvas.height - img.height * scale) / 2

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const saveImage = (format: "png" | "jpg") => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `desenho.${format}`
    link.href = canvas.toDataURL(`image/${format === "jpg" ? "jpeg" : "png"}`)
    link.click()
  }

  if (showSizeDialog) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Configurar Tamanho do Canvas</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="canvas-width">Largura (px)</Label>
              <Input
                id="canvas-width"
                type="number"
                min="100"
                max="2000"
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="canvas-height">Altura (px)</Label>
              <Input
                id="canvas-height"
                type="number"
                min="100"
                max="2000"
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setCanvasWidth(800)
                  setCanvasHeight(600)
                }}
                variant="outline"
                size="sm"
              >
                800x600
              </Button>
              <Button
                onClick={() => {
                  setCanvasWidth(1024)
                  setCanvasHeight(768)
                }}
                variant="outline"
                size="sm"
              >
                1024x768
              </Button>
              <Button
                onClick={() => {
                  setCanvasWidth(1920)
                  setCanvasHeight(1080)
                }}
                variant="outline"
                size="sm"
              >
                1920x1080
              </Button>
            </div>
            <Button onClick={initializeCanvas} className="w-full">
              Criar Canvas
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-4">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-md border border-border bg-muted p-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="brush-color" className="text-sm">
            Cor:
          </Label>
          <Input
            id="brush-color"
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="h-10 w-16 cursor-pointer"
          />
          <Input
            type="text"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-24 text-sm"
            placeholder="#000000"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="brush-size" className="text-sm">
            Espessura:
          </Label>
          <Input
            id="brush-size"
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm font-medium w-8">{brushSize}px</span>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={importImage}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            <TrashIcon className="mr-2 h-4 w-4" />
            Limpar
          </Button>
          <Button variant="outline" size="sm" onClick={() => saveImage("png")}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={() => saveImage("jpg")}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            JPG
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto rounded-md border-2 border-border">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Canvas: {canvasWidth}x{canvasHeight}px • Você pode desenhar sobre imagens importadas
      </p>
    </div>
  )
}
