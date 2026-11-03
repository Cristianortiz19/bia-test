# Bia · Olibia — Prueba Design Engineer

Dos experiencias en React + TypeScript que comparten un mismo sistema de diseño (tokens, componentes y reglas de movimiento).

- **Demo:** `https://bia-test-alpha.vercel.app/`
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

## 01 · Olibia: decisiones

El dashboard original mezclaba números del equipo con números filtrables sin decir cuáles eran cuáles. La decisión principal fue **separar la pantalla en dos zonas con alcance explícito**: *Resultados del equipo* dice que no cambia con filtros, y *Pipeline abierto* responde a todo lo que filtras y muestra cuántos filtros hay activos.

El gráfico de barras por etapa se reemplazó por un **embudo de cuatro tarjetas que también es el filtro**: ver y filtrar ocurren en el mismo lugar. Los filtros son chips de un clic, y los responsables aparecen como avatares con el mismo color en el filtro, el ranking, la tabla y el detalle.

La exploración ocurre en un **panel lateral** con anterior y siguiente. La acción *marcar seguimiento* pide una confirmación breve y deja **deshacer** en el aviso, porque un clic accidental no debe registrar nada sin poder volver atrás.

Corregí un detalle de datos: el canal se calculaba según la posición de la fila, así que una empresa cambiaba de canal entre periodos. Ahora es un atributo fijo de cada empresa.

**Qué probar:** el selector de periodo (atajos o varios meses a la vez: cierres y meta se suman, y el pipeline muestra cada oportunidad en su estado más reciente), clic en una etapa del embudo, los segmentos de *Origen*, la tecla `/` para buscar, ordenar columnas, las flechas del detalle, deshacer en el aviso y el botón *Estados*.

## 02 · Bia: decisiones

La persona tiene pocos minutos y no sabe de energía. Por eso **la página empieza con la respuesta, no con un dashboard**: "Tu factura subió $1,2 M porque consumiste más, no porque la energía esté más cara". Debajo, un puente visual (septiembre + consumo extra + precio sin cambio = octubre) demuestra la frase sin pedir que se interprete un gráfico.

Después, el recorrido responde cuatro preguntas en orden: **¿dónde?** (una sede explica el 80% del aumento), **¿cuándo?** (perfil de 24 horas con el horario de cierre sombreado; las barras nocturnas en ámbar hacen evidente el problema), **¿por qué?** y **¿qué hago?**. Un índice fijo permite saltar entre ellas y marca la sección activa.

El enunciado pide distinguir hechos de hipótesis, así que lo convertí en un **lenguaje visual**: *Medido* es una etiqueta sólida y *Por confirmar* una punteada. Las hipótesis tienen probabilidad, razón y forma de verificarlas, y la persona puede marcarlas como confirmadas o descartadas. La página no afirma una causa que no conoce.

El cierre ofrece **un siguiente paso principal**: agendar una revisión nocturna, con horarios, estado de carga, confirmación y deshacer. También hay dos acciones inmediatas: una lista para el cierre de esta noche y una alerta si se repite. El ahorro estimado ($720.000/mes) traduce kWh a dinero, que es la unidad en la que piensa la persona.

Usé tipografía editorial y más aire que en Olibia: aquí el objetivo es entender, no monitorear.

---

## Dirección visual

Tema oscuro neutro, como bia.app. Las tarjetas son grises, sin borde ni sombra, con radios grandes. Tipografía Plus Jakarta Sans. El menú es un riel de íconos con tooltips y el ítem activo en un círculo blanco. Los filtros son tabs en píldora.

No hay degradados de fondo ni brillos en las gráficas. Para destacar algo uso **tarjetas con fondo de color sólido de la paleta**, solo donde aporta: la meta en menta, el aviso del mes y la cabecera de Bia en azul, el resumen AI en violeta, la sede anómala en ámbar y la recomendación final en menta.

En las gráficas, las barras de contexto van rayadas y las relevantes en color sólido: los meses seleccionados en Olibia y las horas nocturnas en Bia. Las etapas tienen un color propio que se repite en sus tarjetas y en las píldoras de estado de la tabla.

## Calidad transversal

- **Teclado:** salto al contenido, foco visible, barras de las gráficas enfocables con tooltip, `radiogroup` con flechas en el periodo, panel con foco atrapado y `Esc` para cerrar.
- **Sin depender del hover:** todo lo que muestra un tooltip también se puede activar con foco o clic, y las acciones están siempre visibles.
- **Movimiento reducido:** con `prefers-reduced-motion`, duraciones a 0 y contadores sin animación.
- **Responsive:** menú tipo cajón en móvil, tabla convertida en tarjetas, panel de detalle como hoja inferior y gráfica horaria con desplazamiento.
- **Estados:** carga (skeleton), vacío con salida (limpiar filtros), error con reintento.
- **Contraste:** todos los textos cumplen WCAG AA (4,5:1 en texto normal), comprobados en ambas experiencias.

## Herramientas y AI

- Paleta basada en [bia.app](https://www.bia.app/): negro profundo, grises neutros, menta `#08DDBC` como acento de energía, violeta para todo lo que viene de AI (`#6D3FE0` en la tarjeta de resumen, para cumplir contraste con texto blanco), rojo `#EF4444` para métricas negativas, ámbar `#F59E0B` para anomalías y el brillo azul eléctrico del hero de su sitio, reinterpretado en la cabecera de la experiencia Bia. Tipografía Plus Jakarta Sans para la interfaz y Geist Mono para etiquetas y ejes.
- React 19, TypeScript, Vite, CSS con custom properties (sin framework de UI), SVG a mano.
- Figma: foundations (variables de color, tipografía, espacio, radios) y componentes base.
- Claude (Anthropic) como copiloto para estructurar el plan, generar código base de componentes y revisar consistencia, accesibilidad y textos.

## Qué refiné personalmente

> _Mi enfoque fue primero entender qué necesita cada persona en cada pantalla, y después ajustar el diseño para que lo importante se vea primero. En ambas experiencias revisé la jerarquía tipográfica, el contraste, el espaciado y la forma en que se agrupan los datos, para que la lectura sea rápida y no dependa de interpretar gráficas._

> _En usabilidad, cuidé que las acciones se entiendan sin tener que adivinar: los filtros muestran cuáles están activos y cómo limpiarlos, los estados de carga, vacío y error están pensados, y los controles importantes siempre son visibles, sin depender del cursor. Traté de que cada elemento tenga un solo significado visual: los colores de estado indican información, no decoración._

> _Para el sistema visual, definí tokens de color, tipografía y forma, y los apliqué de forma consistente en las dos experiencias. Eliminé sombras, bordes y brillos innecesarios, y reservé el color sólido para lo que necesita destacarse. Revisé el contraste de los textos contra criterios WCAG AA y ajusté los que no cumplían._

> _Probé las pantallas en escritorio y en móvil, y revisé el comportamiento de las gráficas al cambiar el tamaño de la ventana, para que mantengan sus proporciones y su legibilidad._

## Tiempo dedicado

> _Completado en 4 horas._
