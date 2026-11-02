/* Datos del material base (src/data.js), tipados y con significado conservado.
   Cambios de criterio:
   - `channel` ahora es un atributo fijo de cada empresa. En el original se calculaba por la
     posición de la fila, por lo que una misma empresa cambiaba de canal entre periodos.
     Se fija con la asignación de octubre (periodo más reciente).
   - `contact`, `note` y `history` son datos simulados añadidos para que el detalle sea útil. */

export type Stage = 'Contacto' | 'Calificación' | 'Propuesta' | 'Negociación';
export type Channel = 'Outbound' | 'Referidos' | 'Inbound';
export type PeriodKey = 'oct' | 'sep';

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
  label: string;
  short: string;
  closed: number;
  months: string[];
  history: number[];
  ownerClosures: number[]; // en orden de OWNERS
  rows: Opportunity[];
};

const CHANNEL: Record<string, Channel> = {
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

export const PERIODS: Record<PeriodKey, Period> = {
  oct: {
    key: 'oct', label: 'Octubre 2026', short: 'Oct', closed: 8,
    months: ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'], history: [4, 6, 5, 7, 6, 8],
    ownerClosures: [3, 2, 2, 1],
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
  sep: {
    key: 'sep', label: 'Septiembre 2026', short: 'Sep', closed: 6,
    months: ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'], history: [3, 4, 6, 5, 7, 6],
    ownerClosures: [2, 2, 1, 1],
    rows: toRows([
      ['Grupo Andino', 'Contacto', 42, 'Ana López', '28 sep'],
      ['Clínica Horizonte', 'Calificación', 28, 'Carlos Ruiz', '29 sep'],
      ['Alimentos del Norte', 'Propuesta', 65, 'Laura Díaz', '28 sep'],
      ['Hotel Central', 'Contacto', 18, 'Mateo Gil', '30 sep'],
      ['Logística Pacífico', 'Calificación', 51, 'Ana López', '29 sep'],
      ['Textiles Aurora', 'Contacto', 34, 'Carlos Ruiz', '30 sep'],
    ]),
  },
};

/** Contexto simulado para el detalle (no altera las métricas). */
export const DETAILS: Record<string, { contact: string; role: string; note: string }> = {
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
