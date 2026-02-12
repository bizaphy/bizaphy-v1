"use client";

import { useEffect, useRef } from "react";

type GlitchGridProps = {
  /** Opacidad general del canvas (0-1). */
  opacity?: number;
};

type Cell = {
  brightness: number;
  target: number;
  glitchTimer: number;
  offsetX: number;
  hue: number;
};

/**
 * Fondo animado con grilla de bloques que sufren corrupción glitch esporádica.
 * Renderiza un canvas a pantalla completa detrás del contenido (client component).
 */
export default function GlitchGrid({ opacity = 0.15 }: GlitchGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellSize = 20;
    let cols = 0;
    let rows = 0;
    let grid: Cell[][] = [];

    /**
     * Inicializa la grilla con celdas en estado base.
     */
    const initGrid = () => {
      cols = Math.ceil(canvas.width / cellSize) + 1;
      rows = Math.ceil(canvas.height / cellSize) + 1;
      grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({
          brightness: Math.random() * 0.08,
          target: Math.random() * 0.08,
          glitchTimer: 0,
          offsetX: 0,
          hue: 292,
        }))
      );
    };

    /**
     * Ajusta el canvas al viewport y reinicia la grilla.
     */
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGrid();
    };

    resize();
    window.addEventListener("resize", resize);

    let lastGlitch = 0;
    let animationId: number;

    /**
     * Dispara glitches aleatorios en filas o bloques individuales.
     *
     * @param now - Timestamp actual en ms.
     */
    const triggerGlitches = (now: number) => {
      if (now - lastGlitch < 2000) return;
      if (Math.random() > 0.4) return;

      lastGlitch = now;

      if (Math.random() > 0.5) {
        // Glitch de fila completa
        const row = Math.floor(Math.random() * rows);
        const shift = (Math.random() - 0.5) * cellSize * 3;
        for (let c = 0; c < cols; c++) {
          grid[row][c].glitchTimer = 12 + Math.floor(Math.random() * 8);
          grid[row][c].offsetX = shift;
          grid[row][c].brightness = 0.4 + Math.random() * 0.5;
          grid[row][c].hue = Math.random() > 0.5 ? 292 : 190;
        }
      } else {
        // Glitch de bloques dispersos
        const count = 3 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
          const r = Math.floor(Math.random() * rows);
          const c = Math.floor(Math.random() * cols);
          grid[r][c].glitchTimer = 10 + Math.floor(Math.random() * 15);
          grid[r][c].brightness = 0.5 + Math.random() * 0.5;
          grid[r][c].offsetX = (Math.random() - 0.5) * cellSize;
          grid[r][c].hue = Math.random() > 0.3 ? 292 : 190;
        }
      }
    };

    /**
     * Dibuja un frame de la animación.
     *
     * @param now - Timestamp del requestAnimationFrame.
     */
    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      triggerGlitches(now);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = grid[r][c];

          if (cell.glitchTimer > 0) {
            cell.glitchTimer--;
            if (cell.glitchTimer === 0) {
              cell.offsetX = 0;
              cell.target = Math.random() * 0.08;
              cell.hue = 292;
            }
          } else {
            // Transición suave al brillo base
            cell.brightness += (cell.target - cell.brightness) * 0.03;
            if (Math.random() < 0.005) {
              cell.target = Math.random() * 0.12;
            }
          }

          if (cell.brightness < 0.01) continue;

          const x = c * cellSize + cell.offsetX;
          const y = r * cellSize;

          // Bloque principal
          ctx.fillStyle = `hsla(${cell.hue}, 80%, 65%, ${cell.brightness})`;
          ctx.fillRect(x, y, cellSize - 1, cellSize - 1);

          // Chromatic split durante glitch
          if (cell.glitchTimer > 0 && cell.brightness > 0.3) {
            ctx.fillStyle = `hsla(330, 90%, 60%, ${cell.brightness * 0.3})`;
            ctx.fillRect(x - 2, y, cellSize - 1, cellSize - 1);
            ctx.fillStyle = `hsla(190, 90%, 60%, ${cell.brightness * 0.3})`;
            ctx.fillRect(x + 2, y, cellSize - 1, cellSize - 1);
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
