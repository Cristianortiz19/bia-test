import { IconArrowRight, IconBolt, IconPulse } from './ui/icons';

export function Home() {
  return (
    <main className="home">
      <header className="home__head">
        <span className="home__mark" aria-hidden />
        <p className="mono home__kicker">Prueba Design Engineer · Cristian Ortiz</p>
        <h1 className="display home__title">Dos experiencias,<br /><em>un mismo sistema.</em></h1>
        <p className="home__lead">
          Un dashboard comercial replanteado para decidir, no solo para mirar, y una página que convierte
          una factura de energía confusa en una decisión clara en menos de dos minutos.
        </p>
      </header>
      <nav className="home__grid" aria-label="Retos">
        <a className="home__card home__card--dark" href="#/olibia">
          <IconPulse size={28} />
          <h2>Olibia · Pulso comercial</h2>
          <p>Uplift radical del dashboard: pipeline explorable, filtros con alcance explícito, detalle lateral y seguimiento con deshacer.</p>
          <span className="home__cta">Abrir dashboard <IconArrowRight size={16} /></span>
        </a>
        <a className="home__card" href="#/bia">
          <IconBolt size={28} />
          <h2>Bia · ¿Por qué subió mi factura?</h2>
          <p>Tres cafeterías, +25% en la factura. Qué pasó, dónde, cuándo y qué hacer — separando hechos de hipótesis.</p>
          <span className="home__cta">Abrir experiencia <IconArrowRight size={16} /></span>
        </a>
      </nav>
      <footer className="home__foot mono">React + TypeScript · Vite · datos ficticios · sin backend</footer>
    </main>
  );
}
