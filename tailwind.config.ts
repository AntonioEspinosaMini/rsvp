import type { Config } from 'tailwindcss';

// La paleta y las fuentes son propias de esta página. Una boda de día: papel
// crema en vez de pantalla blanca, texto en sepia en vez de negro, y el mismo
// acento teja de siempre para lo que importa — la cursiva del nombre, el
// dígito que cambia, el estado activo. El único color nuevo es `sol`, que
// solo existe como luz de fondo, nunca como texto. El gestor (repo `nalitos`)
// tiene la suya aparte.

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Serif de contraste alto y dibujo contemporáneo para lo grande; una
        // grotesca apretada para todo lo demás. Dos familias, ni una más.
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Inter Tight"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Papel: crema cálido. 100 es el fondo; 50, las superficies que flotan
        // (tarjetas, el menú); 200-300, filetes y rellenos suaves.
        bone: {
          50: '#fffcf7',
          100: '#faf5ec',
          200: '#f1e8d9',
          300: '#e3d6c1',
        },
        // Sepia: del gris cálido de los textos secundarios al marrón de los
        // titulares. Sigue llamándose `ink` porque hace de tinta, pero ya no es
        // negra. ink-500 es el más claro que se usa para texto sobre crema
        // (≥ 4.5:1).
        ink: {
          300: '#c4b39e',
          400: '#9c8b77',
          500: '#76665a',
          600: '#5f5046',
          700: '#4a3c33',
          800: '#3b2f27',
          900: '#2f241d',
          950: '#231a14',
        },
        // El acento. `DEFAULT` para texto y rellenos; `dark` para el pulsado.
        teja: {
          DEFAULT: '#a9441f',
          dark: '#8a3517',
          light: '#e5825a',
        },
        // Luz de mediodía para los degradados de fondo. Nunca como texto.
        sol: '#f5d49c',
      },
      boxShadow: {
        // Una sola escala de elevación, en sepia y no en negro: sobre crema,
        // una sombra gris se ve sucia.
        soft: '0 1px 2px rgba(47,36,29,0.04), 0 8px 24px -12px rgba(47,36,29,0.18)',
        float: '0 2px 6px rgba(47,36,29,0.06), 0 18px 48px -16px rgba(47,36,29,0.38)',
      },
      keyframes: {
        'in-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        /* Entrada de la portada: sube y aparece. */
        rise: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        /* Cada letra de los nombres asoma desde debajo de su línea base. */
        letter: {
          from: { transform: 'translateY(110%)' },
          to: { transform: 'translateY(0)' },
        },
        /* Reglas que se trazan de un extremo a otro. */
        rule: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        /* Dibuja un trazo SVG (stroke-dasharray puesto desde el componente). */
        draw: { to: { strokeDashoffset: '0' } },
        /* El segundo que entra en la cuenta atrás. Solo desplaza, nunca
           oculta: si la animación se congela, el número sigue a la vista. */
        tick: { from: { transform: 'translateY(-45%)' }, to: { transform: 'translateY(0)' } },
        /* La cinta bajo la portada. */
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'in-up': 'in-up 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
        rise: 'rise 1100ms cubic-bezier(0.16, 1, 0.3, 1) both',
        letter: 'letter 1200ms cubic-bezier(0.16, 1, 0.3, 1) both',
        rule: 'rule 1400ms cubic-bezier(0.65, 0, 0.35, 1) both',
        draw: 'draw 900ms 150ms cubic-bezier(0.65, 0, 0.35, 1) forwards',
        tick: 'tick 420ms cubic-bezier(0.16, 1, 0.3, 1)',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
