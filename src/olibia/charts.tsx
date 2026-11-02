import type { ReactNode } from 'react';
import { GOAL } from './data';

type Bind = (content: ReactNode) => Record<string, unknown>;

/* Cierres por mes con meta — barras enfocables, mes actual resaltado */
export function ClosuresChart({ values, labels, bind }: { values: number[]; labels: string[]; bind: Bind }) {
  const W = 420, H = 180, pad = { l: 24, r: 8, t: 16, b: 26 };
  const max = 12;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const bw = Math.min(34, (iw / values.length) * 0.56);
  const y = (n: number) => pad.t + ih - (n / max) * ih;
  const last = values.length - 1;
  return (
    <svg className="viz" viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Cierres por mes. Meta de ${GOAL} cierres mensuales.`}>
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
          <g key={labels[i]} className={`viz__bar ${i === last ? 'is-current' : ''}`} tabIndex={0}
            aria-label={`${labels[i]}: ${n} cierres, ${pct}% de la meta`}
            {...bind(<><strong>{labels[i]} · {n} cierres</strong><br /><span className="muted">{pct}% de la meta{i > 0 ? ` · ${n - values[i - 1] >= 0 ? '+' : ''}${n - values[i - 1]} vs. mes anterior` : ''}</span></>)}>
            <rect x={cx - bw / 2 - 6} y={pad.t} width={bw + 12} height={ih} className="viz__hit" />
            <rect x={cx - bw / 2} y={y(n)} width={bw} height={h} rx={6} className="viz__rect" style={{ transformOrigin: `${cx}px ${pad.t + ih}px` }} />
            <text x={cx} y={y(n) - 7} className="viz__value" textAnchor="middle">{n}</text>
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
