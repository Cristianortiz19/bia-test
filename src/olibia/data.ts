/* Datos del material base (src/data.js), tipados y con significado conservado.
   Cambios de criterio:
   - `channel` ahora es un atributo fijo de cada empresa. En el original se calculaba por la
     posición de la fila, por lo que una misma empresa cambiaba de canal entre periodos.
     Se fija con la asignación de octubre (periodo más reciente).
   - `contact`, `note` y `history` son datos simulados añadidos para que el detalle sea útil. */

export type Stage = 'Contacto' | 'Calificación' | 'Propuesta' | 'Negociación';
export type Channel = 'Outbound' | 'Referidos' | 'Inbound';
export type PeriodKey = 'may' | 'jun' | 'jul' | 'ago' | 'sep' | 'oct';
export const MONTHS: PeriodKey[] = ['may', 'jun', 'jul', 'ago', 'sep', 'oct'];

export const STAGES: Stage[] = ['Contacto', 'Calificación', 'Propuesta', 'Negociación'];
export const CHANNELS: Channel[] = ['Outbound', 'Referidos', 'Inbound'];
export const OWNERS = ['Ana López', 'Carlos Ruiz', 'Laura Díaz', 'Mateo Gil'] as const;
export type Owner = (typeof OWNERS)[number];
export const GOAL = 10; // meta comercial: 10 cierres mensuales

export type Opportunity = {
  id: string;
  company: string;
  stage: Stage;
  value: number; // COP millones / mes
  owner: Owner;
  nextContact: string; // '28 oct'
  channel: Channel;
};

export type Period = {
  key: PeriodKey;
  label: string; // 'Octubre 2026'
  short: string; // 'Oct'
  closed: number;
  ownerClosures: number[]; // en orden de OWNERS
  rows: Opportunity[];
};

const CHANNEL: Record<string, Channel> = {
  'Constructora Cali': 'Outbound', 'Farmacias Vida': 'Referidos', 'Panadería Real': 'Inbound',
  'Colegio Bilingüe': 'Outbound', 'Agro Valle': 'Referidos',
  'Grupo Andino': 'Outbound', 'Clínica Horizonte': 'Outbound', 'Alimentos del Norte': 'Outbound',
  'Hotel Central': 'Outbound', 'Logística Pacífico': 'Referidos', 'Textiles Aurora': 'Referidos',
  'Mercado Verde': 'Referidos', 'Industrias Atlas': 'Inbound',
};

type Raw = [string, Stage, number, Owner, string];
const toRows = (raw: Raw[]): Opportunity[] =>
  raw.map(([company, stage, value, owner, nextContact]) => ({
    id: company.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[̀-ͯ]/g, ''),
    company, stage, value, owner, nextContact, channel: CHANNEL[company],
  }));

/* Septiembre y octubre vienen del material base. Mayo–agosto son simulados y coherentes con
   el histórico de cierres del original (May 4 · Jun 6 · Jul 5 · Ago 7). Abril (3) solo se usa
   como referencia de comparación. */
export const PERIODS: Record<PeriodKey, Period> = {
  may: {
    key: 'may', label: 'Mayo 2026', short: 'May', closed: 4, ownerClosures: [1, 1, 1, 1],
    rows: toRows([
      ['Constructora Cali', 'Propuesta', 36, 'Ana López', '27 may'],
      ['Farmacias Vida', 'Negociación', 47, 'Laura Díaz', '28 may'],
      ['Panadería Real', 'Calificación', 15, 'Carlos Ruiz', '29 may'],
      ['Hotel Central', 'Contacto', 18, 'Mateo Gil', '30 may'],
    ]),
  },
  jun: {
    key: 'jun', label: 'Junio 2026', short: 'Jun', closed: 6, ownerClosures: [2, 2, 1, 1],
    rows: toRows([
      ['Constructora Cali', 'Negociación', 36, 'Ana López', '26 jun'],
      ['Panadería Real', 'Propuesta', 15, 'Carlos Ruiz', '27 jun'],
      ['Colegio Bilingüe', 'Contacto', 26, 'Ana López', '29 jun'],
      ['Hotel Central', 'Contacto', 18, 'Mateo Gil', '30 jun'],
    ]),
  },
  jul: {
    key: 'jul', label: 'Julio 2026', short: 'Jul', closed: 5, ownerClosures: [2, 1, 1, 1],
    rows: toRows([
      ['Colegio Bilingüe', 'Calificación', 26, 'Ana López', '28 jul'],
      ['Panadería Real', 'Negociación', 15, 'Carlos Ruiz', '29 jul'],
      ['Clínica Horizonte', 'Contacto', 28, 'Carlos Ruiz', '29 jul'],
      ['Agro Valle', 'Propuesta', 39, 'Laura Díaz', '30 jul'],
      ['Hotel Central', 'Contacto', 18, 'Mateo Gil', '31 jul'],
    ]),
  },
  ago: {
    key: 'ago', label: 'Agosto 2026', short: 'Ago', closed: 7, ownerClosures: [2, 2, 2, 1],
    rows: toRows([
      ['Colegio Bilingüe', 'Propuesta', 26, 'Ana López', '27 ago'],
      ['Agro Valle', 'Negociación', 39, 'Laura Díaz', '28 ago'],
      ['Grupo Andino', 'Contacto', 42, 'Ana López', '28 ago'],
      ['Clínica Horizonte', 'Contacto', 28, 'Carlos Ruiz', '29 ago'],
      ['Alimentos del Norte', 'Calificación', 65, 'Laura Díaz', '28 ago'],
      ['Hotel Central', 'Contacto', 18, 'Mateo Gil', '31 ago'],
    ]),
  },
  sep: {
    key: 'sep', label: 'Septiembre 2026', short: 'Sep', closed: 6, ownerClosures: [2, 2, 1, 1],
    rows: toRows([
      ['Grupo Andino', 'Contacto', 42, 'Ana López', '28 sep'],
      ['Clínica Horizonte', 'Calificación', 28, 'Carlos Ruiz', '29 sep'],
      ['Alimentos del Norte', 'Propuesta', 65, 'Laura Díaz', '28 sep'],
      ['Hotel Central', 'Contacto', 18, 'Mateo Gil', '30 sep'],
      ['Logística Pacífico', 'Calificación', 51, 'Ana López', '29 sep'],
      ['Textiles Aurora', 'Contacto', 34, 'Carlos Ruiz', '30 sep'],
    ]),
  },
  oct: {
    key: 'oct', label: 'Octubre 2026', short: 'Oct', closed: 8, ownerClosures: [3, 2, 2, 1],
    rows: toRows([
      ['Grupo Andino', 'Calificación', 42, 'Ana López', '28 oct'],
      ['Clínica Horizonte', 'Propuesta', 28, 'Carlos Ruiz', '29 oct'],
      ['Alimentos del Norte', 'Negociación', 65, 'Laura Díaz', '28 oct'],
      ['Hotel Central', 'Contacto', 18, 'Mateo Gil', '30 oct'],
      ['Logística Pacífico', 'Propuesta', 51, 'Ana López', '29 oct'],
      ['Textiles Aurora', 'Calificación', 34, 'Carlos Ruiz', '30 oct'],
      ['Mercado Verde', 'Contacto', 22, 'Laura Díaz', '28 oct'],
      ['Industrias Atlas', 'Negociación', 78, 'Mateo Gil', '29 oct'],
    ]),
  },
};
const APRIL_CLOSED = 3;

export type Row = Opportunity & { month: PeriodKey };
export type View = {
  months: PeriodKey[]; // ordenados
  label: string;
  closed: number;
  goal: number;
  ownerClosures: number[];
  rows: Row[]; // cada empresa en su estado más reciente dentro del rango
  prevClosed: number | null; // ventana anterior de igual tamaño (si hay datos)
  prevLabel: string;
  single: boolean;
};

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
export function periodLabel(ms: PeriodKey[]) {
  const sorted = MONTHS.filter((m) => ms.includes(m));
  if (sorted.length === 1) return PERIODS[sorted[0]].label;
  const idx = sorted.map((m) => MONTHS.indexOf(m));
  const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (sorted.length === MONTHS.length) return 'May – Oct 2026';
  if (contiguous) return `${PERIODS[sorted[0]].short} – ${PERIODS[sorted[sorted.length - 1]].short} 2026`;
  return sorted.map((m) => PERIODS[m].short).join(', ') + ' 2026';
}

export function buildView(sel: PeriodKey[]): View {
  const months = MONTHS.filter((m) => sel.includes(m));
  const closed = months.reduce((s, m) => s + PERIODS[m].closed, 0);
  const ownerClosures = OWNERS.map((_, i) => months.reduce((s, m) => s + PERIODS[m].ownerClosures[i], 0));
  const latest = new Map<string, Row>();
  months.forEach((m) => PERIODS[m].rows.forEach((r) => latest.set(r.id, { ...r, month: m })));
  const first = MONTHS.indexOf(months[0]);
  const n = months.length;
  const idx = months.map((m) => MONTHS.indexOf(m));
  const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  let prevClosed: number | null = null, prevLabel = '';
  if (contiguous) {
    const prevIdx = Array.from({ length: n }, (_, i) => first - n + i);
    if (prevIdx[0] >= -1) {
      prevClosed = prevIdx.reduce((s, i) => s + (i === -1 ? APRIL_CLOSED : PERIODS[MONTHS[i]].closed), 0);
      prevLabel = n === 1 ? (first === 0 ? 'abril' : PERIODS[MONTHS[first - 1]].label.split(' ')[0].toLowerCase()) : `${n} meses previos`;
    }
  }
  return {
    months, label: periodLabel(months), closed, goal: GOAL * n, ownerClosures,
    rows: [...latest.values()], prevClosed, prevLabel, single: n === 1,
  };
}
export const monthName = (m: PeriodKey) => cap(PERIODS[m].label.split(' ')[0].toLowerCase());

/** Contexto simulado para el detalle (no altera las métricas). */
export const DETAILS: Record<string, { contact: string; role: string; note: string }> = {
  'constructora-cali': { contact: 'Jorge Arango', role: 'Gerente de proyectos', note: 'Evalúa energía para 2 obras en curso.' },
  'farmacias-vida': { contact: 'Lucía Paz', role: 'Directora administrativa', note: 'Referida por un cliente actual. 12 puntos de venta.' },
  'panaderia-real': { contact: 'Hernán Vélez', role: 'Propietario', note: 'Hornos eléctricos: alto consumo en la madrugada.' },
  'colegio-bilingue': { contact: 'Ana María Restrepo', role: 'Rectora', note: 'Decisión sujeta a aprobación del consejo directivo.' },
  'agro-valle': { contact: 'Diego Cifuentes', role: 'Gerente financiero', note: 'Bombeo de riego; piden tarifa diferenciada.' },
  'grupo-andino': { contact: 'Patricia Mejía', role: 'Gerente de compras', note: 'Pidió comparar planes antes de la reunión con su junta.' },
  'clinica-horizonte': { contact: 'Dr. Felipe Rojas', role: 'Director administrativo', note: 'Revisa la propuesta con el área financiera esta semana.' },
  'alimentos-del-norte': { contact: 'Marcela Ortiz', role: 'COO', note: 'Negociando plazo de contrato: piden 24 meses en lugar de 36.' },
  'hotel-central': { contact: 'Andrés Cano', role: 'Jefe de mantenimiento', note: 'Primer contacto por evento del sector hotelero.' },
  'logistica-pacifico': { contact: 'Sofía Lozano', role: 'Directora de operaciones', note: 'Referida por Alimentos del Norte. Interés en 3 bodegas.' },
  'textiles-aurora': { contact: 'Julián Prieto', role: 'Gerente general', note: 'Calificando consumo histórico de las dos plantas.' },
  'mercado-verde': { contact: 'Valentina Ruiz', role: 'Fundadora', note: 'Cadena de 5 tiendas; quiere piloto en una sede.' },
  'industrias-atlas': { contact: 'Ricardo Gómez', role: 'VP de finanzas', note: 'Llegó por la web. Última ronda de condiciones comerciales.' },
};

/* -------------------------------------------------------------- filtros */
export type Filters = { query: string; stage: Stage | ''; owner: Owner | ''; channel: Channel | ''; minimum: 0 | 30 | 50 };
export const EMPTY_FILTERS: Filters = { query: '', stage: '', owner: '', channel: '', minimum: 0 };

export function filterRows(rows: Opportunity[], f: Filters) {
  const q = f.query.trim().toLowerCase();
  return rows.filter((r) =>
    (!q || r.company.toLowerCase().includes(q)) &&
    (!f.stage || r.stage === f.stage) &&
    (!f.owner || r.owner === f.owner) &&
    (!f.channel || r.channel === f.channel) &&
    (!f.minimum || r.value >= f.minimum));
}

export const activeFilterCount = (f: Filters) =>
  [f.query.trim(), f.stage, f.owner, f.channel, f.minimum].filter(Boolean).length;

export function toCSV(rows: Opportunity[]) {
  const head = ['Empresa', 'Etapa', 'Valor mensual COP millones', 'Responsable', 'Proximo contacto', 'Canal'];
  return '﻿' + [head, ...rows.map((r) => [r.company, r.stage, r.value, r.owner, r.nextContact, r.channel])]
    .map((r) => r.join(';')).join('\r\n');
}
