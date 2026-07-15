import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Red de seguridad ante fallos inesperados de render. Sin esto, un error no
 * capturado deja la pantalla en blanco — y para un alumno o un padre eso es
 * indistinguible de "se ha perdido todo el progreso", aunque los datos sigan
 * intactos en localStorage. Aquí se avisa de que el progreso está a salvo y
 * se ofrece recargar, en vez de mostrar una pantalla vacía sin explicación.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Error inesperado en la app:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-dvh flex items-center justify-center p-4">
          <div className="card w-full max-w-sm p-6 text-center space-y-4">
            <div className="text-4xl" aria-hidden>🧭</div>
            <h1 className="font-display text-xl">Algo ha ido mal</h1>
            <p className="text-sm text-paper-700">
              Ha ocurrido un error inesperado, pero tu progreso guardado <strong>no se ha borrado</strong>:
              sigue a salvo en este dispositivo. Intenta recargar la página.
            </p>
            <button onClick={() => window.location.reload()} className="btn-primary w-full">
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
