'use client';

// El invitado, resuelto una vez para todo el sitio. Antes era una sola página
// y el token se leía de su URL; ahora son cinco y el menú de abajo salta entre
// ellas, así que el token vive aquí, en el layout, y cada página lo pide con
// `useGuest()`.
//
// De dónde sale el token, por orden:
//   1. `?t=…` en la URL — el enlace que le mandamos. Si viene, manda siempre.
//   2. El que se quedó guardado la última vez que abrió su enlace en este
//      móvil. Así, quien vuelve días después desde el historial o desde un
//      acceso directo sin el `?t=` sigue siendo él, sin buscar el mensaje.
// Si el guardado resulta no existir (lo borramos en el gestor, p. ej.), se
// olvida: no tiene sentido arrastrar un token muerto.
//
// Sin token válido no se enseña ninguna página, tampoco las informativas: ahí
// salen teléfonos y hoteles con los que hemos hablado, y el sitio sigue siendo
// solo para quien tiene enlace (ver `robots` en `app/layout.tsx`).

import { createContext, Suspense, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { rsvpStore, type GuestStatus } from '@/lib/rsvp-store';
import type { RsvpFormState } from './form';
import { BottomNav } from './nav';
import { Container, Glow, Label } from './shell';

const STORAGE_KEY = 'rsvp_token';

// localStorage puede no estar (modo privado, datos bloqueados): se ignora y el
// sitio sigue funcionando con el `?t=` de la URL.
function remembered(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function remember(token: string | null) {
  try {
    if (token) window.localStorage.setItem(STORAGE_KEY, token);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* sin almacenamiento: nada que recordar */
  }
}

interface Guest {
  token: string;
  firstName: string;
  /** Lo último que sabemos de su respuesta: lo guardado o lo que acaba de enviar. */
  answer: RsvpFormState;
  /** false mientras no haya respondido nunca: el menú lo marca con un punto. */
  answered: boolean;
  /** El formulario avisa al guardar, para que el resto del sitio se entere. */
  saved: (answer: RsvpFormState) => void;
}

const GuestContext = createContext<Guest | null>(null);

export function useGuest(): Guest {
  const guest = useContext(GuestContext);
  if (!guest) throw new Error('useGuest() fuera de <GuestShell>');
  return guest;
}

/** Pantalla sin menú para los dos estados sin contenido. */
function Bare({ children }: { children?: ReactNode }) {
  return (
    <main className="grain relative flex min-h-[100dvh] items-center overflow-hidden">
      <Glow />
      <Container className="relative">{children}</Container>
    </main>
  );
}

function Loading() {
  return (
    <Bare>
      <span className="mx-auto block h-1.5 w-1.5 animate-pulse rounded-full bg-teja" aria-label="Cargando" />
    </Bare>
  );
}

function Invalid() {
  return (
    <Bare>
      <Label className="animate-rise text-teja">Enlace no válido</Label>
      <h1
        className="balance mt-6 max-w-3xl animate-rise font-display text-[clamp(3rem,13vw,7rem)] leading-[0.9] tracking-[-0.03em] text-ink-900"
        style={{ animationDelay: '150ms' }}
      >
        Este enlace no <em className="text-teja">funciona</em>.
      </h1>
      <p
        className="mt-8 max-w-md animate-rise text-[17px] leading-relaxed text-ink-500"
        style={{ animationDelay: '300ms' }}
      >
        Revisa que lo has copiado entero — es largo y se corta con facilidad — o escríbenos y te mandamos
        otro.
      </p>
    </Bare>
  );
}

const EMPTY: RsvpFormState = {
  status: 'confirmado',
  allergies: '',
  transport: false,
  song_request: '',
  notes: '',
};

function Resolve({ children }: { children: ReactNode }) {
  const fromUrl = useSearchParams().get('t');
  const [state, setState] = useState<'loading' | 'invalid' | 'ready'>('loading');
  const [token, setToken] = useState('');
  const [firstName, setFirstName] = useState('');
  const [answer, setAnswer] = useState<RsvpFormState>(EMPTY);
  const [answered, setAnswered] = useState(false);
  const resolved = useRef<string | null>(null);

  useEffect(() => {
    const candidate = fromUrl || remembered();
    // Quien llegó sin `?t=` lo gana en el primer clic del menú, que siempre lo
    // lleva: es el mismo invitado, no hay nada que volver a pedir.
    if (candidate && candidate === resolved.current) return;
    if (!candidate || !rsvpStore.isConfigured) {
      setState('invalid');
      return;
    }
    let cancelled = false;
    rsvpStore
      .getRsvp(candidate)
      .then((doc) => {
        if (cancelled) return;
        if (!doc) {
          if (candidate === remembered()) remember(null);
          setState('invalid');
          return;
        }
        remember(candidate);
        resolved.current = candidate;
        setToken(candidate);
        setFirstName(doc.first_name || '');
        setAnswered(doc.status === 'confirmado' || doc.status === 'no_viene');
        setAnswer({
          // Un documento recién creado por el gestor solo trae el nombre: sin
          // respuesta todavía, se ofrece "confirmado" por defecto.
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
    // Solo al llegar con otro `?t=`: navegar entre páginas no vuelve a pedirlo.
  }, [fromUrl]);

  const saved = useCallback((next: RsvpFormState) => {
    setAnswer(next);
    setAnswered(true);
  }, []);

  if (state === 'loading') return <Loading />;
  if (state === 'invalid') return <Invalid />;

  return (
    <GuestContext.Provider value={{ token, firstName, answer, answered, saved }}>
      {/* Hueco abajo para que el menú flotante nunca tape el final de la página. */}
      <div className="pb-[calc(env(safe-area-inset-bottom)+6.5rem)]">{children}</div>
      <BottomNav />
    </GuestContext.Provider>
  );
}

export function GuestShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <Resolve>{children}</Resolve>
    </Suspense>
  );
}
