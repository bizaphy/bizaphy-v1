"use client";

import { useEffect, useRef } from "react";

type MatrixRainProps = {
  /** Opacidad general del canvas (0-1). */
  opacity?: number;
};

/**
 * Fondo animado con lluvia de caracteres estilo Matrix en tonos fuchsia.
 * Renderiza un canvas a pantalla completa detrás del contenido (client component).
 */
export default function MatrixRain({ opacity = 0.12 }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/{}[]";
    const fontSize = 14;
    let columns = 0;
    let drops: number[] = [];

    /**
     * Ajusta el canvas al tamaño del viewport y reinicia las columnas.
     */
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () =>
        Math.random() * -canvas.height / fontSize
      );
    };

    resize();
    window.addEventListener("resize", resize);

    let animationId: number;

    /**
     * Dibuja un frame de la animación matrix rain.
     */
    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Cabeza brillante
        ctx.fillStyle = "rgba(232, 121, 249, 0.9)";
        ctx.fillText(char, x, y);

        // Estela más tenue
        if (drops[i] > 0) {
          ctx.fillStyle = "rgba(217, 70, 239, 0.3)";
          ctx.fillText(
            chars[Math.floor(Math.random() * chars.length)],
            x,
            y - fontSize
          );
        }

        drops[i]++;

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
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
