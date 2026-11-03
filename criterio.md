# Criterio de diseño

## Un sistema, dos temperaturas

Las dos experiencias usan los mismos tokens (`src/styles/tokens.css`), pero cambian de temperatura según su propósito:

| | Olibia | Bia |
|---|---|---|
| Persona | Director comercial que vuelve todos los días | Dueña de cafeterías, una vez al mes y con prisa |
| Tarea | Monitorear y actuar | Entender y decidir |
| Densidad | Alta, escaneable | Baja, narrativa |
| Tipografía | Plus Jakarta Sans densa; título 800 y cifras clave grandes | Plus Jakarta Sans en titulares grandes; cabecera en azul de marca |
| Expresividad | Contenida: el color marca estado | Mayor: el color cuenta la historia (noche = ámbar) |

Ambas usan tema oscuro neutro, como bia.app.

## Reglas de color

- **Gris neutro sin borde ni sombra**: base de todas las tarjetas. El color se gana: solo las tarjetas relevantes llevan fondo sólido de la paleta (meta en menta, aviso en azul, resumen AI en violeta, sede anómala en ámbar).
- **Blanco**: acción principal (botones en píldora) e ítem activo del menú.
- **Menta** (`#08DDBC`, de bia.app): energía, progreso y métricas positivas. Señala lo activo, nunca decora.
- **Violeta**: todo lo que viene de inteligencia. La tarjeta de resumen AI usa `#6D3FE0` para que el texto blanco cumpla contraste; como texto o avatar se usa `#A78BFA`.
- **Ámbar** (`#F59E0B`): anomalía o algo que requiere atención. Si todo es urgente, nada lo es: solo una sede y solo las horas nocturnas lo llevan.
- **Rojo** (`#EF4444`): métricas negativas. Cuando un dato baja (por ejemplo, cierres frente al periodo anterior), su indicador se pinta en rojo. El ámbar no se usa para negativos.
- **Gris neutro**: cuando una métrica no cambia.

Los colores de estado están definidos como tokens (`--status-pos`, `--status-neg`, `--status-neutral`) y se aplican igual en las dos experiencias.

## Contraste y accesibilidad

- Todo texto cumple **WCAG AA**: 4,5:1 para texto normal y 3:1 para texto grande. Por eso `--text-3` es `#9A9AA4` y no un gris más oscuro.
- Los textos sobre color sólido (menta, azul, violeta, ámbar) se revisan con su propio color de texto (`--on-hl-*`).
- Las iniciales de los avatares usan texto oscuro sobre los colores de responsable.
- Los controles deshabilitados también se leen con claridad, aunque no están obligados.
- Todo lo que muestra un tooltip también se puede activar con teclado o clic.

## Forma y ritmo

- **Radios**: tarjetas en 24 px, controles y píldoras en 999 px, avatares en círculo o cuadrado redondeado.
- **Barras agrupadas**: cuando varias partes forman un total (origen de cierres, reparto de sedes), el grupo se redondea como una sola pieza y las partes internas van rectas, separadas por 3 px.
- **Títulos**: jerarquía por peso y tamaño, no por color. El título principal va en 800, los encabezados de sección en 700 y los textos de apoyo en 400–600.
- **Descripciones**: van debajo del título de cada sección, nunca al lado.
- **Numeración**: no se numeran pasos, etapas ni tarjetas. El orden lo da la posición.

## Dónde poner expresividad y dónde calma

- **Expresivo:** las cifras que responden la pregunta (anillo de meta, titular de Bia, delta por sede), las transiciones de estado (confirmación, agendado) y los cambios de periodo.
- **Calmado:** tablas, filtros, leyendas y textos de apoyo. La animación dura menos de 420 ms, usa `ease-out` y nunca bloquea una acción.
- **Sin gradientes ni brillos.** Las gráficas usan rayas para el contexto y color sólido para lo que destaca. Las únicas excepciones son las rayas (un patrón, no un degradado) y el pulso de carga, que es opaco.

## Honestidad de los datos

- Etiquetas explícitas de alcance: qué cambia con los filtros y qué no.
- Hechos medidos e hipótesis tienen formas distintas (etiqueta sólida y etiqueta punteada).
- El resumen AI dice que es simulado y de dónde sale.
- Los datos añadidos se documentan en el código (`olibia/data.ts`, `bia/data.ts`).

## Qué dejaría para una siguiente iteración

- Persistir seguimientos y veredictos de hipótesis (hoy viven en la sesión).
- Pruebas de usabilidad con 3 o 4 dueños de negocio para validar si "kWh" debería ocultarse por completo detrás de pesos.
- Auditoría de accesibilidad con axe-core, además de la comprobación de contraste ya hecha.
- Pruebas automáticas de interacción (Playwright) sobre filtros, periodo y el detalle lateral.
