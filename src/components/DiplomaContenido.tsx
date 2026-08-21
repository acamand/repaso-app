import { forwardRef } from 'react';
import { IlustracionPais } from '@/components/IlustracionPais';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const LOGO_SRC = `${BASE}/icons/icon-192.png`;

export interface DatosDiploma {
  nombre: string;
  paises: number;
  nivelNombre: string;
  fp: number;
  fecha: string;
}

interface Props {
  datos: DatosDiploma;
}

/**
 * Contenido visual del diploma (certificado + nota P.D.), en un único
 * bloque con proporción A4 apaisado: es a la vez lo que se ve en pantalla y
 * lo que captura `html2canvas` para el PDF, así que pantalla y descarga
 * quedan siempre idénticas por construcción.
 */
export const DiplomaContenido = forwardRef<HTMLDivElement, Props>(function DiplomaContenido(
  { datos },
  ref,
) {
  const { nombre, paises, nivelNombre, fp, fecha } = datos;
  return (
    <div ref={ref} className="bg-parchment mx-auto w-full max-w-[900px] p-2">
      {/* Marco doble: borde cobre exterior, borde mostaza interior. Sin alto
          fijo: el contenido decide la altura, para que nunca se recorte en
          pantallas estrechas. El PDF se ajusta a la proporción real ya
          capturada, así que no necesita que esto sea exactamente A4. */}
      <div className="border-[3px] border-copper rounded-lg p-2.5">
        <div className="border border-mustard/70 rounded-md px-6 py-5 sm:px-10 sm:py-7 flex flex-col items-center text-center">
          <img src={LOGO_SRC} alt="Park4Learn" className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl shadow-sm" />

          <IlustracionPais pais="España" size={64} className="mt-1.5" />

          <h1 className="font-display text-2xl sm:text-4xl mt-2 tracking-tight text-ink">
            Diploma de Gran Explorador/a
          </h1>

          <p className="text-[0.7rem] sm:text-sm text-paper-700 mt-4">Se otorga a:</p>
          <p className="font-display text-xl sm:text-3xl text-slate mt-0.5">{nombre}</p>

          <p className="text-[0.65rem] sm:text-sm leading-relaxed text-ink mt-3 max-w-2xl">
            Por haber completado con éxito una expedición de aprendizaje de <strong>51 días</strong>{' '}
            a través de Europa, recorriendo aproximadamente <strong>12.000 kilómetros</strong> y{' '}
            <strong>{paises} países</strong>, alcanzando el rango de <strong>{nivelNombre}</strong>{' '}
            con <strong>{fp} Furgo Points</strong> conseguidos.
          </p>

          <p className="text-[0.65rem] sm:text-sm leading-relaxed text-ink mt-2 max-w-2xl">
            Durante este viaje ha demostrado paciencia, curiosidad, esfuerzo constante y ha
            superado los Retos del Camino, aprendiendo lecciones que perdurarán mucho más allá de
            este viaje.
          </p>

          <div className="mt-3">
            <p className="text-[0.65rem] sm:text-sm text-paper-700">
              Firmado con orgullo por vuestros compañeros de ruta,
            </p>
            <p className="font-display text-base sm:text-xl text-copper mt-0.5">Marco y Marta</p>
          </div>

          <p className="text-[0.6rem] sm:text-xs text-paper-500 mt-2">{fecha}</p>

          {/* Nota P.D.: recuadro visualmente diferenciado, sin salir del mismo marco. */}
          <div className="mt-3 w-full max-w-2xl bg-mustard/10 border border-dashed border-copper/60 rounded-soft px-3 py-2 sm:px-4 sm:py-3 relative">
            <span
              className="absolute -top-2.5 -left-2.5 text-base sm:text-lg select-none"
              aria-hidden
            >
              🗝️
            </span>
            <p className="text-[0.6rem] sm:text-xs leading-snug text-ink text-left">
              P.D. de Marco y Marta: Este diploma es más que un papel — es una llave. Guardadlo
              bien, porque muy pronto, en un lugar pequeño y especial llamado Lagunas de Contreras,
              alguien os pedirá que lo presentéis... y entonces ocurrirá algo que solo pasa una vez
              en la vida. Estad atentos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
