"use client";

import { useState, useCallback } from "react";

type CellValue = "X" | "O" | null;
type Board = CellValue[];

/** Todas las combinaciones de índices que forman una línea ganadora en un tablero 3x3. */
const WINNING_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Evalúa el tablero y retorna el ganador junto con la línea ganadora.
 *
 * @param board - Estado actual del tablero (9 celdas).
 * @returns Objeto con el ganador (`"X"`, `"O"` o `null`) y los índices de la línea ganadora.
 *
 * @example
 * ```ts
 * const { winner, line } = evaluateBoard(["X","X","X",null,null,null,null,null,null]);
 * // winner: "X", line: [0, 1, 2]
 * ```
 */
function evaluateBoard(board: Board): {
  winner: CellValue;
  line: number[] | null;
} {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

/**
 * Componente interactivo del juego Tic Tac Toe.
 * Maneja el estado del tablero, turnos, detección de victoria/empate y reinicio.
 */
export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);

  const { winner, line: winningLine } = evaluateBoard(board);
  const isDraw = !winner && board.every((cell) => cell !== null);

  /**
   * Maneja el click en una celda del tablero.
   * Ignora clicks en celdas ocupadas o si ya hay un ganador.
   */
  const handleClick = useCallback(
    (index: number) => {
      if (board[index] || winner) return;

      const newBoard = [...board];
      newBoard[index] = xIsNext ? "X" : "O";
      setBoard(newBoard);
      setXIsNext(!xIsNext);
    },
    [board, xIsNext, winner],
  );

  /** Reinicia el tablero a su estado inicial con X empezando. */
  const handleReset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  }, []);

  const statusText = winner
    ? `Ganador: ${winner}`
    : isDraw
      ? "Empate"
      : `Turno: ${xIsNext ? "X" : "O"}`;

  return (
    <section className="flex flex-col items-center gap-6">
      <h2
        className={`text-2xl font-bold transition ${
          winner
            ? "text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]"
            : isDraw
              ? "text-zinc-400"
              : "text-white"
        }`}
      >
        {statusText}
      </h2>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => {
          const isWinCell = winningLine?.includes(i) ?? false;

          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={!!cell || !!winner}
              className={`flex h-24 w-24 items-center justify-center rounded-lg border text-3xl font-bold transition
                ${
                  isWinCell
                    ? "border-fuchsia-400 bg-fuchsia-500 text-black shadow-[0_0_20px_rgba(217,70,239,0.6)]"
                    : cell
                      ? "border-zinc-700 bg-zinc-900 text-fuchsia-400"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-fuchsia-500 hover:bg-zinc-900 hover:shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                }`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleReset}
        className="rounded-lg border border-fuchsia-500 bg-black px-6 py-2 text-fuchsia-400 transition hover:bg-fuchsia-500 hover:text-black hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]"
      >
        Reiniciar
      </button>
    </section>
  );
}
