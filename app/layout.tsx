import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { WEDDING } from '@/lib/wedding-info';
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
  themeColor: '#fdf8f6',
  width: 'device-width',
  initialScale: 1,
  // Sin zoom al enfocar inputs en iOS.
  maximumScale: 1,
};

/**
 * Layout raíz. A diferencia del gestor, aquí no hay providers ni contextos que
 * envolver: no existe estado global que compartir porque no hay más que esta
 * página. Lo único que aporta es el esqueleto html/body y las tres fuentes.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
