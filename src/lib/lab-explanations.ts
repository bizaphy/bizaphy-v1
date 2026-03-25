/**
 * Explicaciones de código para cada mini-lab.
 *
 * Cada entrada sigue la estructura del skill code-explanation:
 * 5 secciones obligatorias en español neutro.
 *
 * @see .claude/skills/code-explanation/SKILL.md
 */

export type LabExplanation = {
  slug: string;
  /** Sección 1 — ¿Qué hace en general? */
  general: string;
  /** Sección 2 — ¿Por qué no funciona la solución obvia? */
  naiveApproach: string;
  /** Sección 3 — La estructura/herramienta clave */
  keyTool: string;
  /** Sección 4 — Paso a paso */
  steps: { title: string; body: string }[];
  /** Sección 5 — Veredicto final */
  verdict: string;
};

export const labExplanations: LabExplanation[] = [
  /* ------------------------------------------------------------------ */
  /*  1. client-counter                                                  */
  /* ------------------------------------------------------------------ */
  {
    slug: "client-counter",
    general:
      `Este componente es un contador interactivo que vive completamente en el navegador. ` +
      `Recibe cero props, mantiene un número interno (count) que arranca en 0, y cada vez que ` +
      `el usuario hace click en el botón "Increment" ese número sube en 1. El valor se muestra ` +
      `en pantalla y se actualiza instantáneamente sin recargar la página. Es el ejemplo más ` +
      `puro de estado local en React: un dato que cambia con el tiempo y que el componente ` +
      `necesita recordar entre renders.`,

    naiveApproach:
      `La idea intuitiva sería declarar una variable normal: let count = 0 y luego hacer ` +
      `count++ dentro del onClick. Eso no funciona. En React, cada vez que un componente se ` +
      `re-renderiza, la función entera se ejecuta de nuevo desde arriba. Eso significa que ` +
      `let count = 0 se vuelve a ejecutar y el valor regresa a cero en cada render. Peor aún: ` +
      `aunque modificaras la variable, React no se entera de que algo cambió, así que nunca ` +
      `re-renderiza el componente y la pantalla se queda congelada mostrando 0. Una variable ` +
      `normal no sobrevive entre renders y no dispara actualizaciones visuales.`,

    keyTool:
      `useState es el hook que resuelve ambos problemas de la variable normal. Cuando escribes ` +
      `const [count, setCount] = useState(0), React reserva una "celda de memoria" para este ` +
      `componente que persiste entre renders. useState devuelve dos cosas en un array: el valor ` +
      `actual (count) y una función para cambiarlo (setCount). Cuando llamas setCount(nuevoValor), ` +
      `React hace dos cosas: guarda el nuevo valor en esa celda y agenda un re-render del componente. ` +
      `En el siguiente render, useState devuelve el valor actualizado. El 0 que le pasas es el valor ` +
      `inicial: solo se usa en el primer render, después React ignora ese argumento y devuelve lo que ` +
      `haya en la celda.`,

    steps: [
      {
        title: `"use client" — marcar como Client Component`,
        body:
          `Esta directiva le dice a Next.js que este archivo se ejecuta en el navegador, no en el ` +
          `servidor. Es obligatoria aquí porque useState es un hook de React que necesita el ciclo ` +
          `de vida del cliente. Sin esta línea, Next.js intentaría renderizar el componente en el ` +
          `servidor, donde no hay estado interactivo, y lanzaría un error.`,
      },
      {
        title: `useState(0) — crear la celda de estado`,
        body:
          `Se desestructura el array que devuelve useState en [count, setCount]. count empieza ` +
          `en 0 (el argumento inicial). setCount es la única forma válida de cambiar ese valor. ` +
          `¿Por qué no simplemente count = 5? Porque eso no notifica a React. Solo setCount ` +
          `dispara el re-render.`,
      },
      {
        title: `onClick={() => setCount(count + 1)} — el evento`,
        body:
          `Cada click ejecuta una arrow function que llama a setCount con el valor actual + 1. ` +
          `Se usa una arrow function y no setCount(count + 1) directamente porque sin la función ` +
          `envolvente, setCount se ejecutaría al momento del render, no al hacer click. Es la ` +
          `diferencia entre "pasar una función para que se ejecute después" y "ejecutar algo ahora".`,
      },
      {
        title: `{count} en el JSX — la lectura reactiva`,
        body:
          `Cuando React re-renderiza el componente después de setCount, la función se ejecuta de ` +
          `nuevo y useState devuelve el nuevo valor. La expresión {count} en el JSX lee ese valor ` +
          `y el DOM se actualiza automáticamente. No hay que manipular el DOM manualmente como en ` +
          `JavaScript vanilla.`,
      },
    ],

    verdict:
      `El componente funciona porque useState le da a React dos superpoderes sobre una variable ` +
      `normal: persistencia entre renders y notificación de cambios. Caso de éxito: el usuario ` +
      `hace click 3 veces → count pasa de 0 a 1, luego a 2, luego a 3, y cada transición ` +
      `dispara un re-render que muestra el nuevo número. Caso de fallo (con variable normal): ` +
      `el usuario hace click 3 veces → la variable local se reinicia a 0 en cada render, la ` +
      `pantalla siempre muestra 0 y parece que el botón no hace nada.`,
  },

  /* ------------------------------------------------------------------ */
  /*  2. client-clock                                                    */
  /* ------------------------------------------------------------------ */
  {
    slug: "client-clock",
    general:
      `Este componente muestra la hora actual del navegador del usuario, actualizada cada segundo. ` +
      `No recibe props. Internamente mantiene un string time en estado que representa la hora ` +
      `formateada. Al montarse, arranca un setInterval que cada 1000 ms crea un new Date(), lo ` +
      `convierte a string con toLocaleTimeString() y lo guarda en el estado. Al desmontarse, limpia ` +
      `el intervalo para evitar memory leaks. La hora se muestra en un <strong> dentro de un ` +
      `contenedor con borde.`,

    naiveApproach:
      `La idea intuitiva sería poner el setInterval directamente en el cuerpo de la función del ` +
      `componente, fuera de cualquier hook. Eso no funciona. Cada vez que setTime cambia el estado, ` +
      `React re-renderiza el componente, lo que ejecuta la función completa de nuevo, lo que crea ` +
      `un nuevo setInterval. Después de 10 segundos tendrías 10 intervalos corriendo simultáneamente. ` +
      `Después de un minuto, 60. Cada uno llamando a setTime, causando re-renders, creando más ` +
      `intervalos. Es una cascada infinita de timers que consume memoria y CPU hasta que el ` +
      `navegador se congela.`,

    keyTool:
      `useEffect es el hook que permite ejecutar "efectos secundarios" — código que interactúa ` +
      `con algo fuera de React, como timers, APIs, o el DOM directo. useEffect recibe dos ` +
      `argumentos: una función con el efecto y un array de dependencias. La función se ejecuta ` +
      `después del primer render. El array de dependencias [] vacío significa "ejecuta esto solo ` +
      `una vez, al montar". Si el array tuviera variables, el efecto se re-ejecutaría cada vez ` +
      `que alguna cambie. La función del efecto puede devolver otra función: esa es la función de ` +
      `limpieza (cleanup). React la ejecuta cuando el componente se desmonta o antes de re-ejecutar ` +
      `el efecto. Aquí, la limpieza llama a clearInterval para detener el timer.`,

    steps: [
      {
        title: `useState<string>("") — hora como string`,
        body:
          `El estado arranca como string vacío, no como la hora actual. Esto es intencional: ` +
          `en el primer render (que puede ocurrir en el servidor durante SSR) no queremos que ` +
          `el servidor genere una hora que no coincida con la del cliente. El string vacío ` +
          `evita errores de "hydration mismatch" entre servidor y cliente.`,
      },
      {
        title: `useEffect con [] — ejecutar solo al montar`,
        body:
          `El array vacío [] como segundo argumento es la clave. Le dice a React: "este efecto ` +
          `no depende de ninguna variable, ejecútalo una sola vez después del primer render". ` +
          `Si omitieras el array, el efecto se ejecutaría después de cada render, creando un ` +
          `nuevo intervalo en cada actualización — el mismo problema de la solución naive.`,
      },
      {
        title: `setInterval + setTime — el bucle de actualización`,
        body:
          `setInterval ejecuta la función cada 1000 ms. Dentro, new Date().toLocaleTimeString() ` +
          `genera un string como "14:30:25" con la hora local del navegador. setTime guarda ese ` +
          `string en el estado, lo que dispara un re-render. Pero el re-render no re-ejecuta ` +
          `el efecto (porque las dependencias [] no cambiaron), así que el intervalo sigue siendo ` +
          `uno solo.`,
      },
      {
        title: `return () => clearInterval(intervalId) — limpieza`,
        body:
          `Esta es la función de cleanup. Se ejecuta cuando el componente se desmonta (por ejemplo, ` +
          `si el usuario navega a otra página). Sin ella, el setInterval seguiría corriendo en ` +
          `background intentando llamar a setTime en un componente que ya no existe. Eso causa ` +
          `warnings en consola y memory leaks. La limpieza es obligatoria para cualquier efecto ` +
          `que cree suscripciones, timers o listeners.`,
      },
    ],

    verdict:
      `El componente funciona porque useEffect con dependencias vacías garantiza que el intervalo ` +
      `se crea una sola vez y se limpia al desmontar. Caso de éxito: el componente se monta → ` +
      `useEffect crea un intervalo → cada segundo se actualiza la hora → el usuario navega a otra ` +
      `página → cleanup ejecuta clearInterval → sin memory leak. Caso de fallo (sin useEffect): ` +
      `cada render crea un nuevo intervalo → tras 5 segundos hay 5 intervalos → cada uno llama ` +
      `setTime → más renders → más intervalos → cascada exponencial que congela el navegador.`,
  },

  /* ------------------------------------------------------------------ */
  /*  3. server-time                                                     */
  /* ------------------------------------------------------------------ */
  {
    slug: "server-time",
    general:
      `Este componente muestra la hora del servidor en el momento en que se procesó la petición. ` +
      `A diferencia de ClientClock, esta hora no se actualiza: es un valor fijo que refleja el ` +
      `instante en que el servidor renderizó la página. No usa hooks, no tiene "use client", y ` +
      `es una función sincrónica normal. Es el ejemplo más puro de un Server Component de React: ` +
      `código que se ejecuta exclusivamente en el servidor y envía HTML estático al navegador.`,

    naiveApproach:
      `La idea intuitiva sería agregar un setInterval como en ClientClock para que la hora se ` +
      `actualice cada segundo. Eso no funciona aquí. Un Server Component se ejecuta en el servidor ` +
      `una sola vez por petición. No existe un "navegador" donde correr un setInterval. Si intentas ` +
      `usar useState o useEffect, Next.js lanza un error porque esos hooks requieren el ciclo de ` +
      `vida del cliente. El servidor genera el HTML, lo envía, y se olvida del componente. No hay ` +
      `forma de que el servidor "actualice" algo que ya envió.`,

    keyTool:
      `Los Server Components son la herramienta clave. En Next.js App Router, todo componente es ` +
      `Server Component por defecto a menos que tenga "use client". Esto significa que el código ` +
      `se ejecuta en el servidor durante el procesamiento de la request, tiene acceso directo a ` +
      `bases de datos, sistema de archivos y variables de entorno, y el resultado se envía como ` +
      `HTML puro. El bundle de JavaScript que recibe el navegador no incluye el código de este ` +
      `componente, lo que reduce el tamaño del JS enviado al cliente. La limitación es que no ` +
      `puede usar interactividad (hooks, eventos, state).`,

    steps: [
      {
        title: `Sin "use client" — Server Component por defecto`,
        body:
          `La ausencia de la directiva "use client" es la decisión más importante. No es que se ` +
          `olvidó ponerla: el componente intencionalmente se ejecuta en el servidor. Esto le ` +
          `permite acceder directamente a recursos del servidor (aquí no se usan, pero podría ` +
          `leer de una base de datos sin API intermedia).`,
      },
      {
        title: `const time = new Date().toLocaleTimeString() — ejecución en servidor`,
        body:
          `Esta línea se ejecuta en el servidor, no en el navegador. La hora que genera es la ` +
          `hora del servidor, no la del usuario. Si el servidor está en Virginia y el usuario ` +
          `en Santiago, la hora será la de Virginia. Además, el valor se fija al momento del ` +
          `render: no cambia sin recargar la página manualmente.`,
      },
      {
        title: `Renderizado estático — HTML sin JS`,
        body:
          `El JSX se convierte en HTML en el servidor y se envía al navegador. El navegador no ` +
          `recibe ningún JavaScript para este componente. No hay hidratación, no hay re-renders, ` +
          `no hay interactividad. Es como si el servidor hubiera generado HTML con PHP o cualquier ` +
          `otro lenguaje de servidor: el resultado es texto plano.`,
      },
    ],

    verdict:
      `El componente cumple su propósito: demostrar que en un Server Component el código se ejecuta ` +
      `una sola vez en el servidor y el resultado es HTML estático. Caso de éxito: el usuario carga ` +
      `la página a las 14:30:25 → ve "14:30:25" → espera 10 segundos → sigue viendo "14:30:25" → ` +
      `recarga la página → ve "14:30:35". Caso de comparación: si esto fuera un Client Component con ` +
      `useEffect, la hora cambiaría cada segundo en el navegador. La diferencia entre ambos patrones ` +
      `es exactamente lo que este lab demuestra.`,
  },

  /* ------------------------------------------------------------------ */
  /*  4. client-form                                                     */
  /* ------------------------------------------------------------------ */
  {
    slug: "client-form",
    general:
      `Este componente es un formulario controlado que tiene un campo de texto donde el usuario ` +
      `escribe su nombre y un párrafo que saluda con "Hello, {nombre}". Si el campo está vacío, ` +
      `muestra "Hello, anonymous". No envía datos a ningún servidor: todo sucede localmente en ` +
      `el navegador. Demuestra el patrón de "controlled input" en React, donde el valor del ` +
      `input no es manejado por el DOM sino por el estado de React.`,

    naiveApproach:
      `La idea intuitiva sería no usar estado y en su lugar leer el valor del input directamente ` +
      `con document.querySelector('input').value cuando lo necesites. Eso no funciona bien en React. ` +
      `El problema es que React no sabe que el valor cambió. Si intentas mostrar el nombre en otro ` +
      `lugar del componente con {name}, esa variable nunca se actualiza porque no hay re-render. ` +
      `Además, acceder al DOM directamente (document.querySelector) rompe el modelo de React: ` +
      `React espera ser el dueño del DOM, y si tú lo modificas por fuera, los estados se ` +
      `desincronizan y aparecen bugs difíciles de rastrear.`,

    keyTool:
      `El patrón "controlled input" (input controlado) es la herramienta clave. En un input ` +
      `controlado, React es la fuente de verdad del valor del campo. Funciona así: el atributo ` +
      `value del input se conecta a una variable de estado (name), y el evento onChange actualiza ` +
      `esa variable cada vez que el usuario teclea. El flujo es circular: usuario teclea → ` +
      `onChange llama setName → React re-renderiza → el input muestra el nuevo value. Parece ` +
      `redundante (el usuario ya tecleó la letra, ¿para qué re-renderizar?), pero garantiza ` +
      `que React siempre tenga el dato actualizado para usarlo en cualquier parte del componente.`,

    steps: [
      {
        title: `useState("") — estado del input`,
        body:
          `El estado name arranca como string vacío. Esto corresponde al input vacío que ve el ` +
          `usuario al cargar la página. Cada carácter que el usuario teclea va a generar un ` +
          `nuevo render con el string actualizado.`,
      },
      {
        title: `value={name} — React controla lo que muestra el input`,
        body:
          `Este atributo es lo que hace al input "controlado". El input no muestra lo que el ` +
          `usuario teclea directamente: muestra lo que React le dice que muestre (el valor de ` +
          `name). Sin el onChange correspondiente, el input parecería congelado: el usuario ` +
          `teclearía pero no aparecería nada, porque React mantendría el value en "" sin ` +
          `actualizarlo.`,
      },
      {
        title: `onChange={(e) => setName(e.target.value)} — capturar cada tecla`,
        body:
          `Cada vez que el usuario presiona una tecla, el navegador dispara un evento onChange. ` +
          `e.target.value contiene el contenido completo del input (no solo la última tecla). ` +
          `setName guarda ese valor en el estado, lo que dispara un re-render, y el input ` +
          `muestra el nuevo valor via value={name}. El ciclo completo: tecla → evento → ` +
          `setState → render → DOM actualizado, ocurre tan rápido que parece instantáneo.`,
      },
      {
        title: `{name || "anonymous"} — fallback con operador OR`,
        body:
          `El operador || evalúa el lado derecho cuando el izquierdo es falsy. Un string vacío ` +
          `"" es falsy en JavaScript. Entonces: si name es "" (el usuario no ha escrito nada), ` +
          `muestra "anonymous". Si name es "Juan", muestra "Juan". Es una forma compacta de ` +
          `escribir un valor por defecto sin un if completo.`,
      },
    ],

    verdict:
      `El componente funciona porque el input controlado mantiene sincronizado el estado de React ` +
      `con lo que ve el usuario. Caso de éxito: el usuario escribe "Ana" → onChange se dispara 3 ` +
      `veces (A, An, Ana) → 3 re-renders → el párrafo muestra "Hello, Ana". Caso de fallo ` +
      `(input no controlado sin estado): el input muestra "Ana" en el DOM pero {name} sigue ` +
      `siendo "" porque nadie llamó a setName → el párrafo muestra "Hello, anonymous" a pesar ` +
      `de que el input tiene texto.`,
  },

  /* ------------------------------------------------------------------ */
  /*  5. server-fetch                                                    */
  /* ------------------------------------------------------------------ */
  {
    slug: "server-fetch",
    general:
      `Este componente hace un fetch a una API externa (JSONPlaceholder) directamente desde el ` +
      `servidor y muestra el título de un todo. Es un async Server Component: una función con ` +
      `la palabra clave async que puede usar await directamente en su cuerpo. El fetch ocurre ` +
      `en el servidor durante el renderizado de la página. El navegador recibe HTML con el dato ` +
      `ya incluido, sin necesidad de JavaScript adicional ni estados de carga. El componente ` +
      `demuestra que los Server Components pueden hacer operaciones asíncronas (fetch, acceso a ` +
      `base de datos) sin hooks como useEffect.`,

    naiveApproach:
      `La idea intuitiva, viniendo de React tradicional, sería usar useEffect para hacer el ` +
      `fetch después de montar el componente. Eso funciona pero tiene desventajas: el usuario ` +
      `ve un estado de "Loading..." mientras espera, el navegador descarga JavaScript para ` +
      `ejecutar el fetch, y hay un "salto" visual cuando los datos llegan. Con el Server ` +
      `Component no necesitas nada de eso: el servidor espera a que el fetch termine, construye ` +
      `el HTML con los datos ya incluidos, y envía todo junto. El usuario ve el contenido ` +
      `completo desde el primer momento, sin parpadeos ni spinners.`,

    keyTool:
      `Los async Server Components son la herramienta clave. En Next.js App Router, un Server ` +
      `Component puede ser una función async. Esto es imposible en un Client Component porque ` +
      `React en el navegador necesita que el componente devuelva JSX sincrónicamente para ` +
      `pintar la pantalla. Pero en el servidor, React puede esperar (await) a que la función ` +
      `termine antes de enviar el HTML. El fetch aquí se comporta como en cualquier backend: ` +
      `se hace la petición HTTP, se espera la respuesta, se parsea el JSON, y se usa el dato ` +
      `para construir la respuesta HTML. Ninguna de esas operaciones ocurre en el navegador.`,

    steps: [
      {
        title: `type Todo — tipar la respuesta de la API`,
        body:
          `Se define un tipo TypeScript con los campos que esperamos: id (number) y title ` +
          `(string). Esto no es obligatorio para que funcione, pero nos da autocompletado y ` +
          `detección de errores. Si la API devuelve un campo diferente, TypeScript lo detecta ` +
          `en compilación.`,
      },
      {
        title: `async function ServerFetch — función asíncrona`,
        body:
          `La palabra clave async permite usar await dentro del cuerpo. Esto solo es válido ` +
          `en Server Components. Si este archivo tuviera "use client", Next.js lanzaría un ` +
          `error porque React en el cliente no soporta componentes async.`,
      },
      {
        title: `await fetch(...) — petición desde el servidor`,
        body:
          `Este fetch se ejecuta en el servidor de Node.js, no en el navegador del usuario. ` +
          `Esto tiene implicaciones: el servidor puede acceder a APIs internas sin CORS, puede ` +
          `incluir API keys sin exponerlas al cliente, y la latencia es generalmente menor ` +
          `(servidor a servidor). Next.js además cachea este fetch automáticamente por defecto.`,
      },
      {
        title: `await res.json() — parsear la respuesta`,
        body:
          `res.json() es asíncrono porque necesita leer todo el body del response antes de ` +
          `parsearlo. El as Todo al final le dice a TypeScript que trate el resultado como ` +
          `nuestro tipo definido. En el JSX se usa todo.title directamente, sin estados de ` +
          `carga ni condicionales, porque cuando React llega al return, el dato ya existe.`,
      },
    ],

    verdict:
      `El componente funciona porque el modelo async/await del servidor resuelve el dato antes ` +
      `de renderizar. Caso de éxito: usuario solicita la página → servidor hace fetch a ` +
      `JSONPlaceholder → espera ~100ms → recibe el todo → renderiza HTML con el título → envía ` +
      `HTML al navegador → el usuario ve "delectus aut autem" inmediatamente. Caso de comparación ` +
      `(Client Component con useEffect): usuario solicita la página → servidor envía HTML sin ` +
      `dato → navegador descarga JS → ejecuta useEffect → muestra "Loading..." → hace fetch → ` +
      `recibe dato → re-render → muestra el título. Dos pasos extra y un parpadeo visible.`,
  },

  /* ------------------------------------------------------------------ */
  /*  6. client-fetch                                                    */
  /* ------------------------------------------------------------------ */
  {
    slug: "client-fetch",
    general:
      `Este componente hace el mismo fetch que ServerFetch (obtener un todo de JSONPlaceholder), ` +
      `pero desde el navegador del usuario, no desde el servidor. Usa useEffect para disparar ` +
      `el fetch después del primer render y useState para manejar dos estados: null (cargando) ` +
      `y el objeto Todo (dato recibido). Mientras el dato no llega, muestra "Loading…". Cuando ` +
      `llega, muestra el título. Es el patrón clásico de data fetching en React y demuestra el ` +
      `ciclo completo: mount → fetch → setState → re-render.`,

    naiveApproach:
      `La idea intuitiva sería hacer el fetch directamente en el cuerpo de la función, fuera de ` +
      `useEffect: const res = await fetch(...). Eso no funciona por dos razones. Primero, un ` +
      `Client Component no puede ser async (React necesita JSX sincrónico). Segundo, aunque ` +
      `pudieras hacerlo, el fetch se re-ejecutaría en cada render, disparando setState, que ` +
      `causa otro render, que dispara otro fetch: un loop infinito. useEffect con [] asegura ` +
      `que el fetch ocurre una sola vez al montar.`,

    keyTool:
      `La combinación de useEffect + useState es el patrón estándar de data fetching en Client ` +
      `Components. useState(null) representa el estado "sin dato aún". useEffect con [] dispara ` +
      `el fetch una vez al montar. Dentro del useEffect, la cadena de .then() procesa la ` +
      `respuesta: el primer .then(res => res.json()) convierte la respuesta HTTP en un objeto ` +
      `JavaScript, y el segundo .then(setTodo) guarda ese objeto en el estado. setTodo como ` +
      `argumento de .then es un atajo: es equivalente a .then(data => setTodo(data)). Cuando ` +
      `setTodo se ejecuta, React re-renderiza el componente y esta vez todo ya no es null.`,

    steps: [
      {
        title: `useState<Todo | null>(null) — estado con tipo union`,
        body:
          `El tipo Todo | null significa que el estado puede ser un objeto Todo o null. Arranca ` +
          `como null porque al montar el componente, el dato aún no existe. Este null es lo que ` +
          `permite mostrar "Loading…" condicionalmente: si todo es null, aún estamos esperando.`,
      },
      {
        title: `useEffect con fetch — disparar la petición al montar`,
        body:
          `El efecto se ejecuta una vez después del primer render (dependencias []). Dentro, ` +
          `fetch() inicia una petición HTTP desde el navegador al API de JSONPlaceholder. A ` +
          `diferencia del ServerFetch, este fetch sí es visible en las DevTools del navegador ` +
          `(pestaña Network) y está sujeto a CORS.`,
      },
      {
        title: `.then(res => res.json()).then(setTodo) — cadena de promesas`,
        body:
          `fetch devuelve una Promise que se resuelve con un objeto Response. .json() devuelve ` +
          `otra Promise que se resuelve con el body parseado como objeto. Pasar setTodo ` +
          `directamente a .then() es un atajo elegante: es equivalente a .then(data => setTodo(data)). ` +
          `Funciona porque setTodo acepta exactamente un argumento (el nuevo estado) y .then ` +
          `pasa exactamente un argumento (el resultado de la promise).`,
      },
      {
        title: `todo ? <strong>...</strong> : <span>Loading…</span> — render condicional`,
        body:
          `El operador ternario decide qué mostrar según el estado. Si todo es null (falsy), ` +
          `muestra el span de carga. Si todo existe (truthy), muestra el título en negrita. ` +
          `Este patrón de "render según estado de datos" es fundamental en React: el componente ` +
          `se adapta automáticamente a los datos disponibles sin lógica imperativa.`,
      },
    ],

    verdict:
      `El componente funciona porque useEffect garantiza un solo fetch y useState maneja la ` +
      `transición de "cargando" a "dato listo". Caso de éxito: componente se monta → render ` +
      `inicial con todo=null → muestra "Loading…" → useEffect dispara fetch → API responde → ` +
      `.then(setTodo) → re-render con todo={id:1, title:"..."} → muestra el título. Caso de ` +
      `comparación con ServerFetch: el usuario ve "Loading…" por un instante antes de ver el ` +
      `dato, mientras que en ServerFetch el dato aparece inmediatamente. Ese "Loading…" es ` +
      `el costo de hacer el fetch en el cliente en vez del servidor.`,
  },
];
