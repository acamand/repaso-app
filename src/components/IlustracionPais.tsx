interface Props {
  /** Nombre del país tal y como aparece en `datos_paises` / `etapa.pais`. */
  pais: string;
  size?: number;
  className?: string;
}

const FONDO = '#EAE4D7';

/**
 * Ilustración plana de un monumento o elemento icónico por país, en el mismo
 * estilo flat/cartoon que las banderas (Flag.tsx) y la autocaravana del mapa:
 * formas simples, sin degradados, solo colores de la paleta de la app.
 * Usa siempre el mismo fondo circular neutro (parchment2) para no competir
 * visualmente con el color propio de cada sello del pasaporte, que ya vive
 * en `capitulo.sello`.
 */
export function IlustracionPais({ pais, size = 96, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={`shrink-0 ${className}`}
      role="img"
      aria-label={`Ilustración de ${pais}`}
    >
      <circle cx="80" cy="80" r="80" fill={FONDO} />
      {escenaPais(pais)}
    </svg>
  );
}

function escenaPais(pais: string) {
  switch (pais) {
    case 'España':
      return <EscenaEspana />;
    case 'Francia':
      return <EscenaFrancia />;
    case 'Bélgica':
      return <EscenaBelgica />;
    case 'Países Bajos':
      return <EscenaPaisesBajos />;
    case 'Alemania':
      return <EscenaAlemania />;
    case 'Polonia':
      return <EscenaPolonia />;
    case 'Lituania':
      return <EscenaLituania />;
    case 'Letonia':
      return <EscenaLetonia />;
    case 'Estonia':
      return <EscenaEstonia />;
    case 'Finlandia':
      return <EscenaFinlandia />;
    case 'Noruega':
      return <EscenaNoruega />;
    case 'Suecia':
      return <EscenaSuecia />;
    default:
      return null;
  }
}

/** Mezquita-Catedral de Córdoba: arcos de herradura a rayas + torre alminar. */
function EscenaEspana() {
  return (
    <g>
      <rect x="26" y="82" width="108" height="46" fill="#FFFFFF" />
      <path d="M34 128 L34 102 Q44 88 54 102 L54 128 Z" fill="#B85C38" />
      <path d="M58 128 L58 102 Q68 88 78 102 L78 128 Z" fill="#FFFFFF" stroke="#D9D2C2" strokeWidth="1" />
      <path d="M82 128 L82 102 Q92 88 102 102 L102 128 Z" fill="#B85C38" />
      <path d="M106 128 L106 102 Q116 88 126 102 L126 128 Z" fill="#FFFFFF" stroke="#D9D2C2" strokeWidth="1" />
      <rect x="26" y="122" width="108" height="8" fill="#8A4327" />
      <rect x="70" y="40" width="20" height="46" fill="#F5F2EC" stroke="#2E5C7E" strokeWidth="2" />
      <rect x="74" y="50" width="12" height="14" fill="#2E5C7E" opacity="0.45" />
      <path d="M67 40 L80 20 L93 40 Z" fill="#B85C38" />
      <circle cx="80" cy="16" r="3.5" fill="#F2C14E" />
    </g>
  );
}

/** Torre Eiffel: silueta reticulada simplificada. */
function EscenaFrancia() {
  return (
    <g>
      <path
        d="M80 20 L100 66 L92 66 L104 128 L92 128 L84 78 L76 78 L68 128 L56 128 L68 66 L60 66 Z"
        fill="#2E5C7E"
        stroke="#1F3F58"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="66" y="96" width="28" height="3" fill="#1F3F58" />
      <rect x="70" y="70" width="20" height="3" fill="#1F3F58" />
      <path d="M56 128 Q80 112 104 128" stroke="#1F3F58" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Atomium de Bruselas: esferas conectadas por tubos. */
function EscenaBelgica() {
  return (
    <g>
      <g stroke="#5C5546" strokeWidth="3" fill="none">
        <path d="M80 45 L50 75 M80 45 L110 75 M80 45 L80 90" />
        <path d="M50 75 L50 115 M110 75 L110 115" />
        <path d="M80 90 L50 115 M80 90 L110 115 M50 115 L110 115" />
      </g>
      <circle cx="80" cy="45" r="12" fill="#2E5C7E" stroke="#1F3F58" strokeWidth="1.5" />
      <circle cx="50" cy="75" r="10" fill="#F2C14E" stroke="#B8880E" strokeWidth="1.5" />
      <circle cx="110" cy="75" r="10" fill="#F2C14E" stroke="#B8880E" strokeWidth="1.5" />
      <circle cx="80" cy="90" r="9" fill="#B85C38" stroke="#8A4327" strokeWidth="1.5" />
      <circle cx="50" cy="115" r="9" fill="#6B9080" stroke="#3F5D53" strokeWidth="1.5" />
      <circle cx="110" cy="115" r="9" fill="#6B9080" stroke="#3F5D53" strokeWidth="1.5" />
    </g>
  );
}

/** Molino de viento con aspas + tulipanes. */
function EscenaPaisesBajos() {
  return (
    <g>
      <path d="M68 128 L72 60 L88 60 L92 128 Z" fill="#F5F2EC" stroke="#5C5546" strokeWidth="1.5" />
      <path d="M74 128 L76 60 L84 60 L86 128 Z" fill="#D9D2C2" opacity="0.5" />
      <path d="M66 60 L80 44 L94 60 Z" fill="#B85C38" />
      <g stroke="#2E5C7E" strokeWidth="3" strokeLinecap="round">
        <path d="M80 52 L58 30" />
        <path d="M80 52 L102 30" />
        <path d="M80 52 L58 74" />
        <path d="M80 52 L102 74" />
      </g>
      <circle cx="80" cy="52" r="4" fill="#1F3F58" />
      <path d="M40 128 Q40 116 46 116 Q52 116 52 128 Z" fill="#B85C38" />
      <rect x="45" y="122" width="2" height="10" fill="#6B9080" />
      <path d="M112 128 Q112 118 117 118 Q122 118 122 128 Z" fill="#F2C14E" />
      <rect x="116" y="123" width="2" height="9" fill="#6B9080" />
    </g>
  );
}

/** Puerta de Brandeburgo: columnas + frontón + cuadriga simplificada. */
function EscenaAlemania() {
  const columnas = [46, 58, 70, 90, 102, 114];
  return (
    <g>
      <rect x="40" y="55" width="80" height="10" fill="#5C5546" />
      <path d="M40 55 L80 34 L120 55 Z" fill="#D9D2C2" stroke="#A89F8C" strokeWidth="1" />
      {columnas.map((x) => (
        <rect key={x} x={x} y="65" width="6" height="55" fill="#F5F2EC" stroke="#A89F8C" strokeWidth="1" />
      ))}
      <rect x="38" y="120" width="84" height="8" fill="#5C5546" />
      <path d="M68 32 Q72 24 80 25 Q88 24 92 32 L90 36 L86 33 L80 35 L74 33 L70 36 Z" fill="#2E5C7E" />
    </g>
  );
}

/** Bisonte europeo (Białowieża) sobre un prado. */
function EscenaPolonia() {
  return (
    <g>
      <ellipse cx="80" cy="126" rx="46" ry="6" fill="#6B9080" opacity="0.35" />
      <rect x="55" y="108" width="7" height="18" fill="#3F332A" />
      <rect x="70" y="110" width="7" height="16" fill="#3F332A" />
      <rect x="95" y="110" width="7" height="16" fill="#3F332A" />
      <rect x="108" y="108" width="7" height="18" fill="#3F332A" />
      <path
        d="M50 108 Q46 84 66 76 Q84 68 102 78 Q116 84 118 96 Q120 104 110 108 Q90 112 70 111 Q56 111 50 108 Z"
        fill="#5C5546"
      />
      <path d="M40 100 Q28 98 26 88 Q25 78 35 76 Q46 75 48 86 Q49 94 42 100 Z" fill="#5C5546" />
      <path d="M32 80 Q27 74 30 68" stroke="#2A2018" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M40 78 Q44 71 41 65" stroke="#2A2018" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M118 96 Q126 100 122 110" stroke="#3F332A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Castillo de Trakai sobre el lago. */
function EscenaLituania() {
  return (
    <g>
      <rect x="20" y="110" width="120" height="20" fill="#7FA8C9" />
      <path d="M20 114 Q80 108 140 114" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.5" />
      <rect x="44" y="90" width="72" height="24" fill="#B85C38" />
      <rect x="70" y="70" width="20" height="42" fill="#B85C38" stroke="#8A4327" strokeWidth="1.5" />
      <path d="M68 70 L80 54 L92 70 Z" fill="#5C5546" />
      <rect x="40" y="60" width="20" height="52" fill="#B85C38" stroke="#8A4327" strokeWidth="1.5" />
      <path d="M38 60 L50 44 L62 60 Z" fill="#5C5546" />
      <rect x="100" y="60" width="20" height="52" fill="#B85C38" stroke="#8A4327" strokeWidth="1.5" />
      <path d="M98 60 L110 44 L122 60 Z" fill="#5C5546" />
    </g>
  );
}

/** Casa del Gato de Riga: fachada art nouveau con el gato en el tejado. */
function EscenaLetonia() {
  return (
    <g>
      <rect x="46" y="70" width="68" height="58" fill="#F5F2EC" stroke="#A89F8C" strokeWidth="1.5" />
      <path d="M46 70 L80 44 L114 70 Z" fill="#B85C38" />
      <rect x="56" y="84" width="14" height="18" fill="#2E5C7E" opacity="0.55" />
      <rect x="90" y="84" width="14" height="18" fill="#2E5C7E" opacity="0.55" />
      <rect x="73" y="108" width="14" height="20" fill="#2E5C7E" opacity="0.55" />
      <path d="M68 50 Q66 34 80 32 Q94 34 92 50 Z" fill="#0F2027" />
      <path d="M68 38 L62 26 L74 34 Z" fill="#0F2027" />
      <path d="M92 38 L98 26 L86 34 Z" fill="#0F2027" />
      <path d="M90 48 Q100 46 98 36" stroke="#0F2027" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Torres medievales de la muralla de Tallinn. */
function EscenaEstonia() {
  return (
    <g>
      <rect x="30" y="100" width="100" height="28" fill="#D9D2C2" />
      <rect x="38" y="66" width="18" height="48" fill="#F5F2EC" stroke="#A89F8C" strokeWidth="1.5" />
      <path d="M35 66 Q47 46 59 66 Z" fill="#B85C38" />
      <rect x="71" y="54" width="18" height="60" fill="#F5F2EC" stroke="#A89F8C" strokeWidth="1.5" />
      <path d="M68 54 Q80 30 92 54 Z" fill="#B85C38" />
      <rect x="104" y="70" width="18" height="44" fill="#F5F2EC" stroke="#A89F8C" strokeWidth="1.5" />
      <path d="M101 70 Q113 50 125 70 Z" fill="#B85C38" />
    </g>
  );
}

/** Lago finlandés con sauna de madera entre abetos. */
function EscenaFinlandia() {
  return (
    <g>
      <rect x="20" y="104" width="120" height="24" fill="#7FA8C9" />
      <rect x="56" y="90" width="48" height="30" fill="#8A6A45" stroke="#5C4527" strokeWidth="1.5" />
      <path d="M52 90 L80 68 L108 90 Z" fill="#5C5546" />
      <rect x="72" y="102" width="16" height="18" fill="#3F332A" />
      <rect x="94" y="74" width="6" height="16" fill="#5C5546" />
      <circle cx="97" cy="66" r="3" fill="#D9D2C2" opacity="0.7" />
      <circle cx="100" cy="58" r="4" fill="#D9D2C2" opacity="0.6" />
      <path d="M32 120 L38 96 L44 120 Z" fill="#6B9080" />
      <path d="M116 120 L122 92 L128 120 Z" fill="#6B9080" />
    </g>
  );
}

/** Cabo Norte: monumento del globo con sol de medianoche sobre el acantilado. */
function EscenaNoruega() {
  return (
    <g>
      <circle cx="80" cy="50" r="20" fill="#F2C14E" opacity="0.85" />
      <g stroke="#F2C14E" strokeWidth="2" opacity="0.7">
        <path d="M80 20 L80 12" />
        <path d="M50 50 L42 50" />
        <path d="M110 50 L118 50" />
        <path d="M58 28 L52 22" />
        <path d="M102 28 L108 22" />
      </g>
      <path d="M20 128 L60 128 L80 100 L100 128 L140 128 Z" fill="#5C5546" />
      <rect x="74" y="96" width="12" height="14" fill="#A89F8C" />
      <circle cx="80" cy="86" r="12" fill="none" stroke="#2E5C7E" strokeWidth="3" />
      <path
        d="M68 86 L92 86 M80 74 L80 98 M72 78 Q80 86 72 94 M88 78 Q80 86 88 94"
        stroke="#2E5C7E"
        strokeWidth="1.5"
        fill="none"
      />
    </g>
  );
}

/** Alce entre abetos. */
function EscenaSuecia() {
  return (
    <g>
      <path d="M30 128 L38 90 L46 128 Z" fill="#6B9080" />
      <path d="M112 128 L120 88 L128 128 Z" fill="#6B9080" />
      <rect x="66" y="108" width="6" height="20" fill="#5C5546" />
      <rect x="78" y="110" width="6" height="18" fill="#5C5546" />
      <rect x="90" y="108" width="6" height="20" fill="#5C5546" />
      <path
        d="M62 106 Q60 88 78 86 Q98 84 100 100 Q101 108 92 110 Q76 112 66 110 Z"
        fill="#8A6A45"
      />
      <path d="M96 92 Q110 88 112 78 Q113 70 105 70 Q97 71 96 80 Q94 86 96 92 Z" fill="#8A6A45" />
      <path
        d="M100 74 Q94 66 86 68 M100 74 Q98 64 104 60"
        stroke="#5C4527"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M108 72 Q114 64 122 66 M108 72 Q112 62 108 58"
        stroke="#5C4527"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}
