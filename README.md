# Bia · Olibia — Prueba Design Engineer

Dos experiencias en React + TypeScript que comparten un mismo sistema de diseño (tokens, componentes y reglas de movimiento).

- **Demo:** `https://<tu-proyecto>.vercel.app`
- **Reto 01 · Olibia, pulso comercial:** `/#/olibia`
- **Reto 02 · Bia, ¿por qué subió mi factura?:** `/#/bia`
- Criterio de diseño ampliado: [`criterio.md`](./criterio.md)

## Ejecutar

Requiere Node.js 20 o superior.

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # genera dist/
npm run preview
npm run typecheck  # verificación de tipos
```

No hay backend. Los datos y estados son simulados. En ambas páginas, el botón **Estados** (esquina inferior derecha) muestra las vistas de carga, vacío y error.

## Estructura

```
src/
  styles/tokens.css   tokens primitivos → semánticos (espejo de Figma Variables)
  styles/base.css     componentes base: botón, chip, badge, tooltip, toast, drawer, skeleton
  ui/                 primitivas React compartidas (Tooltip, Toast, Drawer, Segmented, CountUp) e íconos
  olibia/             reto 01: datos tipados, gráficas SVG y app
  bia/                reto 02: escenario, gráfica horaria y app
```

Usé un router por hash, sin dependencias, para que la demo funcione en cualquier hosting estático. Las gráficas son SVG hechas a mano: así controlo el foco, los tooltips y la animación de cada barra. La única dependencia de runtime es React.

---

## 01 · Olibia: decisiones (≈220 palabras)

El dashboard original mezclaba números del equipo (cierres) con números filtrables (pipeline) sin decir cuáles eran cuáles. La decisión principal fue **separar la pantalla en dos zonas con alcance explícito**. *Resultados del equipo* lleva una etiqueta que dice que no cambia con filtros. *Pipeline abierto* responde a todo lo que filtres y muestra cuántos filtros hay activos.

Reemplacé el gráfico de barras por etapa por un **embudo de cuatro tarjetas que también es el filtro de etapa**: ver y filtrar ocurren en el mismo lugar. Los filtros pasaron de selects a chips de un clic. Los responsables aparecen como avatares con el mismo color en el filtro, el ranking, la tabla y el detalle. La meta se lee como un anillo (8 de 10), junto a un histórico con la línea de meta.

La exploración ocurre en un **panel lateral** con anterior/siguiente, etapa en pasos, contacto y última nota. La acción, *marcar seguimiento*, pide una confirmación breve y deja **deshacer** desde el toast: una acción que se registra con un solo clic accidental no inspira confianza.

Corregí un detalle de datos: el canal se calculaba según la posición de la fila, así que una empresa cambiaba de canal entre periodos. Ahora el canal es un atributo fijo de cada empresa.

**Qué probar:** cambiar de periodo (los números se animan), clic en *Negociación* en el embudo, segmentos de *Origen*, la tecla `/` para buscar, ordenar columnas, flechas del detalle, deshacer en el toast, contraer el menú y el botón *Estados*.

## 02 · Bia: decisiones (≈230 palabras)

La persona tiene pocos minutos y no sabe de energía. Por eso **la página empieza con la respuesta, no con un dashboard**: "Tu factura subió $1,2 M porque consumiste más, no porque la energía esté más cara". Debajo, un puente visual (septiembre + consumo extra + precio sin cambio = octubre) demuestra la frase sin pedir que se interprete un gráfico.

Después, el recorrido responde cuatro preguntas en orden: **¿dónde?** (una sede explica el 80% del aumento), **¿cuándo?** (perfil de 24 horas con el horario de cierre sombreado; las barras nocturnas en ámbar hacen evidente el problema), **¿por qué?** y **¿qué hago?**. Un índice fijo permite saltar entre ellas y marca la sección activa.

El enunciado pide distinguir hechos de hipótesis, así que lo convertí en un **lenguaje visual**: *Medido* es una etiqueta sólida y *Por confirmar* una punteada. Las hipótesis tienen probabilidad, razón y forma de verificarlas, y la persona puede marcarlas como confirmadas o descartadas. La página no afirma una causa que no conoce.

El cierre ofrece **un siguiente paso principal**: agendar una revisión nocturna, con horarios, estado de carga, confirmación y deshacer. También hay dos acciones inmediatas: una lista para el cierre de esta noche y una alerta si se repite. El ahorro estimado ($720.000/mes) traduce kWh a dinero, que es la unidad en la que piensa la persona.

Usé tipografía editorial y más aire que en Olibia: aquí el objetivo es entender, no monitorear.

---

## Calidad transversal

- **Teclado:** salto al contenido, foco visible, barras de las gráficas enfocables con tooltip, `radiogroup` con flechas en el periodo, panel con foco atrapado y `Esc` para cerrar.
- **Sin depender del hover:** todo lo que muestra un tooltip también se puede activar con foco o clic, y las acciones están siempre visibles.
- **Movimiento reducido:** con `prefers-reduced-motion`, duraciones a 0 y contadores sin animación.
- **Responsive:** menú tipo cajón en móvil, tabla convertida en tarjetas, panel de detalle como hoja inferior y gráfica horaria con desplazamiento.
- **Estados:** carga (skeleton), vacío con salida (limpiar filtros), error con reintento.

## Herramientas y AI

- Paleta basada en [bia.app](https://www.bia.app/): negro profundo, grises neutros, menta `#08DDBC` como acento de energía, violeta `#8B5CF6` para todo lo que viene de AI, ámbar `#F59E0B` para anomalías y el brillo azul eléctrico del hero de su sitio, reinterpretado en la cabecera de la experiencia Bia. Tipografía Inter, como en su sitio, con Geist Mono para etiquetas y ejes.
- React 19, TypeScript, Vite, CSS con custom properties (sin framework de UI), SVG a mano.
- Figma: foundations (variables de color, tipografía, espacio, radios) y componentes base.
- Claude (Anthropic) como copiloto para estructurar el plan, generar código base de componentes y revisar consistencia, accesibilidad y textos.

## Qué refiné personalmente

> _Completa con tus propias palabras: dirección visual, ajustes de jerarquía, textos, microinteracciones, revisiones en móvil, etc._

## Tiempo dedicado

> _Completa con el tiempo real._
