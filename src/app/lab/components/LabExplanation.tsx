"use client";

import { useState } from "react";
import type { LabExplanation as LabExplanationType } from "@/lib/lab-explanations";

/**
 * Renderiza la explicación de código de un lab siguiendo
 * la estructura del skill code-explanation (5 secciones).
 * El contenido se muestra/oculta con un botón toggle.
 *
 * @param explanation - Objeto con las 5 secciones de la explicación.
 * @returns Botón + sección colapsable con estilo neon.
 *
 * @example
 * ```tsx
 * <LabExplanation explanation={explanationData} />
 * ```
 */
export default function LabExplanation({
  explanation,
}: {
  explanation: LabExplanationType;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 rounded-lg border border-fuchsia-500 text-fuchsia-400 text-sm font-semibold transition hover:bg-fuchsia-500/20"
      >
        {open ? "Ocultar explicación" : "Explanation"}
      </button>

      {open && (
        <section className="mt-6 space-y-8">
          <h2 className="text-2xl font-semibold text-fuchsia-400 border-b border-fuchsia-500/30 pb-2">
            Explicación del código
          </h2>

          {/* 0. Estructura del código */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              0. Estructura del código
            </h3>
            <pre className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 overflow-x-auto text-sm text-zinc-300 leading-relaxed">
              <code>{explanation.code}</code>
            </pre>
          </div>

          {/* 1. ¿Qué hace en general? */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              1. ¿Qué hace en general?
            </h3>
            <p className="text-zinc-300 leading-relaxed">
              {explanation.general}
            </p>
          </div>

          {/* 2. ¿Por qué no funciona la solución obvia? */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              2. ¿Por qué no funciona la solución obvia?
            </h3>
            <p className="text-zinc-300 leading-relaxed">
              {explanation.naiveApproach}
            </p>
          </div>

          {/* 3. La estructura/herramienta clave */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              3. La estructura/herramienta clave
            </h3>
            <p className="text-zinc-300 leading-relaxed">
              {explanation.keyTool}
            </p>
          </div>

          {/* 4. Paso a paso */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              4. Paso a paso
            </h3>
            <div className="space-y-4">
              {explanation.steps.map((step, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
                >
                  <h4 className="text-sm font-semibold text-fuchsia-300 mb-1">
                    Paso {i + 1}: {step.title}
                  </h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Veredicto final */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              5. Veredicto final
            </h3>
            <p className="text-zinc-300 leading-relaxed">
              {explanation.verdict}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
