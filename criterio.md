# Criterio de diseño

## Un sistema, dos temperaturas

Las dos experiencias usan los mismos tokens (`src/styles/tokens.css`), pero cambian de temperatura según su propósito:

| | Olibia | Bia |
|---|---|---|
| Persona | Director comercial que vuelve todos los días | Dueña de cafeterías, una vez al mes y con prisa |
| Tarea | Monitorear y actuar | Entender y decidir |
| Densidad | Alta, escaneable | Baja, narrativa |
| Tipografía | Geist en la interfaz, serif solo en las cifras clave | Serif editorial en titulares |
| Expresividad | Contenida: el color marca estado | Mayor: el color cuenta la historia (noche = naranja) |

## Reglas de color

- **Tinta** (`ink-950`): estructura, la acción principal y el dato del momento actual.
- **Volt** (`#C8F560`): energía y progreso. Señala lo activo, nunca decora.
- **Iris**: todo lo que viene de inteligencia (resumen AI, foco, comparaciones).
- **Ember**: anomalía o algo que requiere atención. Si todo es urgente, nada lo es: solo una sede y solo las horas nocturnas lo llevan.

## Dónde poner expresividad y dónde calma

- **Expresivo:** las cifras que responden la pregunta (anillo de meta, titular de Bia, delta por sede), las transiciones de estado (confirmación, agendado) y los cambios de periodo.
- **Calmado:** tablas, filtros, leyendas y textos de apoyo. La animación dura menos de 420 ms, usa `ease-out` y nunca bloquea una acción.

## Honestidad de los datos

- Etiquetas explícitas de alcance: qué cambia con los filtros y qué no.
- Hechos medidos e hipótesis tienen formas distintas (etiqueta sólida y etiqueta punteada).
- El resumen AI dice que es simulado y de dónde sale.
- Los datos añadidos se documentan en el código (`olibia/data.ts`, `bia/data.ts`).

## Qué dejaría para una siguiente iteración

- Persistir seguimientos y veredictos de hipótesis (hoy viven en la sesión).
- Pruebas de usabilidad con 3 o 4 dueños de negocio para validar si "kWh" debería ocultarse por completo detrás de pesos.
- Tema oscuro (los tokens semánticos ya lo permiten).
- Pruebas automáticas de accesibilidad (axe) y de interacción (Playwright).
