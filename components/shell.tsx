'use client';

// El armazón visual del RSVP público: el contenedor, el rótulo, la cabecera de
// cada página y de cada sección. La idea de todo el sitio cabe en una frase:
// una revista suiza a pleno día, no una invitación de imprenta — retícula,
// tipografía enorme, papel crema y ni un solo adorno que no cuente algo.

import type { ReactNode } from 'react';
import { WEDDING } from '@/lib/wedding-info';
import { cn } from '@/lib/utils';
import { Reveal } from './motion';

/** La luz de mediodía del fondo: sol arriba a la derecha, teja muy baja abajo. */
export function Glow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_90%_0%,rgba(245,212,156,0.65),transparent_70%),radial-gradient(55%_45%_at_0%_100%,rgba(229,130,90,0.12),transparent_70%)]',
        className
      )}
      aria-hidden
    />
  );
}

/** Ancho común a todo. En el móvil, una columna; en pantallas anchas, la
 * retícula de dos (rótulo a la izquierda, contenido a la derecha). */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12', className)}>{children}</div>;
}

/** Rótulo pequeño en versalitas espaciadas: el hilo conductor de la página. */
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('text-[11px] font-medium uppercase tracking-[0.2em] text-ink-500', className)}>
      {children}
    </span>
  );
}

/** La línea de arriba de cada página: los nombres y la fecha, con su filete. */
export function Masthead({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <Label className="text-ink-900">{WEDDING.couple}</Label>
        <Label className="tabular-nums">{WEDDING.date_short}</Label>
      </div>
      <div className="mt-4 h-px origin-left animate-rule bg-ink-900/15" />
    </div>
  );
}

interface PageProps {
  /** Rótulo pequeño sobre el título. */
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  /** El contenido trae sus propios contenedores (p. ej. varias `Section`). */
  full?: boolean;
  children: ReactNode;
}

/**
 * Una página del menú: la luz de fondo, la línea de los nombres y un titular
 * grande. El contenido va debajo, en el mismo contenedor.
 */
export function Page({ label, title, lead, full, children }: PageProps) {
  return (
    <main>
      {/* Sin grano y con la luz fundida hacia abajo: la cabecera no tiene
          borde, se deshace en el papel del contenido. */}
      <header className="relative">
        <Glow className="[mask-image:linear-gradient(to_bottom,black_40%,transparent)]" />
        <Container className="relative pb-12 pt-6 sm:pb-16 sm:pt-8">
          <Masthead />
          <div className="mt-14 sm:mt-20">
            <Label className="animate-rise text-teja">{label}</Label>
            <h1
              className="balance mt-5 animate-rise font-display text-[clamp(3rem,13vw,6.5rem)] leading-[0.9] tracking-[-0.03em] text-ink-900"
              style={{ animationDelay: '120ms' }}
            >
              {title}
            </h1>
            {lead && (
              <p
                className="mt-6 max-w-[34rem] animate-rise text-[17px] leading-relaxed text-ink-500"
                style={{ animationDelay: '240ms' }}
              >
                {lead}
              </p>
            )}
          </div>
        </Container>
      </header>
      {full ? children : <Container>{children}</Container>}
    </main>
  );
}

interface SectionProps {
  id: string;
  /** "01", "02"… */
  index: string;
  /** Nombre corto de la sección, para el rótulo. */
  label: string;
  title: ReactNode;
  lead?: string;
  children: ReactNode;
}

/**
 * Sección numerada. En el móvil, rótulo, título y contenido uno debajo de
 * otro; desde `lg`, el rótulo se queda fijo en su columna mientras el
 * contenido pasa a su lado, como el folio de una revista.
 */
export function Section({ id, index, label, title, lead, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-6 py-16 sm:py-24">
      <Container className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-12">
            <Reveal>
              <div className="flex items-baseline gap-4 border-t border-ink-900/80 pt-4">
                <span className="text-[11px] font-medium tabular-nums tracking-[0.2em] text-teja">{index}</span>
                <Label className="text-ink-800">{label}</Label>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-8">
          <Reveal>
            <h2 className="balance font-display text-[clamp(2.75rem,11vw,5.5rem)] leading-[0.92] tracking-[-0.02em] text-ink-900">
              {title}
            </h2>
            {lead && <p className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-ink-500">{lead}</p>}
          </Reveal>
          <div className="mt-14">{children}</div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Para quien llega a una página cuya lista aún está vacía (el menú ya no la
 * enseña, pero un enlace antiguo puede traerle): mejor decirlo que dejar un
 * hueco en blanco.
 */
export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[24px] bg-bone-50 px-6 py-8 text-[16px] leading-relaxed text-ink-500 shadow-soft ring-1 ring-ink-900/[0.05]">
      {children}
    </p>
  );
}
