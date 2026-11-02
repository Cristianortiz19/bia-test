/* Escenario del enunciado + datos añadidos coherentes.
   Hechos del enunciado: factura $4,8 M → $6,0 M (+25%); consumo 6.000 → 7.500 kWh; tarifa $800/kWh
   sin cambio; una sede concentra 1.200 de los 1.500 kWh adicionales; hay consumo fuera de horario
   con causa no confirmada.
   Añadidos (simulados): nombres y reparto por sede, horario de atención, perfil horario. */

export const TARIFF = 800; // COP por kWh
export const BUSINESS = 'Café Ladera';
export const OPEN_FROM = 6; // 6:00
export const OPEN_TO = 20; // 20:00 (cierra)

export type SiteId = 'granada' | 'sanantonio' | 'jardin';
export type Site = {
  id: SiteId;
  name: string;
  hood: string;
  prev: number; // kWh septiembre
  curr: number; // kWh octubre
  offPrevPerHour: number; // kWh/h promedio fuera de horario (base: neveras)
  offCurrPerHour: number;
};

export const SITES: Site[] = [
  { id: 'granada', name: 'Granada', hood: 'Av. 9N', prev: 2200, curr: 3400, offPrevPerHour: 0.8, offCurrPerHour: 3.8 },
  { id: 'sanantonio', name: 'San Antonio', hood: 'Cra. 6', prev: 2000, curr: 2180, offPrevPerHour: 0.7, offCurrPerHour: 0.7 },
  { id: 'jardin', name: 'Ciudad Jardín', hood: 'Cl. 16', prev: 1800, curr: 1920, offPrevPerHour: 0.6, offCurrPerHour: 0.6 },
];

export const DAYS = 30;
export const totals = {
  prevKwh: SITES.reduce((s, x) => s + x.prev, 0), // 6.000
  currKwh: SITES.reduce((s, x) => s + x.curr, 0), // 7.500
};
export const bill = { prev: totals.prevKwh * TARIFF, curr: totals.currKwh * TARIFF }; // 4,8 M → 6,0 M

export const isOpen = (h: number) => h >= OPEN_FROM && h < OPEN_TO;

/* Forma típica de una cafetería: picos al desayuno, almuerzo y media tarde */
const SHAPE = [0, 0, 0, 0, 0, 0, 1.1, 1.5, 1.6, 1.3, 1.0, 1.1, 1.4, 1.5, 1.2, 0.9, 1.0, 1.1, 0.9, 0.7, 0, 0, 0, 0];

/** kWh promedio por hora del día (perfil de un día típico del mes) */
export function hourly(site: Site, which: 'prev' | 'curr'): number[] {
  const monthly = which === 'prev' ? site.prev : site.curr;
  const offH = which === 'prev' ? site.offPrevPerHour : site.offCurrPerHour;
  const daily = monthly / DAYS;
  const closedHours = 24 - (OPEN_TO - OPEN_FROM);
  const openEnergy = daily - offH * closedHours;
  const sum = SHAPE.reduce((a, b) => a + b, 0);
  return SHAPE.map((w, h) => (isOpen(h) ? (w / sum) * openEnergy : offH));
}

export function offHoursMonthly(site: Site, which: 'prev' | 'curr') {
  const offH = which === 'prev' ? site.offPrevPerHour : site.offCurrPerHour;
  return offH * (24 - (OPEN_TO - OPEN_FROM)) * DAYS;
}

export type Hypothesis = {
  id: string;
  title: string;
  likelihood: 'Probable' | 'Posible' | 'Poco probable';
  why: string;
  check: string;
};

export const HYPOTHESES: Hypothesis[] = [
  {
    id: 'frio', title: 'Una nevera o vitrina está trabajando de más', likelihood: 'Probable',
    why: 'El consumo nocturno es constante toda la noche, como el de un compresor que no se apaga.',
    check: 'Revisa que las puertas cierren bien y que el termostato no esté al máximo.',
  },
  {
    id: 'encendido', title: 'Algún equipo queda encendido al cerrar', likelihood: 'Posible',
    why: 'Aire acondicionado, máquina de espresso en espera o el aviso luminoso suman ~3 kWh por hora.',
    check: 'Pide al equipo de cierre una foto del tablero y los equipos apagados por 3 noches.',
  },
  {
    id: 'externo', title: 'Una conexión que no es del café', likelihood: 'Poco probable',
    why: 'Pasa en locales compartidos, pero el aumento empezó de golpe a inicios de octubre.',
    check: 'Bia puede medir por circuito una noche y descartarlo.',
  },
];

export const SLOTS = [
  { id: 'jue', day: 'Jueves 5 nov', time: '9:00 p. m. – 11:00 p. m.' },
  { id: 'vie', day: 'Viernes 6 nov', time: '9:00 p. m. – 11:00 p. m.' },
  { id: 'lun', day: 'Lunes 9 nov', time: '8:30 p. m. – 10:30 p. m.' },
];

export const fmtMillions = (cop: number) =>
  `$${(cop / 1_000_000).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`;
