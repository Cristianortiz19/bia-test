import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/base.css';
import './styles/home.css';
import { ToastProvider } from './ui/primitives';
import { OlibiaApp } from './olibia/OlibiaApp';
import { BiaApp } from './bia/BiaApp';
import { Home } from './Home';

/** Router mínimo por hash: funciona en cualquier hosting estático sin rewrites. */
function useRoute() {
  const get = () => window.location.hash.replace(/^#/, '') || '/';
  const [route, setRoute] = useState(get);
  useEffect(() => {
    const on = () => { setRoute(get()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

function App() {
  const route = useRoute();
  useEffect(() => {
    document.title = route.startsWith('/olibia') ? 'Olibia · Pulso comercial'
      : route.startsWith('/bia') ? 'Bia · Tu factura de energía' : 'Bia · Olibia — Design Engineer';
  }, [route]);
  if (route.startsWith('/olibia')) return <OlibiaApp />;
  if (route.startsWith('/bia')) return <BiaApp />;
  return <Home />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
