'use client';

// La página. Es todo el sitio: el enlace propio de cada invitado
// (`https://<dominio>/?t=<token>`), sin login.
//
// Este repositorio existe precisamente para que esta pantalla NO viva en el
// gestor de la boda. Al repartirse a trescientas personas, su URL deja de ser
// un secreto; si el gestor estuviera en el mismo dominio, bastaría borrar el
// `?t=…` de la barra del navegador para aterrizar en el presupuesto, los
// proveedores y la lista entera de invitados. Aquí no hay dónde aterrizar:
// este sitio solo sabe hablar con Firestore, y solo del documento de su
// propio token (ver `lib/rsvp-store.ts` y el README).
//
// Es la única pantalla que ven 300 personas que no son los novios, así que
// tiene lenguaje propio: una sola columna, secciones numeradas, tipografía
// grande y movimiento al entrar. Los datos de las secciones informativas se
// editan en `lib/wedding-info.ts`.

import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUp } from 'lucide-react';
import { rsvpStore, type GuestStatus } from '@/lib/rsvp-store';
import { BARBERS, HAIR_SALONS, HOTELS, TIMELINE, WEDDING } from '@/lib/wedding-info';
import { cn } from '@/lib/utils';
import { RsvpForm, type RsvpFormState } from '@/components/form';
import { EASE, Reveal, ScrollProgress, useReducedMotion } from '@/components/motion';
import { Places } from '@/components/places';
import { Backdrop, Container, Mono, Section } from '@/components/shell';
import { Timeline } from '@/components/timeline';

/** Pantalla completa para los dos únicos estados sin contenido. */
function Bare({ title, description }: { title: ReactNode; description?: string }) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-8 text-center">
      <Backdrop />
      <h1 className="max-w-sm font-display text-[clamp(2rem,9vw,2.8rem)] font-light leading-[1.05] text-ink-800">
        {title}
      </h1>
      {description && <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink-500">{description}</p>}
    </main>
  );
}

/** Cabecera a pantalla casi completa: el nombre del invitado es el titular. */
function Hero({ firstName }: { firstName: string }) {
  return (
    <header className="flex min-h-[92svh] flex-col justify-between pb-10 pt-7">
      <Container>
        <div className="flex items-baseline justify-between gap-4">
          <Mono className="text-ink-500">{WEDDING.couple}</Mono>
          <Mono>{WEDDING.date_short}</Mono>
        </div>
      </Container>

      <Container className="py-12">
        <Reveal>
          <Mono className="block text-blush-500">Nos casamos</Mono>
        </Reveal>
        <Reveal delay={120}>
          <h1 className="mt-5 font-display text-[clamp(3.2rem,17vw,5.5rem)] font-light leading-[0.88] tracking-[-0.02em] text-ink-800">
            Hola,
            <br />
            <span className="rsvp-accent text-blush-600">{firstName || 'qué alegría'}</span>.
          </h1>
        </Reveal>
        <Reveal delay={240}>
          <p className="mt-7 max-w-[22rem] text-[15.5px] leading-relaxed text-ink-500">
            Queremos que estés. Dinos si puedes venir y, de paso, te contamos cómo va a ser el día y
            dónde arreglarte y quedarte a dormir.
          </p>
        </Reveal>
      </Container>

      <Container>
        <div className="flex items-center gap-4">
          {/* Carril del "sigue bajando": un punto que cae en bucle. */}
          <span className="relative block h-9 w-px overflow-hidden bg-ink-200" aria-hidden>
            <span className="absolute inset-x-0 top-0 h-3 animate-scroll-cue bg-blush-500" />
          </span>
          <Mono>01 — Confirmación</Mono>
        </div>
      </Container>
    </header>
  );
}

/** Aparece al perder de vista el formulario sin haber respondido. */
function FloatingCta({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-6',
        'transition-[opacity,transform] duration-500 motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      )}
      style={{ transitionTimingFunction: EASE }}
      aria-hidden={!visible}
    >
      <a
        href="#confirmacion"
        tabIndex={visible ? 0 : -1}
        className={cn(
          'pointer-events-auto inline-flex items-center gap-2 rounded-full bg-ink-800/95 px-5 py-3 text-white shadow-xl shadow-ink-900/20 backdrop-blur',
          'font-mono text-[11px] uppercase tracking-[0.18em] transition-transform duration-300 hover:-translate-y-0.5',
          'motion-reduce:transition-none motion-reduce:hover:translate-y-0'
        )}
      >
        <ArrowUp className="h-3.5 w-3.5" />
        Aún no has respondido
      </a>
    </div>
  );
}

interface Block {
  id: string;
  title: ReactNode;
  lead?: string;
  body: ReactNode;
}

function RsvpScreen() {
  const token = useSearchParams().get('t');
  const [state, setState] = useState<'loading' | 'invalid' | 'ready'>('loading');
  const [firstName, setFirstName] = useState('');
  const [initial, setInitial] = useState<RsvpFormState>({
    status: 'confirmado',
    allergies: '',
    transport: false,
    song_request: '',
    notes: '',
  });

  const [sent, setSent] = useState(false);
  const [pastForm, setPastForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!token || !rsvpStore.isConfigured) {
      setState('invalid');
      return;
    }
    let cancelled = false;
    rsvpStore
      .getRsvp(token)
      .then((doc) => {
        if (cancelled) return;
        if (!doc) {
          setState('invalid');
          return;
        }
        setFirstName(doc.first_name || '');
        setInitial({
          // Un documento recién creado por la app privada solo trae el nombre:
          // sin respuesta todavía, se ofrece "confirmado" por defecto.
          status: (doc.status === 'no_viene' ? 'no_viene' : 'confirmado') as GuestStatus,
          allergies: doc.allergies ?? '',
          transport: doc.transport ?? false,
          song_request: doc.song_request ?? '',
          notes: doc.notes ?? '',
        });
        setState('ready');
      })
      .catch(() => !cancelled && setState('invalid'));
    return () => {
      cancelled = true;
    };
  }, [token]);

  // El botón flotante solo aparece si te has dejado el formulario ATRÁS sin
  // responder. Mirar solo si está en pantalla lo sacaría también en la
  // portada, antes de haber llegado a él: de recordatorio pasaría a estorbo.
  useEffect(() => {
    const el = formRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setPastForm(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [state]);

  if (state === 'loading') {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center">
        <Backdrop />
        <span
          className={cn('h-2 w-2 rounded-full bg-blush-400', !reduced && 'animate-pulse')}
          aria-label="Cargando"
        />
      </main>
    );
  }

  if (state === 'invalid' || !token) {
    return (
      <Bare
        title={
          <>
            Este enlace no <span className="rsvp-accent text-blush-600">funciona</span>.
          </>
        }
        description="Revisa que lo has copiado entero — es largo y se corta con facilidad — o escríbenos y te mandamos otro."
      />
    );
  }

  // Las secciones informativas vacías no se enseñan, y la numeración se
  // recalcula sola para que no queden huecos (`lib/wedding-info.ts`).
  const blocks: Block[] = [
    {
      id: 'confirmacion',
      title: (
        <>
          ¿Nos <span className="rsvp-accent text-blush-600">acompañas</span>?
        </>
      ),
      lead: 'Puedes cambiar la respuesta cuando quieras: este enlace es tuyo y sigue funcionando.',
      body: (
        <div ref={formRef}>
          <RsvpForm token={token} firstName={firstName} initial={initial} onSentChange={setSent} />
        </div>
      ),
    },
  ];

  if (TIMELINE.length > 0) {
    blocks.push({
      id: 'el-dia',
      title: (
        <>
          El día, <span className="rsvp-accent">hora a hora</span>
        </>
      ),
      lead: 'Para que nadie llegue con prisa ni de más ni de menos.',
      body: <Timeline stops={TIMELINE} />,
    });
  }

  if (HOTELS.length > 0) {
    blocks.push({
      id: 'dormir',
      title: <>Dónde dormir</>,
      lead: 'Hemos hablado con estos hoteles. Al reservar, di que vienes a nuestra boda.',
      body: <Places places={HOTELS} />,
    });
  }

  if (HAIR_SALONS.length > 0) {
    blocks.push({
      id: 'peluquerias',
      title: <>Peluquerías</>,
      lead: `Las que nos gustan en ${WEDDING.place}. Pide cita con tiempo: ese fin de semana se llenan.`,
      body: <Places places={HAIR_SALONS} />,
    });
  }

  if (BARBERS.length > 0) {
    blocks.push({
      id: 'barberias',
      title: <>Barberías</>,
      lead: 'Para el arreglo de última hora.',
      body: <Places places={BARBERS} />,
    });
  }

  return (
    <>
      <ScrollProgress />
      <Backdrop />
      <FloatingCta visible={pastForm && !sent} />

      <main>
        <Hero firstName={firstName} />

        {blocks.map((block, i) => (
          <Section
            key={block.id}
            id={block.id}
            index={String(i + 1).padStart(2, '0')}
            title={block.title}
            lead={block.lead}
          >
            {block.body}
          </Section>
        ))}

        <footer className="border-t border-ink-200/70 pb-28 pt-16 text-center">
          <Container>
            <Reveal>
              <p className="font-display text-[clamp(1.8rem,8vw,2.4rem)] font-light leading-tight text-ink-700">
                Nos vemos <span className="rsvp-accent text-blush-600">allí</span>.
              </p>
              <Mono className="mt-5 block">
                {WEDDING.date_long} · {WEDDING.place}
              </Mono>
            </Reveal>
          </Container>
        </footer>
      </main>
    </>
  );
}

export default function RsvpPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100dvh] items-center justify-center">
          <Backdrop />
          <span className="h-2 w-2 animate-pulse rounded-full bg-blush-400" />
        </main>
      }
    >
      <RsvpScreen />
    </Suspense>
  );
}
