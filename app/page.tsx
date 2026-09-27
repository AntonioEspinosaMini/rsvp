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
// Es lo primero que ve cada invitado, y la portada es suya, no nuestra: lo
// que sale a un tamaño que casi no cabe es SU nombre, y los novios aparecen
// abajo, firmando, como en una carta. Papel crema y una luz de mediodía
// arriba a la derecha. Los datos se editan en `lib/wedding-info.ts`.

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

/**
 * Un texto letra a letra: cada una asoma desde debajo de su línea base. Va por
 * palabras, cada una sin partir, para que un nombre compuesto ("María José")
 * salte de línea entre palabras y no se salga de la pantalla. El lector de
 * pantalla lee la frase entera del elemento padre.
 */
function Letters({ text, start, step = 55 }: { text: string; start: number; step?: number }) {
  let n = 0;
  return (
    <>
      {text.split(' ').map((word, w) => (
        <span key={w}>
          {w > 0 && ' '}
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, i) => (
              <span key={i} className="inline-block animate-letter" style={at(start + n++ * step)}>
                {ch}
              </span>
            ))}
          </span>
        </span>
      ))}
    </>
  );
}

/** Un dato de la portada: rótulo a la izquierda, valor a la derecha. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3.5">
      <dt className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-ink-500">{label}</dt>
      <dd className="text-right text-[15px] leading-snug text-ink-900">{value}</dd>
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
        {answer.status === 'no_viene' ? 'Nos has dicho que no podrás venir' : '¡Vienes! Ya lo tenemos apuntado'}
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

  return (
    <header className="grain relative overflow-hidden">
      <Glow />
      <div className="relative flex min-h-[calc(100svh-6rem)] flex-col py-6 sm:py-8">
        <Container className="animate-rise">
          <Masthead />
        </Container>

        <Container className="flex flex-1 flex-col justify-center py-10">
          <p className="animate-rise" style={at(300)}>
            <Label className="tabular-nums text-teja">Tu invitación · Nº {guestCode(token)}</Label>
          </p>

          {/* El saludo es el titular: su nombre, a lo grande. Sin nombre en
              el documento, "Hola." solo, al mismo tamaño. */}
          <h1
            aria-label={firstName ? `Hola, ${firstName}` : 'Hola'}
            className="mt-6 font-display text-ink-900"
          >
            <span
              aria-hidden
              className="block overflow-hidden pb-[0.06em] text-[clamp(2.25rem,9vw,4.5rem)] italic leading-none text-teja"
            >
              <Letters text={firstName ? 'Hola,' : 'Hola.'} start={450} />
            </span>
            {firstName && (
              <span
                aria-hidden
                className="balance block overflow-hidden pb-[0.1em] text-[clamp(4.5rem,min(24vw,22svh),14rem)] leading-[0.85] tracking-[-0.035em]"
              >
                <Letters text={`${firstName}.`} start={750} />
              </span>
            )}
          </h1>

          <div className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              {/* Una carta corta, de tú a tú, firmada por los dos. */}
              <div className="max-w-[30rem] animate-rise" style={at(1300)}>
                <p className="text-[18px] leading-relaxed text-ink-700">
                  Nos casamos el {WEDDING.date_long.replace(/ de \d{4}$/, '')} y no nos imaginamos el día sin la gente
                  que queremos. Por eso esta invitación es para ti.
                </p>
                <p className="mt-4 text-[18px] leading-relaxed text-ink-700">
                  Aquí encontrarás cómo será el día, dónde alojarte y dónde arreglarte. Y cuando lo sepas, nos haría
                  mucha ilusión que nos confirmaras si podrás acompañarnos.
                </p>
                <p className="mt-6 font-display text-[clamp(1.75rem,6vw,2.25rem)] italic leading-none text-ink-900">
                  {WEDDING.couple.replace('&', 'y')}
                </p>
              </div>
              <div className="mt-10 animate-rise" style={at(1500)}>
                <Cta />
              </div>
            </div>

            <div className="flex flex-col gap-8 lg:col-span-5 lg:col-start-8 lg:self-end">
              <div className="animate-rise" style={at(1600)}>
                <Countdown target={WEDDING.date_iso} />
              </div>
              {/* Los tres datos en una sola ficha de papel: apilados en tres
                  tarjetas se comían media pantalla del móvil. */}
              <dl
                className="animate-rise divide-y divide-ink-900/[0.07] rounded-[22px] bg-bone-50/80 px-5 shadow-soft ring-1 ring-ink-900/[0.05] backdrop-blur-sm"
                style={at(1700)}
              >
                <Fact label="Fecha" value={WEDDING.date_long} />
                <Fact label="Lugar" value={WEDDING.venue} />
                <Fact label="Ciudad" value={WEDDING.place} />
              </dl>
            </div>
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
    <div className="overflow-hidden border-y border-ink-900/10 py-4 lg:py-3" aria-hidden>
      <div className="flex w-max animate-marquee whitespace-nowrap font-display text-[clamp(1.5rem,5vw,2rem)] leading-none text-ink-900 lg:text-[1.625rem]">
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
  const { firstName } = useGuest();
  return (
    <main>
      <Hero />
      <Marquee />

      <footer className="relative overflow-hidden">
        {/* Girada, la luz sale de abajo a la izquierda; la máscara (girada con
            ella) la funde antes del borde para que no se corte en seco. */}
        <Glow className="rotate-180 [mask-image:linear-gradient(to_bottom,transparent,black_45%)]" />
        <Container className="relative pb-2 pt-24 sm:pt-32">
          <Reveal>
            <Label className="text-teja">Hasta entonces{firstName ? `, ${firstName}` : ''}</Label>
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
