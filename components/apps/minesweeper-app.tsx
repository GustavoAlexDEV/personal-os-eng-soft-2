"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCwIcon, FlagIcon } from "lucide-react"

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

const ROWS = 10
const COLS = 10
const MINES = 15

export function MinesweeperApp() {
  const [board, setBoard] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [flagMode, setFlagMode] = useState(false)
  const [firstClick, setFirstClick] = useState(true)

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const newBoard: Cell[][] = Array(ROWS)
      .fill(null)
      .map(() =>
        Array(COLS)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0,
          })),
      )

    let minesPlaced = 0

    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS)
      const col = Math.floor(Math.random() * COLS)

      // Don't place mine in center area (where first click usually happens)
      if (Math.abs(row - Math.floor(ROWS / 2)) <= 2 && Math.abs(col - Math.floor(COLS / 2)) <= 2) {
        continue
      }

      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true
        minesPlaced++
      }
    }

    // Calculate neighbor mines
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr
              const newCol = col + dc
              if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && newBoard[newRow][newCol].isMine) {
                count++
              }
            }
          }
          newBoard[row][col].neighborMines = count
        }
      }
    }

    setBoard(newBoard)
    setGameOver(false)
    setGameWon(false)
    setFirstClick(true)
  }

  const revealCell = (row: number, col: number) => {
    if (gameOver || gameWon || board[row][col].isRevealed || board[row][col].isFlagged) return

    const newBoard = [...board.map((r) => [...r])]

    if (firstClick && newBoard[row][col].isMine) {
      // Regenerate board until first click is safe
      while (true) {
        let minesPlaced = 0
        const tempBoard: Cell[][] = Array(ROWS)
          .fill(null)
          .map(() =>
            Array(COLS)
              .fill(null)
              .map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
              })),
          )

        while (minesPlaced < MINES) {
          const r = Math.floor(Math.random() * ROWS)
          const c = Math.floor(Math.random() * COLS)

          // Ensure no mines in clicked cell and surrounding cells
          if (Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1) {
            continue
          }

          if (!tempBoard[r][c].isMine) {
            tempBoard[r][c].isMine = true
            minesPlaced++
          }
        }

        // Calculate neighbor mines
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (!tempBoard[r][c].isMine) {
              let count = 0
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  const nr = r + dr
                  const nc = c + dc
                  if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && tempBoard[nr][nc].isMine) {
                    count++
                  }
                }
              }
              tempBoard[r][c].neighborMines = count
            }
          }
        }

        // Check if first click is safe
        if (!tempBoard[row][col].isMine && tempBoard[row][col].neighborMines === 0) {
          // Set new board with safe first click
          const reveal = (r: number, c: number) => {
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return
            if (tempBoard[r][c].isRevealed || tempBoard[r][c].isFlagged) return

            tempBoard[r][c].isRevealed = true

            if (tempBoard[r][c].neighborMines === 0 && !tempBoard[r][c].isMine) {
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  reveal(r + dr, c + dc)
                }
              }
            }
          }

          reveal(row, col)
          setBoard(tempBoard)
          setFirstClick(false)
          return
        }
      }
    }

    if (newBoard[row][col].isMine) {
      // Game over - reveal all mines
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newBoard[r][c].isMine) {
            newBoard[r][c].isRevealed = true
          }
        }
      }
      setBoard(newBoard)
      setGameOver(true)
      return
    }

    // Reveal cell and neighbors if no adjacent mines
    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return
      if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) return

      newBoard[r][c].isRevealed = true

      if (newBoard[r][c].neighborMines === 0 && !newBoard[r][c].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc)
          }
        }
      }
    }

    reveal(row, col)
    setBoard(newBoard)
    setFirstClick(false)

    // Check win condition
    let allNonMinesRevealed = true
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newBoard[r][c].isMine && !newBoard[r][c].isRevealed) {
          allNonMinesRevealed = false
          break
        }
      }
    }
    if (allNonMinesRevealed) {
      setGameWon(true)
    }
  }

  const toggleFlag = (row: number, col: number) => {
    if (gameOver || gameWon || board[row][col].isRevealed) return

    const newBoard = [...board.map((r) => [...r])]
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged
    setBoard(newBoard)
  }

  const handleCellClick = (row: number, col: number) => {
    if (flagMode) {
      toggleFlag(row, col)
    } else {
      revealCell(row, col)
    }
  }

  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) return "🚩"
    if (!cell.isRevealed) return ""
    if (cell.isMine) return "💣"
    if (cell.neighborMines === 0) return ""
    return cell.neighborMines
  }

  const getCellColor = (cell: Cell) => {
    if (!cell.isRevealed) return "bg-muted hover:bg-muted/80"
    if (cell.isMine) return "bg-destructive"
    return "bg-background"
  }

  const getNumberColor = (num: number) => {
    const colors = [
      "",
      "text-blue-600",
      "text-green-600",
      "text-red-600",
      "text-purple-600",
      "text-orange-600",
      "text-cyan-600",
      "text-pink-600",
      "text-gray-600",
    ]
    return colors[num] || ""
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={initializeGame} size="sm">
          <RefreshCwIcon className="mr-2 h-4 w-4" />
          Novo Jogo
        </Button>
        <Button
          onClick={() => setFlagMode(!flagMode)}
          size="sm"
          variant={flagMode ? "default" : "outline"}
          className={flagMode ? "bg-primary" : ""}
        >
          <FlagIcon className="mr-2 h-4 w-4" />
          {flagMode ? "Modo Bandeira" : "Modo Revelar"}
        </Button>
      </div>

      {/* Status */}
      {gameOver && <div className="rounded-md bg-destructive px-4 py-2 text-white font-semibold">Você perdeu! 💥</div>}
      {gameWon && <div className="rounded-md bg-green-600 px-4 py-2 text-white font-semibold">Você venceu! 🎉</div>}

      {/* Board */}
      <div className="inline-block rounded-md border-2 border-border p-2 bg-muted/50">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`flex h-8 w-8 items-center justify-center rounded border border-border text-sm font-bold transition-colors ${getCellColor(cell)} ${
                  cell.isRevealed && !cell.isMine ? getNumberColor(cell.neighborMines) : ""
                }`}
                disabled={gameOver || gameWon}
              >
                {getCellContent(cell)}
              </button>
            )),
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {MINES} minas escondidas • Clique para revelar • Bandeira para marcar
      </p>
    </div>
  )
}
