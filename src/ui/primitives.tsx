import {
  createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState,
  type ReactNode,
} from 'react';
import { IconCheckCircle, IconFlask, IconX } from './icons';

/* ---------------------------------------------------------------- Tooltip */
export type TipSide = 'top' | 'right';
export type TipState = { x: number; y: number; content: ReactNode; side: TipSide } | null;

export function useTooltip() {
  const [tip, setTip] = useState<TipState>(null);
  const show = useCallback((el: Element, content: ReactNode, side: TipSide = 'top') => {
    const r = el.getBoundingClientRect();
    setTip(side === 'right'
      ? { x: r.right + 12, y: r.top + r.height / 2, content, side }
      : { x: r.left + r.width / 2, y: r.top, content, side });
  }, []);
  const hide = useCallback(() => setTip(null), []);
  /** props para elementos SVG/HTML: hover + foco (teclado) muestran el tooltip */
  const bind = (content: ReactNode, side: TipSide = 'top') => ({
    onMouseEnter: (e: React.MouseEvent) => show(e.currentTarget, content, side),
    onMouseLeave: hide,
    onFocus: (e: React.FocusEvent) => show(e.currentTarget, content, side),
    onBlur: hide,
  });
  useEffect(() => {
    if (!tip) return;
    const close = () => setTip(null);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [tip]);
  const node = tip ? (
    <div className={`tooltip ${tip.side === 'right' ? 'tooltip--right' : ''}`} role="tooltip" style={{ left: tip.x, top: tip.y }}>{tip.content}</div>
  ) : null;
  return { bind, node, hide };
}

/* ---------------------------------------------------------------- Toasts */
type Toast = { id: number; message: ReactNode; action?: { label: string; onClick: () => void } };
const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((all) => [...all.slice(-2), { ...t, id }]);
    window.setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), 6000);
  }, []);
  const dismiss = (id: number) => setToasts((all) => all.filter((x) => x.id !== id));
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <IconCheckCircle className="toast__icon" />
            <span className="toast__msg">{t.message}</span>
            {t.action && (
              <button className="btn" onClick={() => { t.action!.onClick(); dismiss(t.id); }}>{t.action.label}</button>
            )}
            <button className="btn btn--icon" aria-label="Cerrar notificación" onClick={() => dismiss(t.id)}>
              <IconX size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------------------------------------------------------- Drawer */
export function Drawer({
  open, onClose, labelledBy, children,
}: { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const el = ref.current;
    const first = el?.querySelector<HTMLElement>('[data-autofocus]') ?? el;
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'Tab' && el) {
        const items = [...el.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, select, [tabindex]:not([tabindex="-1"])')];
        if (!items.length) return;
        const a = items[0], z = items[items.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      lastFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <div className="drawer" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={ref} tabIndex={-1}>
        {children}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Segmented */
export function Segmented<T extends string>({
  value, onChange, options, label,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ x: 0, w: 0 });
  useLayoutEffect(() => {
    const btn = wrap.current?.querySelector<HTMLElement>('[aria-checked="true"]');
    if (btn) setThumb({ x: btn.offsetLeft, w: btn.offsetWidth });
  }, [value]);
  const onKey = (e: React.KeyboardEvent) => {
    const i = options.findIndex((o) => o.value === value);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const n = options[(i + (e.key === 'ArrowRight' ? 1 : options.length - 1)) % options.length];
      onChange(n.value);
      requestAnimationFrame(() => wrap.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus());
    }
  };
  return (
    <div className="segmented" role="radiogroup" aria-label={label} ref={wrap} onKeyDown={onKey}>
      <span className="segmented__thumb" style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }} aria-hidden />
      {options.map((o) => (
        <button
          key={o.value} role="radio" aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1} onClick={() => onChange(o.value)}
        >{o.label}</button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Count-up */
export function useCountUp(target: number, duration = 600) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setV(target); from.current = target; return; }
    const start = performance.now(), a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setV(a + (target - a) * e);
      if (p < 1) raf = requestAnimationFrame(tick); else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); from.current = target; };
  }, [target, duration]);
  return v;
}

export function CountUp({ value, format = (n) => Math.round(n).toString() }: { value: number; format?: (n: number) => string }) {
  const v = useCountUp(value);
  return <span className="num">{format(v)}</span>;
}

/* ---------------------------------------------------------------- Demo states */
export type DemoState = 'normal' | 'loading' | 'empty' | 'error';
export function DemoStates({ value, onChange }: { value: DemoState; onChange: (s: DemoState) => void }) {
  const [open, setOpen] = useState(false);
  const opts: { v: DemoState; l: string }[] = [
    { v: 'normal', l: 'Datos normales' }, { v: 'loading', l: 'Cargando' },
    { v: 'empty', l: 'Sin resultados' }, { v: 'error', l: 'Error de conexión' },
  ];
  return (
    <div className="demo-states">
      {open && (
        <div className="demo-states__panel" role="radiogroup" aria-label="Simular estado de la interfaz">
          <p>Simular estado</p>
          {opts.map((o) => (
            <button key={o.v} role="radio" aria-checked={value === o.v} onClick={() => { onChange(o.v); setOpen(false); }}>
              {o.l}{value === o.v && <span aria-hidden>●</span>}
            </button>
          ))}
        </div>
      )}
      <button className="btn" aria-expanded={open} onClick={() => setOpen(!open)} style={{ boxShadow: 'var(--shadow-2)' }}>
        <IconFlask size={16} /> Estados {value !== 'normal' && <span className="badge badge--warn">{opts.find((o) => o.v === value)!.l}</span>}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- formato */
export const fmtM = (n: number) => `$${n.toLocaleString('es-CO', { maximumFractionDigits: 0 })} M`;
export const fmtCOP = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`;
export const fmtInt = (n: number) => Math.round(n).toLocaleString('es-CO');
export const initials = (name: string) => name.split(' ').map((p) => p[0]).join('').slice(0, 2);
