'use client';

// El armazón visual del RSVP público: el fondo, el contenedor y la cabecera
// numerada de cada sección. La página es una sola columna estrecha sobre un
// lienzo cálido; no hay tarjetas — separan las líneas de un píxel y el aire.

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './motion';

/** Ancho de lectura común a todo. Una columna, mismo eje de arriba abajo. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[34rem] px-6 sm:px-8', className)}>{children}</div>;
}

/** Etiqueta monoespaciada: el hilo conductor de toda la página. */
export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-400', className)}>
      {children}
    </span>
  );
}

/**
 * Fondo: dos manchas de color muy difusas que se mueven despacio, sobre el
 * hueso de la casa, con grano encima. Va en `fixed` para que el degradado no
 * se desplace con el scroll y la página parezca impresa sobre él.
 */
export function Backdrop() {
  return (
    <div className="rsvp-grain pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-50" aria-hidden>
      <div className="absolute -left-[30%] -top-[20%] h-[70vh] w-[70vh] animate-drift rounded-full bg-blush-200/60 blur-[90px]" />
      <div className="absolute -right-[25%] top-[35%] h-[60vh] w-[60vh] animate-drift-slow rounded-full bg-sage-200/45 blur-[100px]" />
      <div className="absolute bottom-[-15%] left-[10%] h-[50vh] w-[50vh] animate-drift rounded-full bg-blush-100/70 blur-[80px]" />
    </div>
  );
}

interface SectionProps {
  id: string;
  /** "01", "02"… Se enseña junto al título. */
  index: string;
  title: ReactNode;
  lead?: string;
  children: ReactNode;
}

/** Sección numerada, con su línea de separación y su entrada escalonada. */
export function Section({ id, index, title, lead, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-ink-200/70 py-14 sm:py-20">
      <Container>
        <Reveal>
          <Mono className="block text-blush-500">{index}</Mono>
          <h2 className="mt-3 font-display text-[clamp(2rem,9vw,2.9rem)] font-light leading-[0.95] text-ink-800">
            {title}
          </h2>
          {lead && <p className="mt-4 max-w-[26rem] text-[15px] leading-relaxed text-ink-500">{lead}</p>}
        </Reveal>
        <div className="mt-9">{children}</div>
      </Container>
    </section>
  );
}
