import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { WEDDING } from '@/lib/wedding-info';
import { GuestShell } from '@/components/guest';
import './globals.css';

export const metadata: Metadata = {
  title: `Nuestra boda · ${WEDDING.couple}`,
  description: 'Confirma tu asistencia y mira el plan del día.',
  // El sitio tiene dominio propio, así que Google sí lo indexaría. No queremos:
  // aquí salen los teléfonos de las peluquerías, los hoteles con los que hemos
  // hablado y el nombre de cada invitado que abre su enlace. Que llegue solo
  // quien tiene el enlace.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  // El papel crema del fondo: la barra del navegador del móvil, a juego.
  themeColor: '#faf5ec',
  width: 'device-width',
  initialScale: 1,
  // Para que `env(safe-area-inset-bottom)` tenga valor en iOS y el menú de
  // abajo no quede debajo de la barra de gestos.
  viewportFit: 'cover',
  // Sin `maximumScale`: bloquear el zoom deja fuera a quien lo necesita para
  // leer. El salto de iOS al enfocar se evita con inputs de 17px, no así.
};

/**
 * Layout raíz: el esqueleto html/body, las dos fuentes y `GuestShell`, que
 * resuelve quién es el invitado una sola vez y pone el menú de abajo. Al
 * navegar entre páginas el layout no se desmonta: ni se vuelve a pedir el
 * documento a Firestore ni el menú pierde su animación.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <GuestShell>{children}</GuestShell>
      </body>
    </html>
  );
}
