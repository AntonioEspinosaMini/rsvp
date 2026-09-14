import type { Config } from 'tailwindcss';

// La paleta y las fuentes son las mismas que las del gestor (repo `nalitos`):
// es la misma boda. Aquí solo están las piezas que usa esta página — el gestor
// tiene además las suyas (paneles, modales), que aquí no pintan nada.

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Serif elegante para títulos; sans neutra para el resto.
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        // Monoespaciada para las etiquetas y los números de sección: es lo que
        // le da el aire de pieza compuesta y no de plantilla.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Rosa empolvado apagado: el acento de la boda, sin caer en lo cursi.
        blush: {
          50: '#fdf8f6',
          100: '#f8ece7',
          200: '#f0d8cf',
          300: '#e2bcae',
          400: '#cf9a86',
          500: '#b97a63',
          600: '#a0614c',
          700: '#834d3d',
        },
        // Verde salvia para lo positivo (confirmado, descuento cerrado).
        sage: {
          50: '#f4f7f4',
          100: '#e6ede6',
          200: '#cbdccb',
          300: '#a7c2a7',
          400: '#7fa37f',
          500: '#5f855f',
          600: '#4b6a4b',
          700: '#3d553d',
        },
        // Neutros cálidos: la base de toda la página.
        ink: {
          50: '#faf9f7',
          100: '#f3f1ed',
          200: '#e7e3dc',
          300: '#d4cec4',
          400: '#a9a196',
          500: '#7d746a',
          600: '#5c554d',
          700: '#413b35',
          800: '#2b2723',
          900: '#1a1714',
        },
      },
      keyframes: {
        'in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Las manchas de color del fondo: se mueven muy despacio, lo justo
        // para que la página no parezca una captura de pantalla.
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(4%, -6%, 0) scale(1.12)' },
        },
        'drift-slow': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1.05)' },
          '50%': { transform: 'translate3d(-5%, 5%, 0) scale(0.95)' },
        },
        /* Carril del "sigue bajando". */
        'scroll-cue': {
          '0%': { transform: 'translateY(-40%)', opacity: '0' },
          '35%, 65%': { opacity: '1' },
          '100%': { transform: 'translateY(140%)', opacity: '0' },
        },
        /* Dibuja un trazo SVG (stroke-dasharray puesto desde el componente). */
        draw: { to: { strokeDashoffset: '0' } },
      },
      animation: {
        'in-up': 'in-up 220ms ease-out',
        drift: 'drift 26s ease-in-out infinite',
        'drift-slow': 'drift-slow 34s ease-in-out infinite',
        'scroll-cue': 'scroll-cue 2.4s ease-in-out infinite',
        draw: 'draw 700ms 200ms cubic-bezier(0.65, 0, 0.35, 1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
