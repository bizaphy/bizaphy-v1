# Tutorial: construir el proyecto Tic Tac Toe desde cero

Este tutorial construye el juego **Tic Tac Toe** de la [Fase 3](./03-registry-projects.md) paso a paso. La idea es explicar **cada estructura de datos en el momento de crearla** y justificar por qué se elige esa forma en lugar de otras.

El resultado final vive en [src/content/projects/tic-tac-toe/TicTacToe.tsx](../content/projects/tic-tac-toe/TicTacToe.tsx). Si en algún momento se pierde el hilo, revisar ese archivo.

---

## Objetivo: qué vamos a construir

Un componente React de un juego Tic Tac Toe funcional con estas capacidades:

- **Tablero 3×3** con celdas clickeables.
- **Turnos alternos**: X juega primero, luego O, luego X, etc.
- **Detección de ganador**: cuando se completa una línea (horizontal, vertical o diagonal), se anuncia el ganador y las celdas ganadoras se resaltan.
- **Detección de empate**: si se llenan las 9 celdas sin ganador, se muestra "Empate".
- **Bloqueo tras victoria**: cuando alguien gana, las celdas vacías dejan de ser clickeables.
- **Botón de reinicio**: vacía el tablero y devuelve el turno a X.
- **Estilo neon** consistente con el resto del proyecto (fuchsia, glow, bordes).

Visualmente:

```
      Turno: X

      ┌─────┬─────┬─────┐
      │  X  │     │  O  │
      ├─────┼─────┼─────┤
      │     │  X  │     │
      ├─────┼─────┼─────┤
      │  O  │     │  X  │  ← si X gana, esta diagonal
      └─────┴─────┴─────┘     se pinta fuchsia con glow

           [ Reiniciar ]
```

**Alcance:** un solo componente React en un solo archivo. Sin librerías extras, sin IA, sin persistencia entre recargas. Cuando la pestaña se cierra, el estado se pierde.

---

## Prerrequisitos

- Haber completado las Fases 1 y 2 (el sistema visual neon ya existe).
- Tener la estructura de Registry de la Fase 3 al menos empezada (aunque solo sea con la carpeta `src/content/projects/` creada).
- Conocer React básico: `useState`, JSX, eventos `onClick`.

---

## Estructura del tutorial

Vamos a construir el archivo en este orden:

1. Crear la carpeta y el archivo vacío.
2. Definir los **tipos de datos** (`CellValue`, `Board`).
3. Definir la constante **`WINNING_LINES`**.
4. Escribir la función pura **`evaluateBoard`**.
5. Crear el esqueleto del componente con **`useState`**.
6. Añadir el **estado derivado** (ganador, empate, texto de status).
7. Escribir los **handlers** de click y reset.
8. Construir la **UI**: título de status, grid de celdas, botón.
9. Registrar el proyecto en el sistema.

Cada paso deja el código en un estado **funcional** o al menos compilable, para poder verificarlo antes de seguir.

---

## Paso 1 — Crear la estructura de archivos

Dentro de `src/content/projects/`, crear la carpeta y los dos archivos:

```
src/content/projects/tic-tac-toe/
├── TicTacToe.tsx    ← componente (vacío por ahora)
└── index.ts         ← re-export
```

**`index.ts`:**

```ts
// src/content/projects/tic-tac-toe/index.ts
export { default } from "./TicTacToe";
```

**`TicTacToe.tsx`** (esqueleto mínimo para que compile):

```tsx
// src/content/projects/tic-tac-toe/TicTacToe.tsx
"use client";

export default function TicTacToe() {
  return <div>Tic Tac Toe</div>;
}
```

**Por qué `"use client"` desde el principio.** El componente va a usar `useState` y `onClick`. Sin la directiva, Next.js intenta ejecutarlo como Server Component y falla en build. Es más fácil ponerla al inicio que recordar añadirla después.

**Por qué la carpeta y el `index.ts`.** Explicado en la Fase 3. Resumen: permite que el proyecto crezca a varios archivos sin romper los imports externos, que siempre apuntan a `"./tic-tac-toe"`.

---

## Paso 2 — Definir los tipos de datos

Antes de escribir lógica, definimos **cómo se ve una celda y cómo se ve el tablero**. Los tipos son documentación ejecutable: el compilador los usa para verificar el código.

Añadir arriba del componente:

```tsx
type CellValue = "X" | "O" | null;
type Board = CellValue[];
```

### Explicación

**`CellValue`** — una celda puede tener 3 valores posibles:

- `"X"` — jugador X ocupó la celda.
- `"O"` — jugador O ocupó la celda.
- `null` — celda vacía.

**¿Por qué `null` y no `undefined` o `""`?**

- `null` significa "explícitamente vacío". Es intencional.
- `undefined` significa "no se asignó nada todavía". Más ambiguo.
- `""` (string vacío) mezcla dos dominios: el tipo dejaría de ser `"X" | "O" | ""` — un string vacío no es un valor "de juego", es un valor "textual" y confunde la intención.

Con `null` la máquina de estados es limpia: cada celda **es** una de tres cosas.

**`Board`** — el tablero es simplemente un array de 9 celdas. Usamos `CellValue[]` en lugar de repetir `("X" | "O" | null)[]` en cada firma de función.

### ¿Por qué un array plano y no una matriz 3×3?

Podríamos modelar el tablero como `CellValue[][]` (array de arrays):

```ts
type Board = CellValue[][];
// [[null, null, null],
//  [null, null, null],
//  [null, null, null]]
```

O como un objeto con coordenadas:

```ts
type Board = Record<`${0|1|2},${0|1|2}`, CellValue>;
```

Elegimos el array plano de 9 posiciones por 3 razones:

1. **Simpler indexing**: `board[0]` en lugar de `board[0][0]`.
2. **`useState<Board>(Array(9).fill(null))`** es una línea. Con matriz sería `Array(3).fill(null).map(() => Array(3).fill(null))`.
3. **`WINNING_LINES`** se expresa como índices `0..8`, que son más compactos que pares `[row, col]`.

El precio es que "fila 2, columna 1" no es evidente: hay que saber que el índice es `2*3 + 1 = 7`. Pero como el tablero es fijo 3×3, este cálculo mental es aceptable.

---

## Paso 3 — Definir `WINNING_LINES`

Necesitamos saber qué combinaciones de celdas forman una victoria. En un tablero 3×3 hay **8 líneas ganadoras**: 3 horizontales, 3 verticales, 2 diagonales.

Numeramos las celdas de 0 a 8:

```
 0 | 1 | 2
-----------
 3 | 4 | 5
-----------
 6 | 7 | 8
```

Las líneas ganadoras son:

- **Horizontales**: `[0,1,2]`, `[3,4,5]`, `[6,7,8]`
- **Verticales**: `[0,3,6]`, `[1,4,7]`, `[2,5,8]`
- **Diagonales**: `[0,4,8]`, `[2,4,6]`

Añadir arriba del componente (después de los tipos):

```tsx
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
```

### ¿Por qué `const` fuera del componente?

Si declaráramos `WINNING_LINES` dentro de la función `TicTacToe`, se **recrearía en cada render**. Cada click provocaría re-crear un array de 8 elementos, cada uno con su propio subarray. Es waste de memoria y del garbage collector.

Al declararlo fuera:
- Se crea **una sola vez** cuando el módulo se carga.
- Todas las instancias del componente comparten la misma referencia.
- Su valor **no depende** de props ni state, así que no tiene sentido que viva dentro del componente.

**Regla:** constantes que no dependen de props/state van fuera del componente. Sólo lo que necesita reaccionar a cambios vive dentro.

### ¿Por qué el nombre en MAYÚSCULAS?

Convención de JavaScript: `SNAKE_CASE_MAYÚSCULA` para constantes de módulo con valor conocido en tiempo de escritura. Distingue visualmente entre:

- Constantes de módulo (mayúscula): `WINNING_LINES`, `MAX_PLAYERS`, `API_URL`.
- Variables locales: `board`, `winner`, `newBoard`.

Es opcional en TypeScript, pero mantener la convención ayuda al lector a distinguir "esto no cambia nunca" de "esto es una variable".

---

## Paso 4 — La función `evaluateBoard`

Con los tipos y `WINNING_LINES` definidos, ya podemos escribir la función que decide si hay ganador.

Añadir después de `WINNING_LINES`:

```tsx
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
```

### Explicación línea por línea

**Firma:**

```ts
function evaluateBoard(board: Board): {
  winner: CellValue;
  line: number[] | null;
}
```

Recibe el tablero y devuelve un objeto con dos campos:
- `winner`: `"X"`, `"O"` o `null` si aún no hay ganador.
- `line`: los índices de las celdas ganadoras, o `null` si no hay.

**¿Por qué devolver también la línea?**

Podríamos devolver solo `winner: CellValue`. Pero luego, al renderizar, tendríamos que **recalcular** qué celdas resaltar. Devolver `line` de una vez evita duplicar el trabajo.

**El loop:**

```ts
for (const [a, b, c] of WINNING_LINES) {
```

`WINNING_LINES` es un array de arrays. Cada iteración desestructura una línea en 3 índices: `a`, `b`, `c`. Por ejemplo, en la primera iteración `a=0, b=1, c=2`.

**La condición ganadora:**

```ts
if (board[a] && board[a] === board[b] && board[a] === board[c]) {
```

Se lee: "la celda `a` no está vacía **Y** las tres celdas tienen el mismo valor".

- `board[a]` — chequeo de que no sea `null` (porque `null && cualquier cosa === null`, que es falsy).
- `board[a] === board[b]` — misma marca en la primera y segunda celda.
- `board[a] === board[c]` — misma marca en la primera y tercera celda.

**¿Por qué no `board[a] === board[b] === board[c]`?** Porque en JS `a === b === c` se evalúa como `(a === b) === c`, comparando un boolean con `c`. No hace lo que queremos.

**El return:**

```ts
return { winner: board[a], line: [a, b, c] };
```

Si encontramos una línea ganadora, devolvemos inmediatamente. Como ya verificamos que las 3 celdas son iguales, `board[a]` **es** el ganador.

**El return final:**

```ts
return { winner: null, line: null };
```

Si el loop termina sin encontrar una línea ganadora, no hay ganador.

### ¿Por qué es una función pura fuera del componente?

**Pura** significa: mismo input → mismo output, sin efectos secundarios. Ventajas:

1. **Testeable en aislamiento**: no necesita React ni el DOM para probarla.
2. **No depende de props ni state**: puede recibir cualquier `Board` y responder.
3. **No se recrea en cada render** (por estar fuera del componente).

**Regla:** cualquier lógica que se pueda expresar como "input → output" sin tocar hooks va como función pura, fuera del componente.

---

## Paso 5 — Esqueleto del componente con `useState`

Ahora empezamos el componente. Reemplazar el `return <div>Tic Tac Toe</div>` por:

```tsx
export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);

  return <div>Tic Tac Toe (con estado)</div>;
}
```

Y añadir el import:

```tsx
import { useState } from "react";
```

### Explicación

**`useState<Board>(Array(9).fill(null))`**

- **`useState`** — el hook de React para estado local. Devuelve `[valor, setter]`.
- **`<Board>`** — parámetro genérico. Dice explícitamente "este estado es de tipo `Board`". Sin el genérico, TS podría inferir un tipo demasiado ancho (por ejemplo, `any[]` o `null[]`).
- **`Array(9).fill(null)`** — crea un array de 9 elementos, cada uno con valor `null`. El resultado: 9 celdas vacías.

**¿Por qué `Array(9).fill(null)` y no `[null, null, null, null, null, null, null, null, null]`?**

Es más corto y menos propenso a errores (contar 9 `null` a mano es tedioso). El `.fill(null)` **muta** el array recién creado, poniendo `null` en cada posición. Como el array recién nace, no hay problema de mutación compartida.

**Cuidado:** `Array(9).fill([])` sería un bug. Todos los índices apuntarían al **mismo** array vacío por referencia — mutarlo en un índice mutaría todos. Con valores primitivos (`null`, números, strings) esto no pasa.

**`useState<boolean>(true)`**

- Guarda si el próximo turno es de X. Empieza en `true` (X juega primero).
- El nombre `xIsNext` es más claro que `turn` o `player`: al leerlo se entiende "verdadero significa que X va después".

### ¿Por qué dos `useState` separados en lugar de un objeto?

Podríamos hacer:

```ts
const [state, setState] = useState({ board: Array(9).fill(null), xIsNext: true });
```

Pero entonces:
- Actualizar solo `board` requiere `setState({ ...state, board: newBoard })` (spread manual).
- Cada `setState` re-renderiza igual, no ganamos nada en performance.
- Es más código para el mismo resultado.

**Regla:** cuando dos piezas de estado son independientes y no siempre cambian juntas, se separan en dos `useState`. Cuando cambian juntas (como los flags de un formulario), tal vez conviene agruparlas.

---

## Paso 6 — Estado derivado

Necesitamos calcular:
- ¿Hay ganador?
- ¿Es empate?
- ¿Qué texto mostrar arriba del tablero?

Estos valores se **derivan** de `board` y `xIsNext`. **No van en `useState`** porque no son estado independiente — son consecuencias del estado actual.

Añadir dentro del componente, después de los `useState`:

```tsx
const { winner, line: winningLine } = evaluateBoard(board);
const isDraw = !winner && board.every((cell) => cell !== null);

const statusText = winner
  ? `Ganador: ${winner}`
  : isDraw
    ? "Empate"
    : `Turno: ${xIsNext ? "X" : "O"}`;
```

### Explicación

**`const { winner, line: winningLine } = evaluateBoard(board);`**

- Llamamos a la función pura pasándole el tablero actual.
- Desestructuramos el resultado.
- **`line: winningLine`** renombra la propiedad `line` a `winningLine` en el scope local. Lo hacemos porque `line` es un nombre muy genérico (podría chocar con otras variables o con conceptos del DOM); `winningLine` deja claro que **es** la línea que ganó.

**`const isDraw = !winner && board.every((cell) => cell !== null);`**

- `!winner` — no hay ganador todavía.
- `board.every((cell) => cell !== null)` — todas las celdas están ocupadas.
- Solo cuando **ambas** condiciones se cumplen, es empate.

**¿Por qué en este orden?** Si hay ganador, no importa si el tablero está lleno o no. Chequear `!winner` primero es un short-circuit: si hay ganador, `every` no se ejecuta. Micro-optimización, pero también más claro semánticamente.

**`statusText`** — ternario anidado. Se lee:

- Si hay ganador: mostrar "Ganador: X" o "Ganador: O".
- Si no, y es empate: mostrar "Empate".
- Si no, mostrar "Turno: X" o "Turno: O".

El orden de las condiciones importa: si preguntáramos por `isDraw` primero, saltaríamos la posibilidad de que la última jugada fue la ganadora Y llenó el tablero al mismo tiempo.

### ¿Por qué NO usar `useState` para estos valores?

Podríamos hacer:

```ts
// MAL
const [winner, setWinner] = useState<CellValue>(null);
const [isDraw, setIsDraw] = useState<boolean>(false);
const [statusText, setStatusText] = useState<string>("Turno: X");
```

Pero entonces cada `handleClick` tendría que:
1. Actualizar `board`.
2. Recalcular `winner` y hacer `setWinner`.
3. Recalcular `isDraw` y hacer `setIsDraw`.
4. Recalcular `statusText` y hacer `setStatusText`.

Cuatro `setState` en lugar de uno. Y si olvidamos uno, el estado queda **inconsistente** (por ejemplo, `winner === "X"` pero `statusText === "Turno: O"`). Es la fuente clásica de bugs de sincronización.

**Regla:** el estado que se puede **derivar** en tiempo de render se calcula, no se guarda. Menos `useState` = menos bugs.

---

## Paso 7 — Handlers

Necesitamos dos:

- **`handleClick(index)`** — cuando el usuario clickea una celda.
- **`handleReset()`** — cuando el usuario clickea "Reiniciar".

Añadir dentro del componente, después del estado derivado:

```tsx
import { useState, useCallback } from "react";  // ← añadir useCallback al import

// ...

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

const handleReset = useCallback(() => {
  setBoard(Array(9).fill(null));
  setXIsNext(true);
}, []);
```

### Explicación de `handleClick`

**Firma:** recibe el `index` de la celda clickeada (0 a 8).

**Guard clause:**

```ts
if (board[index] || winner) return;
```

- `board[index]` truthy — la celda ya está ocupada, no hacer nada.
- `winner` truthy — ya hay ganador, el juego terminó.

Salir temprano evita el árbol de `if/else` anidados. Se lee como: "si no debemos hacer nada, salir; el resto del código asume que la jugada es válida".

**La mutación (inmutable):**

```ts
const newBoard = [...board];
newBoard[index] = xIsNext ? "X" : "O";
```

- **`[...board]`** — spread. Crea una **copia** superficial del array. `newBoard` es un array nuevo, con las mismas referencias adentro. Como los valores son strings o `null`, no hay problema de compartir referencias.
- **`newBoard[index] = ...`** — modifica la copia. El array original `board` **no cambia**.

**¿Por qué no `board[index] = "X"` directamente?**

React detecta cambios comparando **por referencia**. Si mutamos `board` directamente, la referencia sigue siendo la misma y React no re-renderiza. Además, `board` viene de `useState`, y mutar el valor de un `useState` sin usar el setter es un error clásico que produce UIs "congeladas" o desincronizadas.

**Regla:** nunca mutar estado directamente. Siempre crear una copia, modificarla y pasarla al setter.

**Los `setState`:**

```ts
setBoard(newBoard);
setXIsNext(!xIsNext);
```

- Actualiza el tablero con la copia modificada.
- Invierte el turno: si era X, ahora es O, y viceversa.

React agrupa (batches) estas dos actualizaciones — se produce **un solo re-render**, no dos.

**`useCallback` con dependencias `[board, xIsNext, winner]`:**

- **`useCallback`** memoiza la función. Devuelve la misma referencia entre renders **mientras las dependencias no cambien**.
- **Dependencias**: las variables del scope que la función usa. Si `board`, `xIsNext` o `winner` cambian, se crea una función nueva (con los valores actualizados).
- **¿Es necesario aquí?** No estrictamente. `handleClick` no se pasa a componentes memoizados, así que el "beneficio" de la memoización se pierde. Pero mantiene el hábito y no hace daño.

### Explicación de `handleReset`

```ts
const handleReset = useCallback(() => {
  setBoard(Array(9).fill(null));
  setXIsNext(true);
}, []);
```

- Vuelve a poner el tablero vacío y el turno en X.
- **Dependencias `[]`**: la función no usa nada del scope que pueda cambiar. Solo llama a los setters, que son estables.

---

## Paso 8 — UI: status text

Ahora construimos el render. Empezamos por el texto de status arriba.

Reemplazar el `return <div>...</div>` por:

```tsx
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

    {/* grid del tablero — Paso 9 */}
    {/* botón reset — Paso 10 */}
  </section>
);
```

### Explicación

**`<section className="flex flex-col items-center gap-6">`**

- **`flex flex-col`** — hijos apilados verticalmente.
- **`items-center`** — centrados horizontalmente.
- **`gap-6`** — separación de `1.5rem` entre hijos (título, tablero, botón).

**El `<h2>` con className condicional:**

- **`text-2xl font-bold`** — tamaño y peso base.
- **`transition`** — anima suavemente los cambios de color.
- **Color según estado**:
  - `winner` → fuchsia con glow (drop-shadow con el color neon).
  - `isDraw` → zinc (gris) — feedback neutro para empate.
  - En juego → blanco — legible sin distraer.

**`drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]`** — utility arbitraria de Tailwind. Sintaxis: `[valor_css]`. Aquí aplica un glow fuchsia de 10px cuando hay ganador.

**Regla:** para estilos condicionales complejos, template literal + ternarios anidados es aceptable. Si crece más, extraer a una función helper (`getStatusClasses(winner, isDraw)`).

---

## Paso 9 — UI: grid del tablero

Añadir dentro del `<section>`, después del `<h2>`:

```tsx
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
```

### Explicación

**`<div className="grid grid-cols-3 gap-2">`**

- **`grid`** + **`grid-cols-3`** — CSS Grid con 3 columnas. Las 9 celdas se acomodan automáticamente en 3 filas de 3.
- **`gap-2`** — separación entre celdas.

**`board.map((cell, i) => ...)`**

- Iteramos las 9 celdas. `cell` es su valor (`"X"`, `"O"` o `null`); `i` es el índice (0-8).

**`const isWinCell = winningLine?.includes(i) ?? false;`**

- `winningLine?.includes(i)` — encadenamiento opcional. Si `winningLine` es `null`, la expresión da `undefined`. Si es un array, chequea si `i` está en él.
- `?? false` — nullish coalescing. Si el resultado es `null` o `undefined`, usar `false`. Esto asegura que `isWinCell` sea siempre un boolean.

**¿Por qué no `winningLine && winningLine.includes(i)`?**

Funcionaría, pero el resultado sería `null` (o `false`) cuando `winningLine` es `null`, y `true`/`false` en otro caso. Más ruidoso. `?.` + `??` es el patrón moderno para "opcional con default".

**`key={i}`**

- React requiere una `key` estable en listas. Aquí `i` es aceptable porque las celdas **nunca cambian de posición**. En listas donde los elementos se pueden reordenar (por ejemplo, cards de proyectos), usar un ID estable en su lugar.

**`onClick={() => handleClick(i)}`**

- Función inline que llama a `handleClick` con el índice de esta celda.
- **¿Por qué no `onClick={handleClick}` directamente?** Porque `handleClick` espera un `number`, y `onClick` le pasaría un `MouseEvent`. La inline function adapta la firma.

**`disabled={!!cell || !!winner}`**

- La celda se deshabilita si ya está ocupada (`cell !== null`) o si el juego terminó.
- **`!!cell`** — doble negación. Convierte a boolean explícito. `!!null === false`, `!!"X" === true`.
- Sin los `!!`, `disabled={cell}` daría error de tipos: `disabled` espera `boolean`, no `"X" | "O" | null`.

**Estilos condicionales:**

- **`isWinCell`** — celda ganadora: fuchsia sólido con glow fuerte.
- **`cell`** (ocupada pero no ganadora) — fondo oscuro, texto fuchsia.
- **Vacía** — casi negro, con `hover:` que la ilumina cuando el usuario pasa por encima.

Los hovers **solo se aplican a celdas vacías**. Una celda ocupada no responde al hover porque ya está en su estado final.

**`{cell}`** — el texto de la celda. Si es `null`, no se renderiza nada (React ignora `null`). Si es `"X"` o `"O"`, muestra la letra.

---

## Paso 10 — UI: botón de reinicio

Añadir después del `</div>` del grid, aún dentro del `<section>`:

```tsx
<button
  onClick={handleReset}
  className="rounded-lg border border-fuchsia-500 bg-black px-6 py-2 text-fuchsia-400 transition hover:bg-fuchsia-500 hover:text-black hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]"
>
  Reiniciar
</button>
```

### Explicación

- **`onClick={handleReset}`** — sin wrapper porque `handleReset` no necesita argumentos.
- **Colores neon**: borde y texto fuchsia sobre fondo negro. En hover se **invierte**: fondo fuchsia con texto negro, y glow.
- **`transition`** — anima suavemente el cambio.

El botón está siempre visible y siempre habilitado. No hay bug en clickearlo a mitad de juego — simplemente reinicia.

---

## Archivo completo

Al final debe verse así:

```tsx
// src/content/projects/tic-tac-toe/TicTacToe.tsx
"use client";

import { useState, useCallback } from "react";

type CellValue = "X" | "O" | null;
type Board = CellValue[];

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

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);

  const { winner, line: winningLine } = evaluateBoard(board);
  const isDraw = !winner && board.every((cell) => cell !== null);

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
```

---

## Paso 11 — Registrar el proyecto

Para que aparezca en `/projects` y sea accesible en `/projects/tic-tac-toe`, hay que registrarlo en dos archivos (como explica la Fase 3):

**`src/data/projects.ts`** — añadir la metadata:

```ts
export const projects: Project[] = [
  // ... otros
  {
    slug: "tic-tac-toe",
    title: "Tic Tac Toe",
    description: "Juego clásico de Tic Tac Toe con estilo Neon.",
  },
];
```

**`src/content/projects/index.ts`** — añadir al component map:

```ts
import TicTacToe from "./tic-tac-toe";
// ...
export const projectsMap = {
  // ... otros
  "tic-tac-toe": TicTacToe,
};
```

Después de esto:

- `/projects` muestra la card "Tic Tac Toe".
- `/projects/tic-tac-toe` carga el componente.
- El tipo `ProjectSlug` incluye `"tic-tac-toe"` automáticamente.

---

## Paso 12 — Probar

```bash
npm run dev
```

Ir a `http://localhost:3000/projects/tic-tac-toe` y verificar:

1. **Título "Turno: X"** aparece arriba.
2. **9 celdas vacías** en un grid 3×3. Al pasar el cursor sobre una, se ilumina.
3. **Click en una celda**: aparece la X. El título cambia a "Turno: O". La celda queda deshabilitada.
4. **Click en otra celda**: aparece la O. El título cambia a "Turno: X".
5. **Ganar una línea** (por ejemplo, X en `0, 1, 2`): el título cambia a "Ganador: X" con glow fuchsia. Las 3 celdas ganadoras se pintan fuchsia con glow. Las celdas vacías se deshabilitan.
6. **Empate** (llenar el tablero sin ganador): el título muestra "Empate" en gris.
7. **Click en "Reiniciar"**: el tablero vuelve a vacío, turno de X.
8. **Transición al entrar**: al navegar desde `/projects` a `/projects/tic-tac-toe`, se aplica el efecto `page-glitch` (colores distorsionados por un instante).

---

## Checklist

- [ ] `src/content/projects/tic-tac-toe/TicTacToe.tsx` existe con la directiva `"use client"`.
- [ ] `src/content/projects/tic-tac-toe/index.ts` re-exporta el default.
- [ ] Los tipos `CellValue` y `Board` están definidos antes del componente.
- [ ] `WINNING_LINES` está declarado como `const` fuera del componente.
- [ ] `evaluateBoard` es una función pura fuera del componente y devuelve `{ winner, line }`.
- [ ] `useState<Board>` y `useState<boolean>` tienen sus genéricos explícitos.
- [ ] `winner`, `winningLine`, `isDraw` y `statusText` se **derivan** en el render (no viven en `useState`).
- [ ] `handleClick` tiene guard clause al principio: `if (board[index] || winner) return`.
- [ ] `handleClick` crea una copia del board con spread antes de mutarla.
- [ ] `handleReset` resetea las 9 celdas y devuelve el turno a X.
- [ ] El grid usa `grid grid-cols-3 gap-2`.
- [ ] Las celdas ganadoras se resaltan visualmente (fondo fuchsia + glow).
- [ ] El `<h2>` de status cambia de color según el estado.
- [ ] El botón "Reiniciar" siempre está visible y habilitado.
- [ ] `src/data/projects.ts` y `src/content/projects/index.ts` tienen la entrada de `"tic-tac-toe"`.

---

## Ideas para extender

Si se quiere ir más allá del alcance del tutorial:

- **Contador de partidas**: agregar `useState<{ x: number; o: number; draws: number }>` y actualizarlo al detectar el resultado.
- **Historial de movimientos**: guardar un array de tableros y permitir "deshacer".
- **IA rival**: implementar minimax para que O juegue solo. `evaluateBoard` ya es la mitad del trabajo.
- **Tamaños configurables**: parametrizar 3×3 a N×N. Requiere generar `WINNING_LINES` dinámicamente.
- **Guardar en localStorage**: persistir el estado entre recargas.

Todas estas son iteraciones **sobre** el archivo actual, no reescrituras. La estructura Registry no cambia.
