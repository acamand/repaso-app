import { useEffect, useState } from 'react';
import type { Capitulo, CuriosidadDiaria, PerPerfilProgress } from '@/types';
import { loadCapitulo } from '@/lib/ruta';

interface Props {
  progress: PerPerfilProgress;
  xpGanado: number;
  /** Persiste la nueva lista de curiosidades vistas cuando se elige una. */
  onCuriosidadesVistas: (vistas: string[]) => void;
  onVolver: () => void;
}

function clave(etapaId: string, c: CuriosidadDiaria): string {
  return `${etapaId}::${c.titulo}`;
}

export function CuriosidadDia({ progress, xpGanado, onCuriosidadesVistas, onVolver }: Props) {
  const etapaId = progress.viaje.etapaActualId;
  const [capitulo, setCapitulo] = useState<Capitulo | null>(null);
  const [curiosidad, setCuriosidad] = useState<CuriosidadDiaria | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const cap = await loadCapitulo(etapaId);
      if (cancelado) return;
      setCapitulo(cap);

      const curiosidades = cap?.curiosidades_diarias ?? [];
      if (curiosidades.length === 0) {
        setCuriosidad(null);
        setCargando(false);
        return;
      }

      const vistas = progress.viaje.curiosidadesVistas;
      const noVistas = curiosidades.filter((c) => !vistas.includes(clave(etapaId, c)));

      let elegida: CuriosidadDiaria;
      let nuevasVistas: string[];
      if (noVistas.length > 0) {
        elegida = noVistas[Math.floor(Math.random() * noVistas.length)];
        nuevasVistas = [...vistas, clave(etapaId, elegida)];
      } else {
        // Todas vistas: se reinicia el ciclo para esta etapa.
        elegida = curiosidades[Math.floor(Math.random() * curiosidades.length)];
        const otrasEtapas = vistas.filter((k) => !k.startsWith(`${etapaId}::`));
        nuevasVistas = [...otrasEtapas, clave(etapaId, elegida)];
      }

      setCuriosidad(elegida);
      setCargando(false);
      onCuriosidadesVistas(nuevasVistas);
    })();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acento = capitulo?.sello.color_fondo ?? '#2E5C7E';

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4">
      <div
        className="card w-full max-w-md p-8 text-center relative overflow-hidden"
        style={{
          boxShadow: `0 0 0 2px ${acento}55, 0 8px 40px -8px ${acento}66`,
        }}
      >
        {/* Brillo sutil superior con el color del país */}
        <div
          className="absolute inset-x-0 top-0 h-24 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top, ${acento}33, transparent 70%)`,
          }}
        />

        <div className="relative">
          <div className="text-xs uppercase tracking-[0.25em] text-copper">Sesión completada</div>
          <div className="font-display text-3xl mt-1">¡Bien hecho! 🎉</div>

          <div className="mt-4 inline-flex items-center gap-2 bg-mustard/15 border border-mustard/40 rounded-full px-4 py-1.5">
            <span className="font-display text-xl text-slate">+{xpGanado}</span>
            <span className="text-sm text-paper-700">XP hoy</span>
          </div>

          {cargando && (
            <p className="text-paper-700 text-sm mt-8">Buscando una curiosidad…</p>
          )}

          {!cargando && curiosidad && (
            <section className="mt-8">
              <div
                className="text-[0.65rem] uppercase tracking-[0.3em] font-medium mb-3"
                style={{ color: acento }}
              >
                Curiosidad del día
              </div>
              <div className="text-5xl mb-3" aria-hidden>
                {curiosidad.emoji}
              </div>
              <h2 className="font-display text-2xl leading-tight mb-3">{curiosidad.titulo}</h2>
              <p className="text-sm leading-relaxed text-paper-700">{curiosidad.texto}</p>
            </section>
          )}

          {!cargando && !curiosidad && (
            <p className="text-paper-700 text-sm mt-8">
              Sigue explorando: pronto habrá curiosidades de este país.
            </p>
          )}

          <button onClick={onVolver} className="btn-primary w-full mt-8">
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
