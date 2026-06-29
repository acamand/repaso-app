/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bitácora — campo de exploración naturalista, sin caer en el cliché crema+terracota.
        parchment: '#F5F2EC',       // fondo principal, papel claro algo más frío que el crema típico
        parchment2: '#EAE4D7',      // separadores, fondos secundarios
        ink: '#0F2027',             // tinta principal (texto)
        slate: '#2E5C7E',           // primario (botones, marca)
        slateDeep: '#1F3F58',
        copper: '#B85C38',          // acento cálido — usado SOLO para CTAs y badges de cuaderno
        sage: '#6B9080',            // acento frío — actividades digitales y aciertos
        mustard: '#F2C14E',         // XP / oro / hitos
        brick: '#C44545',           // errores y avisos
        // gris-papel para bordes y elementos secundarios
        paper: {
          300: '#D9D2C2',
          500: '#A89F8C',
          700: '#5C5546',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        soft: '14px',
      },
      boxShadow: {
        card: '0 1px 0 rgba(15,32,39,0.04), 0 8px 24px -16px rgba(15,32,39,0.18)',
      },
    },
  },
  plugins: [],
};
