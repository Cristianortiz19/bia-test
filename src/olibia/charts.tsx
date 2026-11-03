import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { GOAL } from './data';

type Bind = (content: ReactNode) => Record<string, unknown>;

/* Cierres por mes con meta — barras enfocables, mes actual resaltado */
export function ClosuresChart({ values, labels, selected, onSelect, bind }: {
  values: number[]; labels: string[]; selected: boolean[]; onSelect: (i: number) => void; bind: Bind;
}) {
  // El ancho se mide del contenedor y el alto es fijo: la gráfica no se deforma al cambiar el tamaño de la ventana.
  const ref = useRef<SVGSVGElement>(null);
  const [W, setW] = useState(420);
  useLayoutEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 200, pad = { l: 24, r: 8, t: 22, b: 26 };
  const max = 12;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const bw = Math.min(40, (iw / values.length) * 0.5);
  const y = (n: number) => pad.t + ih - (n / max) * ih;
  return (
    <svg ref={ref} className="viz" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Cierres por mes. Meta de ${GOAL} cierres mensuales.`}>
      <defs>
        <pattern id="viz-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="#2b2b31" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="#55555e" strokeWidth="2.4" />
        </pattern>
      </defs>
      {[0, 5, 10].map((n) => (
        <g key={n}>
          <line x1={pad.l} x2={W - pad.r} y1={y(n)} y2={y(n)} className="viz__grid" />
          <text x={pad.l - 8} y={y(n) + 3.5} className="viz__axis" textAnchor="end">{n}</text>
        </g>
      ))}
      <line x1={pad.l} x2={W - pad.r} y1={y(GOAL)} y2={y(GOAL)} className="viz__goal" />
      <text x={W - pad.r} y={y(GOAL) - 6} className="viz__goal-label" textAnchor="end">Meta {GOAL}</text>
      {values.map((n, i) => {
        const cx = pad.l + (iw / values.length) * (i + 0.5);
        const h = (n / max) * ih;
        const pct = Math.round((n / GOAL) * 100);
        return (
          <g key={labels[i]} className={`viz__bar ${selected[i] ? 'is-current' : ''}`} tabIndex={0} role="button"
            aria-pressed={selected[i]} aria-label={`${labels[i]}: ${n} cierres, ${pct}% de la meta. Ver solo este mes`}
            onClick={() => onSelect(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(i); } }}
            {...bind(<><strong>{labels[i]} · {n} cierres</strong><br /><span className="muted">Clic para ver solo este mes · {pct}% de la meta{i > 0 ? ` · ${n - values[i - 1] >= 0 ? '+' : ''}${n - values[i - 1]} vs. mes anterior` : ''}</span></>)}>
            <rect x={cx - bw / 2 - 6} y={pad.t} width={bw + 12} height={ih} className="viz__hit" />
            <rect x={cx - bw / 2} y={y(n)} width={bw} height={h} rx={bw / 2} className="viz__rect" style={{ transformOrigin: `${cx}px ${pad.t + ih}px` }} />
            <rect x={cx - 13} y={y(n) - 22} width={26} height={17} rx={8.5} className="viz__pill" />
            <text x={cx} y={y(n) - 10} className="viz__value" textAnchor="middle">{n}</text>
            <text x={cx} y={H - 8} className="viz__axis" textAnchor="middle">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* Anillo de progreso hacia la meta */
export function GoalRing({ value, goal = GOAL, size = 132 }: { value: number; goal?: number; size?: number }) {
  const r = size / 2 - 10, c = 2 * Math.PI * r, p = Math.min(1, value / goal);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ring" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} className="ring__track" />
      <circle cx={size / 2} cy={size / 2} r={r} className="ring__fill"
        strokeDasharray={c} strokeDashoffset={c * (1 - p)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}
