'use client';

// Inicio: el enlace propio de cada invitado (`https://<dominio>/?t=<token>`),
// sin login. Las demás páginas cuelgan del menú de abajo (`components/nav.tsx`)
// y quién es el invitado lo resuelve el layout (`components/guest.tsx`).
//
// Este repositorio existe precisamente para que estas pantallas NO vivan en el
// gestor de la boda. Al repartirse a trescientas personas, su URL deja de ser
// un secreto; si el gestor estuviera en el mismo dominio, bastaría borrar el
// `?t=…` de la barra del navegador para aterrizar en el presupuesto, los
// proveedores y la lista entera de invitados. Aquí no hay dónde aterrizar:
// este sitio solo sabe hablar con Firestore, y solo del documento de su
// propio token (ver `lib/rsvp-store.ts` y el README).
//
// Es lo primero que ven 300 personas que no son los novios, así que tiene
// lenguaje propio: una portada a pleno día — papel crema, una luz de mediodía
// arriba a la derecha — con los nombres a un tamaño que casi no cabe. Los
// datos se editan en `lib/wedding-info.ts`.

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { WEDDING } from '@/lib/wedding-info';
import { guestCode } from '@/lib/utils';
import { Countdown } from '@/components/countdown';
import { useGuest } from '@/components/guest';
import { Reveal } from '@/components/motion';
import { useHref } from '@/components/nav';
import { Container, Glow, Label, Masthead } from '@/components/shell';

/** Retardo de una animación CSS de entrada, en ms. */
const at = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

/** Los dos nombres, por separado, para componerlos a dos líneas. */
const [NAME_A, NAME_B] = WEDDING.couple.split(/\s*&\s*/);

/**
 * Un texto letra a letra: cada una asoma desde debajo de su línea base. Los
 * espacios se vuelven duros para no perderse entre `inline-block`s, y el
 * lector de pantalla lee la frase entera del elemento padre.
 */
function Letters({ text, start, step = 45 }: { text: string; start: number; step?: number }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span key={i} className="inline-block animate-letter" style={at(start + i * step)}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </>
  );
}

/** Un dato de la portada: una ficha de papel con rótulo arriba y valor debajo. */
function Fact({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div
      className="animate-rise rounded-[20px] bg-bone-50/80 px-4 py-3.5 shadow-soft ring-1 ring-ink-900/[0.05] backdrop-blur-sm"
      style={at(delay)}
    >
      <dt className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-ink-500">{label}</dt>
      <dd className="mt-1 text-[15px] leading-snug text-ink-900">{value}</dd>
    </div>
  );
}

/** La llamada a confirmar, o la señal de que ya está hecho. */
function Cta() {
  const { answered, answer } = useGuest();
  const withToken = useHref();

  if (answered) {
    return (
      <Link
        href={withToken('/confirmar/')}
        className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-bone-50/80 py-2 pl-2 pr-5 text-[14px] text-ink-800 shadow-soft ring-1 ring-ink-900/[0.06] backdrop-blur-sm transition-shadow hover:ring-teja"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teja text-bone-50" aria-hidden>
          <Check className="h-4 w-4" strokeWidth={2.25} />
        </span>
        {answer.status === 'no_viene' ? 'Nos has dicho que no podrás venir' : 'Ya nos has confirmado'}
        <span className="text-ink-500 underline decoration-ink-300 underline-offset-4 group-hover:decoration-teja">
          Cambiar
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={withToken('/confirmar/')}
      className="group inline-flex min-h-14 items-center gap-4 rounded-full bg-teja pl-6 pr-2 text-[13px] font-medium uppercase tracking-[0.18em] text-bone-50 shadow-float transition-colors hover:bg-teja-dark"
    >
      Confirma tu asistencia
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bone-50/15" aria-hidden>
        <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </span>
    </Link>
  );
}

function Hero() {
  const { firstName, token } = useGuest();
  const hello = firstName ? `Hola, ${firstName}` : 'Hola';

  return (
    <header className="grain relative overflow-hidden">
      <Glow />
      <div className="relative flex min-h-[calc(100svh-6rem)] flex-col py-6 sm:py-8">
        <Container className="animate-rise">
          <Masthead />
        </Container>

        <Container className="flex flex-1 flex-col justify-center py-10">
          <p className="animate-rise font-display text-[clamp(1.6rem,6vw,2.4rem)] italic leading-none text-teja" style={at(400)}>
            {hello}.
          </p>

          <h1
            aria-label={`${WEDDING.couple} se casan`}
            className="mt-5 font-display text-[clamp(4rem,min(26vw,20svh),13.5rem)] leading-[0.82] tracking-[-0.035em] text-ink-900"
          >
            <span aria-hidden className="block overflow-hidden pb-[0.08em]">
              <Letters text={NAME_A} start={600} />
            </span>
            <span aria-hidden className="block overflow-hidden pb-[0.1em] lg:pl-[18%]">
              <span className="inline-block animate-letter pr-[0.12em] italic text-teja" style={at(900)}>
                &amp;
              </span>
              <Letters text={NAME_B} start={960} />
            </span>
          </h1>

          <div className="mt-8 grid gap-10 sm:mt-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <p className="max-w-[26rem] animate-rise text-[17px] leading-relaxed text-ink-600" style={at(1400)}>
                Nos casamos y queremos que estés. Dinos si vienes y, de paso, te contamos cómo va a ser el día.
              </p>
              <div className="mt-8 animate-rise" style={at(1550)}>
                <Countdown target={WEDDING.date_iso} />
              </div>
              <div className="mt-10 animate-rise" style={at(1700)}>
                <Cta />
              </div>
            </div>
            <dl className="grid gap-3 sm:grid-cols-3 lg:col-span-6 lg:col-start-7 lg:self-end">
              <Fact label="Fecha" value={WEDDING.date_long} delay={1500} />
              <Fact label="Lugar" value={WEDDING.venue} delay={1600} />
              <Fact label="Ciudad" value={WEDDING.place} delay={1700} />
            </dl>
          </div>
        </Container>

        <Container>
          <div className="flex animate-rise justify-end" style={at(1900)}>
            <Label className="tabular-nums text-ink-400">Nº {guestCode(token)}</Label>
          </div>
        </Container>
      </div>
    </header>
  );
}

/** Cinta bajo la portada: fecha y sitio, sin fin. */
function Marquee() {
  const item = `${WEDDING.couple} — ${WEDDING.date_long} — ${WEDDING.place} — `;
  return (
    <div className="overflow-hidden border-y border-ink-900/10 py-5 sm:py-6" aria-hidden>
      <div className="flex w-max animate-marquee whitespace-nowrap font-display text-[clamp(1.75rem,5vw,2.75rem)] leading-none text-ink-900">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="pr-[0.3em]">
            {item.split('—').map((part, j, all) => (
              <span key={j}>
                {part}
                {j < all.length - 1 && <em className="text-teja">—</em>}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Marquee />

      <footer className="relative overflow-hidden">
        <Glow className="rotate-180" />
        <Container className="relative py-24 sm:py-32">
          <Reveal>
            <Label className="text-teja">Hasta entonces</Label>
            <p className="balance mt-6 font-display text-[clamp(3.5rem,17vw,11rem)] leading-[0.85] tracking-[-0.035em] text-ink-900">
              Nos vemos <em className="text-teja">allí</em>.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-16 flex flex-col gap-3 border-t border-ink-900/15 pt-6 sm:flex-row sm:items-baseline sm:justify-between">
              <Label className="text-ink-900">{WEDDING.couple}</Label>
              <Label>
                {WEDDING.date_long} · {WEDDING.venue} · {WEDDING.place}
              </Label>
            </div>
          </Reveal>
        </Container>
      </footer>
    </main>
  );
}
