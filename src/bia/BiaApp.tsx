import { useEffect, useMemo, useState } from 'react';
import './bia.css';
import {
  BUSINESS, HYPOTHESES, OPEN_FROM, OPEN_TO, SITES, SLOTS, TARIFF, bill, fmtMillions, hourly, isOpen,
  offHoursMonthly, totals, type SiteId,
} from './data';
import { CountUp, DemoStates, fmtCOP, fmtInt, useToast, useTooltip, type DemoState } from '../ui/primitives';
import {
  IconAlert, IconArrowRight, IconBell, IconBolt, IconCalendar, IconCheck, IconCheckCircle,
  IconChevronDown, IconMoon, IconRefresh, IconSnow, IconX,
} from '../ui/icons';

type Verdict = 'pendiente' | 'descartada' | 'confirmada';

export function BiaApp() {
  const [demo, setDemo] = useState<DemoState>('normal');
  const [booting, setBooting] = useState(true);
  const [siteId, setSiteId] = useState<SiteId>('granada');
  const [compare, setCompare] = useState(true);
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const [openHyp, setOpenHyp] = useState<string | null>('frio');
  const [slot, setSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [alert, setAlert] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const toast = useToast();
  const tip = useTooltip();

  useEffect(() => { const t = window.setTimeout(() => setBooting(false), 700); return () => clearTimeout(t); }, []);
  const [current, setCurrent] = useState('');
  useEffect(() => {
    const ids = ['bia-where', 'bia-when', 'bia-why', 'bia-act'];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setCurrent(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [demo]);

  const site = SITES.find((s) => s.id === siteId)!;
  const extraKwh = totals.currKwh - totals.prevKwh; // 1.500
  const extraCop = bill.curr - bill.prev; // 1,2 M
  const hot = SITES.reduce((a, b) => (b.curr - b.prev > a.curr - a.prev ? b : a));
  const hotShare = (hot.curr - hot.prev) / extraKwh;
  const offExtra = offHoursMonthly(hot, 'curr') - offHoursMonthly(hot, 'prev'); // 900 kWh
  const savings = offExtra * TARIFF;
  const loading = booting || demo === 'loading';

  const confirmBooking = () => {
    if (!slot) return;
    setBooking(true);
    window.setTimeout(() => {
      setBooking(false); setBooked(slot);
      toast({ message: <>Revisión agendada · <strong>{SLOTS.find((s) => s.id === slot)!.day}</strong></>, action: { label: 'Deshacer', onClick: () => setBooked(null) } });
    }, 900);
  };

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (demo === 'error') return (
    <Shell demo={demo} setDemo={setDemo}>
      <section className="bia-state">
        <div className="state">
          <div className="state__icon" style={{ background: 'var(--warn-soft)', color: 'var(--warn-ink)' }}><IconAlert /></div>
          <h3>No pudimos leer tu factura de octubre</h3>
          <p>El operador de red aún no nos entrega la lectura. Tus datos de septiembre siguen disponibles.</p>
          <button className="btn btn--primary" onClick={() => setDemo('normal')}><IconRefresh size={16} /> Reintentar</button>
        </div>
      </section>
    </Shell>
  );
  if (demo === 'empty') return (
    <Shell demo={demo} setDemo={setDemo}>
      <section className="bia-state">
        <div className="state">
          <div className="state__icon"><IconCalendar /></div>
          <h3>Tu factura de noviembre aún no llega</h3>
          <p>Cuando tengamos al menos 7 días de lecturas te mostraremos cómo va el mes frente a octubre.</p>
          <button className="btn" onClick={() => setDemo('normal')}>Ver octubre</button>
        </div>
      </section>
    </Shell>
  );

  return (
    <Shell demo={demo} setDemo={setDemo}>
      {/* ============ 1. La respuesta ============ */}
      <section className="bia-hero" aria-labelledby="bia-h1">
        <p className="bia-eyebrow mono">Factura de octubre · 3 sedes</p>
        {loading ? <HeroSkel /> : (<>
          <h1 id="bia-h1" className="display bia-h1">
            Tu factura subió <span className="bia-hl">{fmtMillions(extraCop)}</span> porque consumiste más,
            <em> no porque la energía esté más cara.</em>
          </h1>

          <div className="bia-bridge" role="img" aria-label={`Septiembre ${fmtMillions(bill.prev)}, más ${fmtMillions(extraCop)} por consumo adicional, igual a octubre ${fmtMillions(bill.curr)}`}>
            <div className="bia-bridge__col">
              <span className="bia-bridge__label">Septiembre</span>
              <span className="bia-bridge__plot"><span className="bia-bridge__bar" style={{ height: `${(bill.prev / bill.curr) * 100}%` }}><b className="num">{fmtMillions(bill.prev)}</b></span></span>
              <span className="bia-bridge__sub num">{fmtInt(totals.prevKwh)} kWh</span>
            </div>
            <div className="bia-bridge__col bia-bridge__col--delta">
              <span className="bia-bridge__label">Consumo extra</span>
              <span className="bia-bridge__plot"><span className="bia-bridge__bar" style={{ height: `${(extraCop / bill.curr) * 100}%`, bottom: `${(bill.prev / bill.curr) * 100}%` }}><b className="num">+{fmtMillions(extraCop)}</b></span></span>
              <span className="bia-bridge__sub num">+{fmtInt(extraKwh)} kWh</span>
            </div>
            <div className="bia-bridge__col bia-bridge__col--tariff">
              <span className="bia-bridge__label">Precio de la energía</span>
              <span className="bia-bridge__plot"><span className="bia-bridge__flat" style={{ bottom: `${(bill.prev / bill.curr) * 100}%` }}><b className="num">+$0</b><small>tarifa igual</small></span></span>
              <span className="bia-bridge__sub num">${TARIFF}/kWh</span>
            </div>
            <div className="bia-bridge__col bia-bridge__col--now">
              <span className="bia-bridge__label">Octubre</span>
              <span className="bia-bridge__plot"><span className="bia-bridge__bar" style={{ height: '100%' }}><b className="num">{fmtMillions(bill.curr)}</b></span></span>
              <span className="bia-bridge__sub num">{fmtInt(totals.currKwh)} kWh · +25%</span>
            </div>
          </div>

          <ul className="bia-facts" aria-label="Resumen">
            <li><Fact /> La tarifa se mantuvo en <strong>${TARIFF}/kWh</strong></li>
            <li><Fact /> <strong className="num">{Math.round(hotShare * 100)}%</strong> del aumento viene de <strong>{hot.name}</strong></li>
            <li><Fact /> {hot.name} consume de noche, con el café cerrado</li>
            <li><Hypo /> La causa aún <strong>no está confirmada</strong></li>
          </ul>

          <div className="bia-hero__ctas">
            <button className="btn btn--primary btn--lg" onClick={() => go('bia-act')}>Ver qué hacer <IconArrowRight size={16} /></button>
            <button className="btn btn--ghost btn--lg" onClick={() => go('bia-where')}>Entender el porqué <IconChevronDown size={16} /></button>
          </div>
        </>)}
      </section>

      <nav className="bia-steps" aria-label="Recorrido">
        {[['bia-where', 'Dónde'], ['bia-when', 'Cuándo'], ['bia-why', 'Por qué'], ['bia-act', 'Qué hacer']].map(([id, l]) => (
          <button key={id} onClick={() => go(id)} aria-current={current === id ? 'true' : undefined}>{l}</button>
        ))}
      </nav>

      {/* ============ 2. Dónde ============ */}
      <section id="bia-where" className="bia-sec" aria-labelledby="bia-where-h">
        <SecHead id="bia-where-h" title="¿Dónde?" lead={`De los ${fmtInt(extraKwh)} kWh extra, ${fmtInt(hot.curr - hot.prev)} son de una sola sede.`} />
        {loading ? <div className="bia-sites">{[0, 1, 2].map((i) => <span key={i} className="skeleton" style={{ height: 180 }} />)}</div> : (<>
          <div className="bia-share" aria-hidden>
            {SITES.map((s) => (
              <span key={s.id} className={`bia-share__seg ${s.id === hot.id ? 'is-hot' : ''}`} style={{ flexGrow: s.curr - s.prev }}>
                <b className="num">+{fmtInt(s.curr - s.prev)}</b>
              </span>
            ))}
          </div>
          <div className="bia-sites" role="radiogroup" aria-label="Elige una sede para ver su detalle">
            {SITES.map((s) => {
              const d = s.curr - s.prev, pct = Math.round((d / s.prev) * 100), on = s.id === siteId;
              return (
                <button key={s.id} role="radio" aria-checked={on} className={`bia-site ${on ? 'is-on' : ''} ${s.id === hot.id ? 'is-hot' : ''}`}
                  onClick={() => setSiteId(s.id)}>
                  <span className="bia-site__top">
                    <span><strong>{s.name}</strong><small>{s.hood}</small></span>
                    {s.id === hot.id ? <span className="badge badge--warn"><span className="dot" />Revisar</span> : <span className="badge"><IconCheck size={12} />Normal</span>}
                  </span>
                  <span className="bia-site__delta display num">+<CountUp value={d} format={(n) => fmtInt(n)} /><small> kWh</small></span>
                  <span className="bia-site__meta num">{fmtInt(s.prev)} → {fmtInt(s.curr)} kWh · <b>+{pct}%</b></span>
                  <span className="bia-site__money num">+{fmtCOP(d * TARIFF)} en la factura</span>
                  <span className="bia-site__sel" aria-hidden>{on ? 'Viendo detalle' : 'Ver detalle'}</span>
                </button>
              );
            })}
          </div>
        </>)}
      </section>

      {/* ============ 3. Cuándo ============ */}
      <section id="bia-when" className="bia-sec" aria-labelledby="bia-when-h">
        <SecHead id="bia-when-h" title="¿Cuándo?" tag={site.name}
          lead={site.id === hot.id
            ? `Con el café cerrado (${OPEN_TO}:00 a ${OPEN_FROM}:00) ${site.name} pasó de ${fmtInt(site.offPrevPerHour * 10)} a ${fmtInt(site.offCurrPerHour * 10)} kWh por noche.`
            : `${site.name} consume casi igual que en septiembre; el aumento está dentro de lo normal.`} />
        <article className="bia-card">
          <div className="bia-card__head">
            <div className="bia-legend">
              <span><i className="bia-sw bia-sw--open" />Abierto · octubre</span>
              <span><i className="bia-sw bia-sw--closed" />Cerrado · octubre</span>
              {compare && <span><i className="bia-sw bia-sw--prev" />Septiembre</span>}
            </div>
            <label className="bia-switch">
              <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
              <span aria-hidden className="bia-switch__ui" />Comparar con septiembre
            </label>
          </div>
          {loading ? <span className="skeleton" style={{ display: 'block', height: 240 }} /> : <DayChart key={siteId} siteId={siteId} compare={compare} bind={tip.bind} />}
          {site.id === hot.id && !loading && (
            <p className="bia-callout"><IconMoon size={16} />
              <span><strong>{fmtInt(offExtra)} kWh</strong> de los {fmtInt(site.curr - site.prev)} kWh extra ocurrieron de noche. Eso son <strong>{fmtCOP(savings)}</strong> al mes con el café cerrado. <Fact inline /></span>
            </p>
          )}
        </article>
      </section>

      {/* ============ 4. Por qué ============ */}
      <section id="bia-why" className="bia-sec" aria-labelledby="bia-why-h">
        <SecHead id="bia-why-h" title="¿Por qué?" lead="Separamos lo que medimos de lo que todavía estamos suponiendo." />
        <div className="bia-why">
          <article className="bia-card bia-known">
            <h3><Fact /> Lo que sabemos</h3>
            <ul>
              <li>La tarifa no cambió: <strong>${TARIFF}/kWh</strong> ambos meses.</li>
              <li>El consumo total subió <strong>{fmtInt(extraKwh)} kWh (+25%)</strong>.</li>
              <li><strong>{hot.name}</strong> explica <strong>{fmtInt(hot.curr - hot.prev)} kWh</strong>; las otras dos sedes, {fmtInt(extraKwh - (hot.curr - hot.prev))} kWh.</li>
              <li>{fmtInt(offExtra)} kWh se consumieron entre las {OPEN_TO}:00 y las {OPEN_FROM}:00, de forma constante.</li>
            </ul>
          </article>
          <article className="bia-card bia-unknown">
            <h3><Hypo /> Lo que aún no sabemos</h3>
            <p className="bia-muted">Posibles causas del consumo nocturno en {hot.name}. Márcalas a medida que las revises.</p>
            <ul className="bia-hyps">
              {HYPOTHESES.map((h) => {
                const v = verdicts[h.id] ?? 'pendiente';
                const open = openHyp === h.id;
                return (
                  <li key={h.id} className={`bia-hyp is-${v}`}>
                    <button className="bia-hyp__head" aria-expanded={open} aria-controls={`hyp-${h.id}`} onClick={() => setOpenHyp(open ? null : h.id)}>
                      <span className={`bia-like bia-like--${h.likelihood === 'Probable' ? 3 : h.likelihood === 'Posible' ? 2 : 1}`} aria-label={`Probabilidad: ${h.likelihood}`}><i /><i /><i /></span>
                      <span className="bia-hyp__t">{h.title}<small>{v === 'pendiente' ? h.likelihood : v === 'descartada' ? 'Descartada por ti' : 'Confirmada por ti'}</small></span>
                      <IconChevronDown size={16} className="bia-hyp__chev" />
                    </button>
                    <div id={`hyp-${h.id}`} className="bia-hyp__body" hidden={!open}>
                      <p><strong>Por qué lo pensamos:</strong> {h.why}</p>
                      <p><strong>Cómo confirmarlo:</strong> {h.check}</p>
                      <div className="bia-hyp__acts" role="group" aria-label="Resultado de tu revisión">
                        <button className="chip" aria-pressed={v === 'confirmada'} onClick={() => setVerdicts((x) => ({ ...x, [h.id]: v === 'confirmada' ? 'pendiente' : 'confirmada' }))}><IconCheck size={14} /> Era esto</button>
                        <button className="chip" aria-pressed={v === 'descartada'} onClick={() => setVerdicts((x) => ({ ...x, [h.id]: v === 'descartada' ? 'pendiente' : 'descartada' }))}><IconX size={14} /> Lo descarté</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </article>
        </div>
      </section>

      {/* ============ 5. Qué hacer ============ */}
      <section id="bia-act" className="bia-sec" aria-labelledby="bia-act-h">
        <SecHead id="bia-act-h" title="¿Qué hago ahora?" lead={`Si se elimina el consumo nocturno en ${hot.name}, la factura bajaría cerca de ${fmtCOP(savings)} al mes.`} />
        <div className="bia-act">
          <article className="bia-card bia-cta">
            <span className="badge badge--accent"><IconBolt size={12} /> Recomendado</span>
            <h3 className="display">Una revisión nocturna en {hot.name}</h3>
            <p>Un técnico de Bia mide por circuito durante 2 horas después del cierre y te dice qué equipo está consumiendo. Sin costo en tu plan.</p>
            {booked ? (
              <div className="bia-booked" role="status">
                <span className="bia-booked__i"><IconCheck size={18} /></span>
                <div>
                  <strong>Agendado: {SLOTS.find((s) => s.id === booked)!.day}</strong>
                  <small>{SLOTS.find((s) => s.id === booked)!.time} · te confirmamos por WhatsApp</small>
                </div>
                <button className="btn btn--ghost" onClick={() => { setBooked(null); setSlot(null); }}>Cambiar</button>
              </div>
            ) : (<>
              <fieldset className="bia-slots">
                <legend>Elige un horario</legend>
                {SLOTS.map((s) => (
                  <label key={s.id} className={`bia-slot ${slot === s.id ? 'is-on' : ''}`}>
                    <input type="radio" name="slot" value={s.id} checked={slot === s.id} onChange={() => setSlot(s.id)} />
                    <span><strong>{s.day}</strong><small>{s.time}</small></span>
                    <span className="bia-slot__r" aria-hidden />
                  </label>
                ))}
              </fieldset>
              <button className="btn btn--accent btn--lg bia-cta__btn" disabled={!slot || booking} onClick={confirmBooking} aria-busy={booking}>
                {booking ? <><span className="bia-spin" aria-hidden /> Agendando…</> : <>Agendar revisión <IconArrowRight size={16} /></>}
              </button>
              {!slot && <p className="bia-hint">Selecciona un horario para continuar.</p>}
            </>)}
          </article>

          <div className="bia-act__side">
            <article className="bia-card">
              <h3><IconSnow size={16} /> Esta noche, al cerrar {hot.name}</h3>
              <ul className="bia-checks">
                {['Revisa que la vitrina y las neveras cierren bien', 'Apaga la máquina de espresso desde el interruptor', 'Apaga el aire acondicionado y el aviso luminoso'].map((c) => (
                  <li key={c}>
                    <label className={checks[c] ? 'is-done' : ''}>
                      <input type="checkbox" checked={!!checks[c]} onChange={(e) => setChecks((x) => ({ ...x, [c]: e.target.checked }))} />
                      <span className="bia-check" aria-hidden><IconCheck size={12} /></span>{c}
                    </label>
                  </li>
                ))}
              </ul>
              <p className="bia-muted bia-progress num">{Object.values(checks).filter(Boolean).length} de 3 listos</p>
            </article>
            <article className="bia-card bia-alert">
              <div>
                <h3><IconBell size={16} /> Avísame si vuelve a pasar</h3>
                <p className="bia-muted">Alerta si alguna sede consume más de 15 kWh con el café cerrado.</p>
              </div>
              <label className="bia-switch bia-switch--lg">
                <input type="checkbox" checked={alert} onChange={(e) => {
                  setAlert(e.target.checked);
                  toast({ message: e.target.checked ? <>Alerta nocturna <strong>activada</strong> para las 3 sedes</> : 'Alerta nocturna desactivada' });
                }} />
                <span aria-hidden className="bia-switch__ui" /><span className="sr-only">Activar alerta de consumo nocturno</span>
              </label>
            </article>
          </div>
        </div>
      </section>

      <footer className="bia-foot">
        <p><Fact /> Medido por Bia &nbsp;·&nbsp; <Hypo /> Hipótesis por confirmar</p>
        <p className="mono">Escenario ficticio · nombres y perfil horario simulados</p>
      </footer>
      {tip.node}
    </Shell>
  );
}

/* ---------------------------------------------------------------- piezas */
function Shell({ children, demo, setDemo }: { children: React.ReactNode; demo: DemoState; setDemo: (d: DemoState) => void }) {
  return (
    <div className="bia">
      <a href="#bia-main" className="skip-link">Saltar al contenido</a>
      <header className="bia-top">
        <a href="#/" className="bia-logo" aria-label="Volver al inicio de la prueba"><IconBolt size={20} className="bia-logo__m" />Bia</a>
        <span className="bia-top__biz"><span className="bia-top__av" aria-hidden>CL</span>{BUSINESS}<small>3 sedes · Cali</small></span>
      </header>
      <main id="bia-main" className="bia-main">{children}</main>
      <DemoStates value={demo} onChange={setDemo} />
    </div>
  );
}

function SecHead({ id, title, tag, lead }: { id: string; title: string; tag?: string; lead: string }) {
  return (
    <div className="bia-sec__head">
      <div className="bia-sec__title">
        <h2 id={id} className="display">{title}</h2>
        {tag && <span className="bia-sec__tag">{tag}</span>}
      </div>
      <p>{lead}</p>
    </div>
  );
}

function Fact({ inline }: { inline?: boolean }) {
  return <span className={`bia-tag bia-tag--fact ${inline ? 'is-inline' : ''}`}><IconCheckCircle size={12} />Medido</span>;
}
function Hypo() {
  return <span className="bia-tag bia-tag--hypo">Por confirmar</span>;
}

function HeroSkel() {
  return (
    <div style={{ display: 'grid', gap: 14 }} aria-busy="true" aria-label="Cargando tu factura">
      <span className="skeleton" style={{ height: 56, width: '90%' }} />
      <span className="skeleton" style={{ height: 56, width: '70%' }} />
      <span className="skeleton" style={{ height: 220, marginTop: 20 }} />
    </div>
  );
}

function DayChart({ siteId, compare, bind }: { siteId: SiteId; compare: boolean; bind: (c: React.ReactNode) => Record<string, unknown> }) {
  const site = SITES.find((s) => s.id === siteId)!;
  const curr = useMemo(() => hourly(site, 'curr'), [site]);
  const prev = useMemo(() => hourly(site, 'prev'), [site]);
  const W = 760, H = 250, pl = 34, pr = 8, pt = 22, pb = 28;
  const max = 10;
  const iw = W - pl - pr, ih = H - pt - pb, bw = iw / 24;
  const y = (v: number) => pt + ih - (Math.min(v, max) / max) * ih;
  const xs = (h: number) => pl + h * bw;
  return (
    <div className="bia-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Consumo promedio por hora en ${site.name}, octubre frente a septiembre`}>
        <defs>
          <pattern id="bia-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="7" height="7" fill="#2b2b31" />
            <line x1="0" y1="0" x2="0" y2="7" stroke="#5a5a64" strokeWidth="2.4" />
          </pattern>
        </defs>
        {/* bandas de cierre */}
        <rect x={xs(0)} y={pt - 14} width={bw * OPEN_FROM} height={ih + 14} className="bia-chart__night" />
        <rect x={xs(OPEN_TO)} y={pt - 14} width={bw * (24 - OPEN_TO)} height={ih + 14} className="bia-chart__night" />
        <text x={xs(OPEN_TO) + 8} y={pt - 3} className="bia-chart__band">CERRADO</text>
        <text x={xs(0) + 8} y={pt - 3} className="bia-chart__band">CERRADO</text>
        <text x={xs(OPEN_FROM) + 8} y={pt - 3} className="bia-chart__band bia-chart__band--open">ABIERTO {OPEN_FROM}:00 – {OPEN_TO}:00</text>
        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} className="bia-chart__grid" />
            <text x={pl - 8} y={y(v) + 3.5} textAnchor="end" className="bia-chart__axis">{v}</text>
          </g>
        ))}
        <text x={4} y={pt - 3} className="bia-chart__axis">kWh</text>
        {curr.map((v, h) => {
          const open = isOpen(h);
          const d = v - prev[h];
          return (
            <g key={h} className={`bia-chart__h ${open ? 'is-open' : 'is-closed'}`} tabIndex={0}
              aria-label={`${h}:00, ${v.toFixed(1)} kWh en octubre, ${prev[h].toFixed(1)} en septiembre`}
              {...bind(<><strong>{String(h).padStart(2, '0')}:00 · {open ? 'Abierto' : 'Cerrado'}</strong><br />
                <span className="muted">Oct {v.toFixed(1)} kWh · Sep {prev[h].toFixed(1)} kWh</span>
                {Math.abs(d) > 0.05 && <><br /><span style={{ color: d > 0 ? '#b45309' : '#04776a', fontWeight: 600 }}>{d > 0 ? '+' : ''}{d.toFixed(1)} kWh por hora</span></>}</>)}>
              <rect x={xs(h)} y={pt} width={bw} height={ih} className="bia-chart__hit" />
              <rect x={xs(h) + 3} y={y(v)} width={bw - 6} height={pt + ih - y(v)} rx={4} className="bia-chart__bar"
                style={{ transformOrigin: `0 ${pt + ih}px`, animationDelay: `${h * 14}ms` }} />
              {compare && <line x1={xs(h) + 2} x2={xs(h) + bw - 2} y1={y(prev[h])} y2={y(prev[h])} className="bia-chart__prev" />}
              {h % 3 === 0 && <text x={xs(h) + bw / 2} y={H - 8} textAnchor="middle" className="bia-chart__axis">{String(h).padStart(2, '0')}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

