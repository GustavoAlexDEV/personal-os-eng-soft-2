"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export function FrogGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const gameLoopRef = useRef<number>()
  const animationFrameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Game state
    const frog = {
      x: 50,
      y: 150,
      width: 40,
      height: 40,
      velocityY: 0,
      jumping: false,
      frame: 0,
    }

    let obstacles: Array<{ x: number; width: number; height: number; frame: number }> = []
    let gameSpeed = 5
    let currentScore = 0
    let isGameOver = false

    const gravity = 0.6
    const jumpStrength = -12
    const groundY = 150

    // Load high score
    const savedHighScore = localStorage.getItem("frog-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }

    const jump = () => {
      if (!frog.jumping && frog.y === groundY) {
        frog.velocityY = jumpStrength
        frog.jumping = true
      }
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault()
        if (!gameStarted) {
          setGameStarted(true)
          isGameOver = false
          currentScore = 0
          obstacles = []
          frog.y = groundY
          frog.velocityY = 0
          frog.jumping = false
          gameSpeed = 5
        } else if (!isGameOver) {
          jump()
        } else {
          // Restart game
          setGameStarted(true)
          isGameOver = false
          currentScore = 0
          obstacles = []
          frog.y = groundY
          frog.velocityY = 0
          frog.jumping = false
          gameSpeed = 5
        }
      }
    }

    const handleClick = () => {
      if (!gameStarted) {
        setGameStarted(true)
        isGameOver = false
        currentScore = 0
        obstacles = []
        frog.y = groundY
        frog.velocityY = 0
        frog.jumping = false
        gameSpeed = 5
      } else if (!isGameOver) {
        jump()
      } else {
        // Restart game
        setGameStarted(true)
        isGameOver = false
        currentScore = 0
        obstacles = []
        frog.y = groundY
        frog.velocityY = 0
        frog.jumping = false
        gameSpeed = 5
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    canvas.addEventListener("click", handleClick)

    // Draw frog sprite
    const drawFrog = (x: number, y: number, isJumping: boolean, frame: number) => {
      ctx.fillStyle = "#22c55e" // Green frog body

      if (isJumping) {
        // Jumping pose
        ctx.fillRect(x + 5, y, 30, 35) // Body
        ctx.fillStyle = "#16a34a"
        ctx.fillRect(x, y + 30, 10, 10) // Left leg extended
        ctx.fillRect(x + 30, y + 30, 10, 10) // Right leg extended
        ctx.fillStyle = "#fef08a" // Yellow belly
        ctx.fillRect(x + 12, y + 15, 16, 15)
        // Eyes
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(x + 8, y + 5, 8, 8)
        ctx.fillRect(x + 24, y + 5, 8, 8)
        ctx.fillStyle = "#000000"
        ctx.fillRect(x + 11, y + 8, 3, 3)
        ctx.fillRect(x + 27, y + 8, 3, 3)
      } else {
        // Running animation (2 frames)
        const legOffset = frame % 20 < 10 ? 0 : 3
        ctx.fillRect(x + 5, y + 5, 30, 30) // Body
        ctx.fillStyle = "#16a34a"
        ctx.fillRect(x + legOffset, y + 32, 8, 8) // Left leg
        ctx.fillRect(x + 32 - legOffset, y + 32, 8, 8) // Right leg
        ctx.fillStyle = "#fef08a" // Yellow belly
        ctx.fillRect(x + 12, y + 18, 16, 12)
        // Eyes
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(x + 8, y + 8, 8, 8)
        ctx.fillRect(x + 24, y + 8, 8, 8)
        ctx.fillStyle = "#000000"
        ctx.fillRect(x + 11, y + 11, 3, 3)
        ctx.fillRect(x + 27, y + 11, 3, 3)
      }
    }

    // Draw snake sprite
    const drawSnake = (x: number, y: number, width: number, height: number, frame: number) => {
      const waveOffset = Math.sin(frame * 0.2) * 3

      ctx.fillStyle = "#dc2626" // Red snake body
      ctx.fillRect(x, y + waveOffset, width, height - 8)
      ctx.fillRect(x + width - 8, y + waveOffset - 5, 8, 8) // Head

      ctx.fillStyle = "#991b1b" // Dark red pattern
      for (let i = 0; i < width - 10; i += 8) {
        ctx.fillRect(x + i, y + waveOffset + 2, 4, height - 12)
      }

      // Eyes
      ctx.fillStyle = "#fef08a"
      ctx.fillRect(x + width - 6, y + waveOffset - 3, 2, 2)
      ctx.fillRect(x + width - 6, y + waveOffset + 1, 2, 2)

      // Tongue
      ctx.fillStyle = "#dc2626"
      ctx.fillRect(x + width, y + waveOffset, 4, 1)
    }

    const gameLoop = () => {
      if (!ctx || !canvas) return

      animationFrameRef.current++

      // Clear canvas
      ctx.fillStyle = "#e0f2fe"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw ground
      ctx.fillStyle = "#16a34a"
      ctx.fillRect(0, groundY + frog.height, canvas.width, 2)

      if (!gameStarted) {
        // Draw start message
        ctx.fillStyle = "#374151"
        ctx.font = "20px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Pressione ESPAÇO ou Clique para Começar", canvas.width / 2, 100)

        // Draw frog
        drawFrog(frog.x, frog.y, false, animationFrameRef.current)

        gameLoopRef.current = requestAnimationFrame(gameLoop)
        return
      }

      if (isGameOver) {
        // Draw game over
        ctx.fillStyle = "#ef4444"
        ctx.font = "30px Arial"
        ctx.textAlign = "center"
        ctx.fillText("GAME OVER", canvas.width / 2, 80)
        ctx.font = "16px Arial"
        ctx.fillText("Pressione ESPAÇO para Reiniciar", canvas.width / 2, 110)

        gameLoopRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Update frog
      frog.velocityY += gravity
      frog.y += frog.velocityY

      if (frog.y >= groundY) {
        frog.y = groundY
        frog.velocityY = 0
        frog.jumping = false
      }

      // Draw frog
      drawFrog(frog.x, frog.y, frog.jumping, animationFrameRef.current)

      // Spawn obstacles (snakes)
      if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 200) {
        if (Math.random() < 0.02) {
          obstacles.push({
            x: canvas.width,
            width: 40,
            height: 30,
            frame: 0,
          })
        }
      }

      // Update and draw obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i]
        obstacle.x -= gameSpeed
        obstacle.frame++

        // Draw snake
        drawSnake(obstacle.x, groundY + frog.height - obstacle.height, obstacle.width, obstacle.height, obstacle.frame)

        // Check collision
        if (
          frog.x < obstacle.x + obstacle.width &&
          frog.x + frog.width > obstacle.x &&
          frog.y + frog.height > groundY + frog.height - obstacle.height
        ) {
          isGameOver = true
          if (currentScore > highScore) {
            setHighScore(currentScore)
            localStorage.setItem("frog-high-score", currentScore.toString())
          }
        }

        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
          obstacles.splice(i, 1)
          currentScore += 10
          setScore(currentScore)

          if (currentScore % 50 === 0) {
            gameSpeed += 0.5
          }
        }
      }

      // Draw score
      ctx.fillStyle = "#374151"
      ctx.font = "16px Arial"
      ctx.textAlign = "left"
      ctx.fillText(`Pontos: ${currentScore}`, 10, 30)
      ctx.fillText(`Recorde: ${highScore}`, 10, 50)
      ctx.fillText(`Velocidade: ${gameSpeed.toFixed(1)}x`, 10, 70)

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      document.removeEventListener("keydown", handleKeyPress)
      canvas.removeEventListener("click", handleClick)
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameStarted, highScore])

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} width={600} height={200} className="rounded-md border-2 border-border bg-sky-100" />
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Pontos: {score}</span>
        <span>Recorde: {highScore}</span>
      </div>
      <Button
        onClick={() => {
          setGameStarted(true)
          setScore(0)
        }}
        size="sm"
      >
        {gameStarted ? "Reiniciar" : "Começar"}
      </Button>
    </div>
  )
}
