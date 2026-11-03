import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './olibia.css';
import {
  CHANNELS, DETAILS, EMPTY_FILTERS, GOAL, MONTHS, OWNERS, PERIODS, STAGES,
  activeFilterCount, buildView, filterRows, toCSV,
  type Channel, type Filters, type Opportunity, type Owner, type PeriodKey, type Row, type Stage,
} from './data';
import { ClosuresChart, GoalRing } from './charts';
import {
  CountUp, DemoStates, Drawer, fmtM, initials, useToast, useTooltip, type DemoState,
} from '../ui/primitives';
import {
  IconAlert, IconArrowRight, IconBell, IconBuilding, IconCalendar, IconChart, IconCheck,
  IconChevronDown, IconChevronLeft, IconChevronRight, IconDownload, IconFilter,
  IconInbox, IconLayers, IconMenu, IconPulse, IconRefresh, IconSearch, IconSettings,
  IconSort, IconSparkle, IconUsers, IconX,
} from '../ui/icons';

type SortKey = 'value' | 'company' | 'next' | 'stage';
type Done = Record<string, number>; // key periodo+id → timestamp

const OWNER_HUE: Record<Owner, string> = {
  'Ana López': '#8b5cf6', 'Carlos Ruiz': '#2b8cff', 'Laura Díaz': '#f59e0b', 'Mateo Gil': '#14b8a6',
};
const STAGE_COLOR: Record<Stage, string> = { Contacto: 'var(--stage-1)', 'Calificación': 'var(--stage-2)', Propuesta: 'var(--stage-3)', 'Negociación': 'var(--stage-4)' };
const CHANNEL_COLOR: Record<Channel, string> = { Outbound: 'var(--viz-1)', Referidos: 'var(--viz-2)', Inbound: 'var(--viz-3)' };

export function OlibiaApp() {
  const [months, setMonths] = useState<PeriodKey[]>(['oct']);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [done, setDone] = useState<Done>({});
  const [banner, setBanner] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState<DemoState>('normal');
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'value', dir: -1 });
  const toast = useToast();
  const tip = useTooltip();
  const searchRef = useRef<HTMLInputElement>(null);

  const p = useMemo(() => buildView(months), [months]);
  const periodKey = months.join('-');
  const effectiveFilters = demo === 'empty' ? { ...filters, query: '___' } : filters;
  const rows = useMemo(() => filterRows(p.rows, effectiveFilters), [p, effectiveFilters]);
  const sorted = useMemo(() => {
    const r = [...rows];
    const val = (o: Row) =>
      sort.key === 'value' ? o.value : sort.key === 'company' ? o.company
        : sort.key === 'stage' ? STAGES.indexOf(o.stage) : MONTHS.indexOf(o.month) * 100 + parseInt(o.nextContact, 10);
    r.sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir);
    return r;
  }, [rows, sort]);
  const baseRows = useMemo(() => filterRows(p.rows, { ...effectiveFilters, stage: '' }), [p, effectiveFilters]);
  const baseTotal = baseRows.reduce((s, r) => s + r.value, 0);
  const total = rows.reduce((s, r) => s + r.value, 0);
  const negotiation = rows.filter((r) => r.stage === 'Negociación');
  const negValue = negotiation.reduce((s, r) => s + r.value, 0);
  const isLoading = loading || demo === 'loading';
  const isError = demo === 'error';
  const nFilters = activeFilterCount(filters);
  const selected = selectedId ? p.rows.find((r) => r.id === selectedId) ?? null : null;

  const loadTimer = useRef(0);
  const changePeriod = (next: PeriodKey[]) => {
    if (!next.length || next.join() === months.join()) return;
    setLoading(true);
    setMonths(MONTHS.filter((m) => next.includes(m)));
    setSelectedId(null);
    window.clearTimeout(loadTimer.current);
    loadTimer.current = window.setTimeout(() => setLoading(false), 420);
  };
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters((f) => ({ ...f, [k]: v }));
  const toggle = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters((f) => ({ ...f, [k]: f[k] === v ? EMPTY_FILTERS[k] : v }));
  const clear = () => setFilters(EMPTY_FILTERS);

  const exportCSV = () => {
    const blob = new Blob([toCSV(sorted)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `olibia-${periodKey}-oportunidades.csv`; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast({ message: <>CSV listo · <strong>{sorted.length} oportunidades</strong>{nFilters ? ' (filtradas)' : ''}</> });
  };

  const markDone = useCallback((o: Row) => {
    const key = o.month + o.id;
    setDone((d) => ({ ...d, [key]: Date.now() }));
    toast({
      message: <>Seguimiento con <strong>{o.company}</strong> registrado</>,
      action: { label: 'Deshacer', onClick: () => setDone((d) => { const n = { ...d }; delete n[key]; return n; }) },
    });
  }, [toast]);

  // atajo "/" para buscar
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  const idx = selected ? sorted.findIndex((r) => r.id === selected.id) : -1;
  const goSibling = (d: 1 | -1) => { const n = sorted[idx + d]; if (n) setSelectedId(n.id); };
  const sortBy = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === 'value' ? -1 : 1 }));

  const deltaClosed = p.prevClosed === null ? null : p.closed - p.prevClosed;
  const dueSoon = p.rows.filter((r) => !done[r.month + r.id]).length;
  const ownerMax = Math.max(...p.ownerClosures, 1);

  return (
    <div className={`ol ${collapsed ? 'is-collapsed' : ''}`}>
      <a href="#ol-main" className="skip-link">Saltar al contenido</a>

      {/* ================= Sidebar ================= */}
      <aside className={`ol-nav ${navOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
        <div className="ol-nav__brand">
          <a href="#/" className="ol-logo" aria-label="Volver al inicio de la prueba">
            <span className="ol-logo__mark" aria-hidden />
            <span className="ol-logo__word">olibia</span>
          </a>
          <button className="btn btn--ghost btn--icon ol-nav__close" aria-label="Cerrar menú" onClick={() => setNavOpen(false)}><IconX /></button>
        </div>
        <button className="ol-nav__workspace" {...tip.bind('Equipo comercial · cambiar (demo)', 'right')}>
          <span className="ol-avatar ol-avatar--sq" aria-hidden>EC</span>
          <span className="ol-nav__label"><strong>Equipo comercial</strong><small>4 ejecutivos · Cali</small></span>
          <IconChevronDown size={16} className="ol-nav__label" />
        </button>
        <nav className="ol-nav__groups">
          <NavGroup title="Comercial" collapsed={collapsed}>
            <NavItem icon={<IconPulse />} label="Pulso" active collapsed={collapsed} tip={tip.bind} />
            <NavItem icon={<IconLayers />} label="Pipeline" collapsed={collapsed} tip={tip.bind} />
            <NavItem icon={<IconBuilding />} label="Cuentas" collapsed={collapsed} tip={tip.bind} />
            <NavItem icon={<IconCalendar />} label="Seguimientos" badge={dueSoon} collapsed={collapsed} tip={tip.bind} />
            <NavItem icon={<IconChart />} label="Reportes" collapsed={collapsed} tip={tip.bind} />
          </NavGroup>
          <NavGroup title="Equipo" collapsed={collapsed}>
            <NavItem icon={<IconUsers />} label="Ejecutivos" collapsed={collapsed} tip={tip.bind} />
            <NavItem icon={<IconSparkle />} label="Olibia AI" tag="Beta" collapsed={collapsed} tip={tip.bind} />
          </NavGroup>
        </nav>
        <div className="ol-nav__foot">
          <NavItem icon={<IconSettings />} label="Ajustes" collapsed={collapsed} tip={tip.bind} />
          <div className="ol-nav__me">
            <span className="ol-avatar" style={{ background: '#08ddbc', color: '#05070b' }} aria-hidden>CO</span>
            <span className="ol-nav__label"><strong>Cristian Ortiz</strong><small>Director comercial</small></span>
          </div>
          <button className="ol-nav__collapse" onClick={() => setCollapsed(!collapsed)} aria-pressed={collapsed}
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}>
            {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
            <span className="ol-nav__label">Contraer</span>
          </button>
        </div>
      </aside>
      {navOpen && <div className="scrim ol-nav__scrim" onClick={() => setNavOpen(false)} aria-hidden />}

      {/* ================= Main ================= */}
      <main id="ol-main" className="ol-main" tabIndex={-1}>
        <header className="ol-top">
          <button className="btn btn--ghost btn--icon ol-top__menu" aria-label="Abrir menú" onClick={() => setNavOpen(true)}><IconMenu /></button>
          <div className="ol-top__title">
            <p className="ol-crumb mono">Comercial / Pulso</p>
            <h1 className="display"><span className="ol-top__name">Pulso comercial</span><span className="ol-top__period">{p.label}</span></h1>
          </div>
          <div className="ol-top__actions">
            <PeriodPicker value={months} onChange={changePeriod} />
            <button className="btn" onClick={exportCSV} disabled={isError || isLoading || !sorted.length}>
              <IconDownload size={16} /><span className="hide-sm">Exportar CSV</span>
            </button>
          </div>
        </header>

        {banner && p.single && months[0] === 'oct' && !isError && (
          <section className="ol-banner" aria-label="Aviso comercial">
            <span className="ol-banner__pulse" aria-hidden />
            <p><strong>Recta final de octubre.</strong> Quedan <span className="num">2</span> cierres para la meta y{' '}
              <span className="num">{p.rows.filter((r) => r.stage === 'Negociación').length}</span> negociaciones abiertas por{' '}
              <span className="num">{fmtM(p.rows.filter((r) => r.stage === 'Negociación').reduce((s, r) => s + r.value, 0))}</span>/mes.</p>
            <button className="btn btn--accent" onClick={() => { setFilters({ ...EMPTY_FILTERS, stage: 'Negociación' }); document.getElementById('ol-pipeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
              Ver negociaciones <IconArrowRight size={16} />
            </button>
            <button className="btn btn--ghost btn--icon" aria-label="Cerrar aviso" onClick={() => setBanner(false)}><IconX size={16} /></button>
          </section>
        )}

        {isError ? (
          <section className="ol-card">
            <div className="state">
              <div className="state__icon" style={{ background: 'var(--warn-soft)', color: 'var(--warn-ink)' }}><IconAlert /></div>
              <h3>No pudimos cargar el pulso comercial</h3>
              <p>La conexión con el CRM falló. Tus filtros y seguimientos de esta sesión se conservan.</p>
              <button className="btn btn--primary" onClick={() => setDemo('normal')}><IconRefresh size={16} /> Reintentar</button>
            </div>
          </section>
        ) : (
          <>
            {/* ---------- Resultados del equipo ---------- */}
            <section className="ol-section" aria-labelledby="ol-results-h">
              <div className="ol-section__head">
                <h2 id="ol-results-h">Resultados del equipo</h2>
                <span className="badge badge--outline">Total del periodo · no cambia con filtros</span>
              </div>
              <div className="ol-results">
                <article className="ol-card ol-goal">
                  {isLoading ? <Skel h={150} /> : (<>
                    <div className="ol-goal__ring">
                      <GoalRing value={p.closed} goal={p.goal} />
                      <div className="ol-goal__center">
                        <span className="ol-goal__n display"><CountUp value={p.closed} /></span>
                        <span className="ol-goal__of mono">de {p.goal}</span>
                      </div>
                    </div>
                    <div className="ol-goal__text">
                      <p className="ol-label">{p.single ? 'Cierres del mes' : `Cierres en ${p.months.length} meses`}</p>
                      <p className="ol-big num"><CountUp value={(p.closed / p.goal) * 100} />% <small>de la meta</small></p>
                      {deltaClosed !== null ? (
                        <p className={`ol-delta ${deltaClosed > 0 ? 'is-up' : deltaClosed < 0 ? 'is-down' : 'is-neutral'}`}>
                          {deltaClosed > 0 ? '▲' : deltaClosed < 0 ? '▼' : '='} {Math.abs(deltaClosed)} vs. {p.prevLabel}
                        </p>
                      ) : <p className="ol-delta">Meta: {GOAL} cierres por mes</p>}
                    </div>
                  </>)}
                </article>
                <article className="ol-card ol-history">
                  <div className="ol-card__head">
                    <h3>Cierres por mes</h3>
                    <span className="ol-legend"><i className="sw sw--bar" /> Cierres <i className="sw sw--goal" /> Meta</span>
                  </div>
                  {isLoading ? <Skel h={150} /> : <ClosuresChart values={MONTHS.map((m) => PERIODS[m].closed)} labels={MONTHS.map((m) => PERIODS[m].short)} selected={MONTHS.map((m) => months.includes(m))} onSelect={(i) => changePeriod([MONTHS[i]])} bind={tip.bind} />}
                </article>
                <article className="ol-card ol-owners">
                  <div className="ol-card__head"><h3>Cierres por ejecutivo</h3></div>
                  {isLoading ? <Skel h={150} /> : (
                    <ol className="ol-rank">
                      {OWNERS.map((o, i) => ({ o, n: p.ownerClosures[i] })).sort((a, b) => b.n - a.n).map(({ o, n }) => (
                        <li key={o}>
                          <span className="ol-avatar ol-avatar--xs" style={{ background: OWNER_HUE[o] }} aria-hidden>{initials(o)}</span>
                          <span className="ol-rank__name">{o}</span>
                          <span className="ol-rank__track" aria-hidden><span style={{ width: `${(n / ownerMax) * 100}%`, background: OWNER_HUE[o] }} /></span>
                          <span className="num ol-rank__n">{n}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </article>
              </div>
            </section>

            {/* ---------- Pipeline abierto ---------- */}
            <section className="ol-section" id="ol-pipeline" aria-labelledby="ol-pipe-h">
              <div className="ol-section__head">
                <h2 id="ol-pipe-h">Pipeline abierto</h2>
                <span className={`badge ${nFilters ? 'badge--ai' : 'badge--outline'}`}>
                  <IconFilter size={12} /> {nFilters ? `${nFilters} filtro${nFilters > 1 ? 's' : ''} activo${nFilters > 1 ? 's' : ''}` : 'Responde a los filtros'}
                </span>
              </div>

              {/* Filtros */}
              <div className="ol-filters" role="group" aria-label="Filtros del pipeline">
                <label className="ol-search">
                  <IconSearch size={16} />
                  <span className="sr-only">Buscar empresa</span>
                  <input ref={searchRef} type="search" placeholder="Buscar empresa" value={filters.query} onChange={(e) => set('query', e.target.value)} />
                  <kbd className="mono" aria-hidden>/</kbd>
                </label>
                <FilterGroup label="Responsable">
                  {OWNERS.map((o) => (
                    <button key={o} className="chip chip--avatar" aria-pressed={filters.owner === o} onClick={() => toggle('owner', o)} {...tip.bind(o)} aria-label={`Responsable: ${o}`}>
                      <span className="ol-avatar ol-avatar--xs" style={{ background: OWNER_HUE[o] }} aria-hidden>{initials(o)}</span>
                    </button>
                  ))}
                </FilterGroup>
                <FilterGroup label="Canal">
                  {CHANNELS.map((c) => (
                    <button key={c} className="chip" aria-pressed={filters.channel === c} onClick={() => toggle('channel', c)}>
                      <i className="sw" style={{ background: CHANNEL_COLOR[c] }} aria-hidden />{c}
                    </button>
                  ))}
                </FilterGroup>
                <FilterGroup label="Valor mensual">
                  {([30, 50] as const).map((v) => (
                    <button key={v} className="chip" aria-pressed={filters.minimum === v} onClick={() => toggle('minimum', v)}>≥ ${v} M</button>
                  ))}
                </FilterGroup>
                <button className="btn ol-clear" onClick={clear} disabled={!nFilters} aria-label={nFilters ? `Limpiar ${nFilters} filtros` : 'No hay filtros activos'}>
                  <IconX size={14} /> Limpiar filtros{nFilters > 0 && <span className="ol-clear__n num">{nFilters}</span>}
                </button>
              </div>

              {/* Embudo por etapa = filtro de etapa */}
              <div className="ol-stages-head">
                <h3>Oportunidades por etapa</h3>
                <span className="ol-muted">{filters.stage ? <>Filtrando por <strong>{filters.stage}</strong> · toca de nuevo para quitar</> : 'Toca una etapa para filtrar'}</span>
              </div>
              <div className="ol-stages" role="group" aria-label="Oportunidades por etapa. Selecciona una para filtrar.">
                {STAGES.map((s, i) => {
                  const inStage = baseRows.filter((r) => r.stage === s);
                  const v = inStage.reduce((a, r) => a + r.value, 0);
                  const on = filters.stage === s;
                  const dim = filters.stage && !on;
                  return (
                    <button key={s} className={`ol-stage ${on ? 'is-on' : ''} ${dim ? 'is-dim' : ''}`} aria-pressed={on} onClick={() => toggle('stage', s)}
                      disabled={isLoading} style={{ '--sc': STAGE_COLOR[s] } as React.CSSProperties}>
                      <span className="ol-stage__top">{s}</span>
                      {isLoading ? <Skel h={34} /> : (<>
                        <span className="ol-stage__n num">{inStage.length}</span>
                        <span className="ol-stage__v num">{fmtM(v)}<small>/mes</small></span>
                        <span className="ol-stage__bar" aria-hidden><span style={{ width: `${baseTotal ? (v / baseTotal) * 100 : 0}%` }} /></span>
                      </>)}
                    </button>
                  );
                })}
              </div>

              <div className="ol-pipe-grid">
                {/* Resumen AI */}
                <article className="ol-card ol-ai" aria-labelledby="ol-ai-h">
                  <div className="ol-card__head">
                    <h3 id="ol-ai-h"><IconSparkle size={16} /> Resumen Olibia</h3>
                    <span className="badge badge--ai">Simulado</span>
                  </div>
                  <div aria-live="polite" className="ol-ai__body">
                    {isLoading ? <><Skel h={18} /><Skel h={18} w="80%" /><Skel h={18} w="60%" /></>
                      : rows.length ? (<>
                        <p>Hay <mark className="num">{rows.length} oportunidades</mark> abiertas por <mark className="num">{fmtM(total)}</mark>/mes.{' '}
                          {negotiation.length
                            ? <>{negotiation.length === 1 ? 'Una está' : `${negotiation.length} están`} en negociación y concentran <mark className="num">{Math.round((negValue / total) * 100)}%</mark> del valor.</>
                            : 'Ninguna de las visibles está en negociación.'}</p>
                        <p className="ol-ai__next"><strong>Siguiente paso:</strong>{' '}
                          {negotiation.length
                            ? <>prioriza <button className="ol-link" onClick={() => setSelectedId([...negotiation].sort((a, b) => b.value - a.value)[0].id)}>{[...negotiation].sort((a, b) => b.value - a.value)[0].company}</button> — es la de mayor valor en negociación.</>
                            : <>confirma los próximos contactos de esta vista con cada responsable.</>}</p>
                      </>) : <p>Sin oportunidades para resumir con estos filtros.</p>}
                  </div>
                  <p className="ol-foot-note">Generado con reglas sobre los datos visibles. No usa un servicio de AI.</p>
                </article>

                {/* Canal */}
                <article className="ol-card ol-channel">
                  <div className="ol-card__head"><h3>Origen</h3><span className="ol-muted num">{rows.length} abiertas</span></div>
                  {isLoading ? <Skel h={80} /> : (<>
                    <div className="ol-stack" role="group" aria-label="Distribución por canal">
                      {CHANNELS.map((c) => {
                        const n = rows.filter((r) => r.channel === c).length;
                        if (!n) return null;
                        return (
                          <button key={c} className={`ol-stack__seg ${filters.channel === c ? 'is-on' : ''}`} style={{ flexGrow: n, background: CHANNEL_COLOR[c] }}
                            onClick={() => toggle('channel', c)} aria-label={`${c}: ${n} oportunidades. Filtrar por este canal`}
                            {...tip.bind(<><strong>{c}</strong><br /><span className="muted">{n} de {rows.length} · {Math.round((n / rows.length) * 100)}%</span></>)} />
                        );
                      })}
                      {!rows.length && <span className="ol-stack__empty" />}
                    </div>
                    <ul className="ol-channel__legend">
                      {CHANNELS.map((c) => {
                        const n = rows.filter((r) => r.channel === c).length;
                        return <li key={c}><i className="sw" style={{ background: CHANNEL_COLOR[c] }} />{c}<span className="num">{n}</span></li>;
                      })}
                    </ul>
                  </>)}
                </article>
              </div>

              {/* Lista */}
              <article className="ol-card ol-list" aria-labelledby="ol-list-h">
                <div className="ol-card__head">
                  <h3 id="ol-list-h">Oportunidades <span className="ol-muted num">· {rows.length}</span></h3>
                  <span className="ol-muted hide-sm">Selecciona una fila para ver el detalle</span>
                </div>
                {nFilters > 0 && (
                  <div className="ol-active" aria-label="Filtros activos">
                    <IconFilter size={14} className="ol-muted" />
                    {filters.query.trim() && <button className="ol-active__chip" onClick={() => set('query', '')} aria-label={`Quitar búsqueda ${filters.query}`}>“{filters.query}” <IconX size={12} /></button>}
                    {filters.stage && <button className="ol-active__chip" onClick={() => set('stage', '')} aria-label={`Quitar etapa ${filters.stage}`}>{filters.stage} <IconX size={12} /></button>}
                    {filters.owner && <button className="ol-active__chip" onClick={() => set('owner', '')} aria-label={`Quitar responsable ${filters.owner}`}>{filters.owner} <IconX size={12} /></button>}
                    {filters.channel && <button className="ol-active__chip" onClick={() => set('channel', '')} aria-label={`Quitar canal ${filters.channel}`}>{filters.channel} <IconX size={12} /></button>}
                    {filters.minimum > 0 && <button className="ol-active__chip" onClick={() => set('minimum', 0)} aria-label="Quitar valor mínimo">≥ ${filters.minimum} M <IconX size={12} /></button>}
                    <button className="ol-active__clear" onClick={clear}>Limpiar todo</button>
                  </div>
                )}
                {isLoading ? (
                  <div className="ol-list__skel">{[0, 1, 2, 3, 4].map((i) => <Skel key={i} h={44} />)}</div>
                ) : sorted.length ? (
                  <div className="ol-table" role="table" aria-label="Oportunidades abiertas">
                    <div className="ol-tr ol-th" role="row">
                      <SortH k="company" sort={sort} onSort={sortBy}>Empresa</SortH>
                      <SortH k="stage" sort={sort} onSort={sortBy}>Etapa</SortH>
                      <SortH k="value" sort={sort} onSort={sortBy} align="end">Valor / mes</SortH>
                      <span role="columnheader" className="ol-th__plain">Responsable</span>
                      <SortH k="next" sort={sort} onSort={sortBy}>Próximo contacto</SortH>
                      <span role="columnheader" className="sr-only">Acción</span>
                    </div>
                    {sorted.map((r) => {
                      const isDone = !!done[r.month + r.id];
                      const max = Math.max(...p.rows.map((x) => x.value));
                      return (
                        <div key={r.id} role="row" className={`ol-tr ${selectedId === r.id ? 'is-selected' : ''} ${isDone ? 'is-done' : ''}`} onClick={() => setSelectedId(r.id)}>
                          <span role="cell" className="ol-td ol-td--co">
                            <span className="ol-co__logo" aria-hidden>{r.company[0]}</span>
                            <span><strong>{r.company}</strong><small><i className="sw" style={{ background: CHANNEL_COLOR[r.channel] }} />{r.channel}</small></span>
                          </span>
                          <span role="cell" className="ol-td"><span className="ol-status" style={{ '--sc': STAGE_COLOR[r.stage] } as React.CSSProperties}><i />{r.stage}</span></span>
                          <span role="cell" className="ol-td ol-td--val num">
                            <span className="ol-val__bar" aria-hidden><span style={{ width: `${(r.value / max) * 100}%` }} /></span>
                            {fmtM(r.value)}
                          </span>
                          <span role="cell" className="ol-td ol-td--owner">
                            <span className="ol-avatar ol-avatar--xs" style={{ background: OWNER_HUE[r.owner] }} aria-hidden>{initials(r.owner)}</span>
                            <span className="hide-md">{r.owner}</span>
                          </span>
                          <span role="cell" className="ol-td ol-td--date">
                            {isDone ? <span className="badge badge--accent"><IconCheck size={12} /> Hecho</span> : <><IconCalendar size={14} /> {r.nextContact}</>}
                          </span>
                          <span role="cell" className="ol-td ol-td--act">
                            <button className="btn btn--ghost btn--icon" aria-label={`Ver detalle de ${r.company}`} onClick={(e) => { e.stopPropagation(); setSelectedId(r.id); }}>
                              <IconChevronRight size={16} />
                            </button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="state">
                    <div className="state__icon"><IconInbox /></div>
                    <h3>Nada por aquí con estos filtros</h3>
                    <p>{demo === 'empty' ? 'Estado vacío simulado.' : `Ninguna oportunidad de ${p.label} cumple ${nFilters > 1 ? 'todas las condiciones' : 'la condición'}.`}</p>
                    <button className="btn btn--primary" onClick={() => { clear(); setDemo('normal'); }}>Limpiar filtros</button>
                  </div>
                )}
              </article>
            </section>
          </>
        )}
        <footer className="ol-footer mono">Datos ficticios para el ejercicio · Sin conexión a sistemas de Bia/Olibia</footer>
      </main>

      {/* ================= Detalle ================= */}
      <Drawer open={!!selected} onClose={() => setSelectedId(null)} labelledBy="ol-detail-h">
        {selected && (
          <Detail o={selected} period={PERIODS[selected.month].label} doneAt={done[selected.month + selected.id]} onDone={() => markDone(selected)}
            onClose={() => setSelectedId(null)}
            onPrev={idx > 0 ? () => goSibling(-1) : undefined} onNext={idx >= 0 && idx < sorted.length - 1 ? () => goSibling(1) : undefined}
            pos={idx >= 0 ? `${idx + 1} de ${sorted.length}` : ''} />
        )}
      </Drawer>

      <DemoStates value={demo} onChange={setDemo} />
      {tip.node}
    </div>
  );
}

/* ---------------------------------------------------------------- piezas */
function Skel({ h, w = '100%' }: { h: number; w?: string }) {
  return <span className="skeleton" style={{ display: 'block', height: h, width: w }} aria-hidden />;
}

function NavGroup({ title, children, collapsed }: { title: string; children: React.ReactNode; collapsed: boolean }) {
  return (
    <div className="ol-nav__group">
      <p className={`ol-nav__title mono ${collapsed ? 'sr-only' : ''}`}>{title}</p>
      <ul>{children}</ul>
    </div>
  );
}

function NavItem({ icon, label, active, badge, tag, collapsed, tip }: {
  icon: React.ReactNode; label: string; active?: boolean; badge?: number; tag?: string; collapsed: boolean;
  tip: (c: React.ReactNode, side?: 'top' | 'right') => Record<string, unknown>;
}) {
  return (
    <li>
      <a href={active ? '#/olibia' : undefined} role={active ? undefined : 'link'} aria-disabled={active ? undefined : true}
        tabIndex={0}
        className={`ol-nav__item ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}
        {...(collapsed ? tip(label, 'right') : active ? {} : tip('Fuera del alcance de la demo', 'right'))}>
        <span className="ol-nav__icon">{icon}</span>
        <span className="ol-nav__label">{label}</span>
        {!!badge && <span className="ol-nav__badge num">{badge}</span>}
        {tag && <span className="ol-nav__tag ol-nav__label">{tag}</span>}
      </a>
    </li>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ol-fgroup" role="group" aria-label={label}>
      <span className="ol-fgroup__l mono" aria-hidden>{label}</span>
      <div className="ol-fgroup__items">{children}</div>
    </div>
  );
}

function SortH({ k, sort, onSort, children, align }: {
  k: SortKey; sort: { key: SortKey; dir: 1 | -1 }; onSort: (k: SortKey) => void; children: React.ReactNode; align?: 'end';
}) {
  const on = sort.key === k;
  return (
    <span role="columnheader" aria-sort={on ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'} style={{ justifyContent: align === 'end' ? 'flex-end' : undefined }}>
      <button className={`ol-sort ${on ? 'is-on' : ''}`} onClick={() => onSort(k)}>
        {children}
        <span aria-hidden className="ol-sort__i">{on ? (sort.dir === 1 ? '↑' : '↓') : <IconSort size={12} />}</span>
      </button>
    </span>
  );
}


/* ---------------------------------------------------------------- Selector de periodo */
function PeriodPicker({ value, onChange }: { value: PeriodKey[]; onChange: (v: PeriodKey[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector<HTMLElement>('.ol-period__btn')?.focus(); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const presets: { label: string; months: PeriodKey[] }[] = [
    { label: 'Este mes', months: ['oct'] },
    { label: 'Mes anterior', months: ['sep'] },
    { label: 'Últimos 3 meses', months: ['ago', 'sep', 'oct'] },
    { label: 'Últimos 6 meses', months: [...MONTHS] },
  ];
  const same = (a: PeriodKey[], b: PeriodKey[]) => a.length === b.length && a.every((m) => b.includes(m));
  const toggleMonth = (m: PeriodKey) => {
    if (value.includes(m)) { if (value.length > 1) onChange(value.filter((x) => x !== m)); }
    else onChange([...value, m]);
  };
  const label = buildView(value).label;
  return (
    <div className="ol-period" ref={ref}>
      <button className="btn ol-period__btn" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
        <IconCalendar size={16} />
        <span className="ol-period__label">{label}</span>
        {value.length > 1 && <span className="ol-period__n num">{value.length}</span>}
        <IconChevronDown size={14} className="ol-period__chev" />
      </button>
      {open && (
        <div className="ol-period__pop" role="dialog" aria-label="Elegir periodo">
          <p className="ol-period__t mono">Rápido</p>
          <div className="ol-period__presets">
            {presets.map((pr) => (
              <button key={pr.label} className="chip" aria-pressed={same(pr.months, value)} onClick={() => onChange(pr.months)}>{pr.label}</button>
            ))}
          </div>
          <p className="ol-period__t mono">Meses · 2026 <span>(puedes elegir varios)</span></p>
          <div className="ol-period__grid">
            {MONTHS.map((m) => {
              const on = value.includes(m);
              return (
                <button key={m} className={`ol-month ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => toggleMonth(m)}
                  disabled={on && value.length === 1} title={on && value.length === 1 ? 'Debe quedar al menos un mes' : undefined}>
                  <span>{PERIODS[m].short}</span>
                  <small className="num">{PERIODS[m].closed} cierres</small>
                  {on && <IconCheck size={12} className="ol-month__check" />}
                </button>
              );
            })}
          </div>
          <div className="ol-period__foot">
            <span className="ol-muted">Resultados sumados · pipeline en su estado más reciente</span>
            <button className="btn btn--primary" onClick={() => setOpen(false)}>Listo</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ o, period, doneAt, onDone, onClose, onPrev, onNext, pos }: {
  o: Opportunity; period: string; doneAt?: number; onDone: () => void; onClose: () => void;
  onPrev?: () => void; onNext?: () => void; pos: string;
}) {
  const d = DETAILS[o.id];
  const si = STAGES.indexOf(o.stage);
  const [confirming, setConfirming] = useState(false);
  useEffect(() => setConfirming(false), [o.id]);
  return (
    <>
      <header className="ol-d__head">
        <div className="ol-d__nav">
          <button className="btn btn--ghost btn--icon" onClick={onPrev} disabled={!onPrev} aria-label="Oportunidad anterior"><IconChevronLeft size={16} /></button>
          <span className="mono ol-muted">{pos}</span>
          <button className="btn btn--ghost btn--icon" onClick={onNext} disabled={!onNext} aria-label="Oportunidad siguiente"><IconChevronRight size={16} /></button>
        </div>
        <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Cerrar detalle" data-autofocus><IconX /></button>
      </header>
      <div className="ol-d__body" key={o.id}>
        <div className="ol-d__title">
          <span className="ol-co__logo ol-co__logo--lg" aria-hidden>{o.company[0]}</span>
          <div>
            <h2 id="ol-detail-h">{o.company}</h2>
            <p className="ol-muted">{d.contact} · {d.role}</p>
          </div>
        </div>

        <div className="ol-d__value">
          <p className="ol-label">Valor mensual estimado</p>
          <p className="display ol-d__big num">${o.value}<small> millones COP</small></p>
        </div>

        <ol className="ol-steps" aria-label={`Etapa actual: ${o.stage}, paso ${si + 1} de 4`}>
          {STAGES.map((s, j) => (
            <li key={s} className={j < si ? 'is-past' : j === si ? 'is-now' : ''} aria-current={j === si ? 'step' : undefined}>
              <span className="ol-steps__dot">{j < si ? <IconCheck size={12} /> : j + 1}</span>
              <span className="ol-steps__l">{s}</span>
            </li>
          ))}
        </ol>

        <dl className="ol-d__grid">
          <div><dt>Responsable</dt><dd><span className="ol-avatar ol-avatar--xs" style={{ background: OWNER_HUE[o.owner] }} aria-hidden>{initials(o.owner)}</span>{o.owner}</dd></div>
          <div><dt>Próximo contacto</dt><dd><IconCalendar size={14} />{o.nextContact} 2026</dd></div>
          <div><dt>Canal</dt><dd><i className="sw" style={{ background: CHANNEL_COLOR[o.channel] }} />{o.channel}</dd></div>
          <div><dt>Periodo</dt><dd>{period}</dd></div>
        </dl>

        <div className="ol-d__note">
          <p className="ol-label"><IconBell size={12} /> Última nota</p>
          <p>{d.note}</p>
        </div>
      </div>

      <footer className="ol-d__foot">
        {doneAt ? (
          <div className="ol-d__done" role="status">
            <span className="ol-d__check"><IconCheck size={16} /></span>
            <div><strong>Seguimiento registrado</strong><small>Hoy, {new Date(doneAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} · solo en esta sesión</small></div>
          </div>
        ) : confirming ? (
          <div className="ol-d__confirm">
            <p>¿Confirmas que contactaste a <strong>{d.contact}</strong>?</p>
            <div>
              <button className="btn" onClick={() => setConfirming(false)}>Cancelar</button>
              <button className="btn btn--primary" autoFocus onClick={() => { onDone(); setConfirming(false); }}><IconCheck size={16} /> Sí, registrar</button>
            </div>
          </div>
        ) : (
          <button className="btn btn--primary btn--lg ol-d__cta" onClick={() => setConfirming(true)}>
            <IconCheck size={18} /> Marcar seguimiento realizado
          </button>
        )}
      </footer>
    </>
  );
}

