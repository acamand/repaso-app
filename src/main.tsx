import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/index.css';

// La PWA puede quedar abierta en el móvil días seguidos (típico durante el
// viaje) sin volver a navegar nunca, así que el navegador no llega a
// comprobar por sí solo si hay una versión nueva desplegada: el service
// worker (con skipWaiting/clientsClaim activados) se queda esperando a que
// alguien lo active. Aquí se fuerza esa comprobación de forma activa cada
// minuto y, en cuanto detecta una versión nueva, se recarga sola una única
// vez — así una corrección urgente no depende de que cada alumno cierre y
// reabra la app a mano.
if ('serviceWorker' in navigator) {
  let recargando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargando) return;
    recargando = true;
    window.location.reload();
  });
  navigator.serviceWorker.ready.then((registration) => {
    setInterval(() => registration.update(), 60 * 1000);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
