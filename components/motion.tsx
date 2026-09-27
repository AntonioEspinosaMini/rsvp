'use client';

// Las piezas de movimiento del RSVP público. Todo es CSS: un IntersectionObserver
// pone una clase cuando el bloque entra en pantalla y la transición la hace el
// compositor (opacity + transform, nada que provoque layout). Cero librerías de
// animación en el bundle que descargan 300 invitados desde el móvil.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Curva de salida larga: entra rápido y frena. Es la que da el aire "caro". */
export const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** true si el sistema pide menos movimiento (iOS: Ajustes > Accesibilidad). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

// ─── Registro compartido de bloques por revelar ─────────────────────────────
// Un IntersectionObserver por bloque parecía lo natural, pero tiene un fallo
// que se ve enseguida en el móvil: el observador solo avisa cuando el estado
// de intersección CAMBIA, y con un scroll rápido (o al saltar a un ancla, o al
// volver atrás con la posición restaurada) un bloque puede pasar de "debajo de
// la pantalla" a "encima" dentro del mismo fotograma. Nunca interseca, nunca
// llega el aviso, y el bloque se queda invisible para siempre.
//
// Así que una sola lista y un único listener de scroll a rAF: se mira la
// posición de los que quedan por enseñar y se sacan los que ya han llegado o
// se han quedado atrás. Cada bloque se borra de la lista al aparecer, y el
// listener se quita solo cuando no queda ninguno: al final de la página no hay
// nada escuchando.

type Watcher = { el: HTMLElement; show: () => void };

const watchers = new Set<Watcher>();
let frame = 0;
let listening = false;

function sweep() {
  frame = 0;
  // Un pelín antes del borde inferior: la entrada se ve, no se descubre ya hecha.
  const limit = window.innerHeight * 0.92;
  for (const watcher of Array.from(watchers)) {
    if (watcher.el.getBoundingClientRect().top < limit) {
      watchers.delete(watcher);
      watcher.show();
    }
  }
  if (watchers.size === 0) stopListening();
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(sweep);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
}

/** true en cuanto el elemento ha llegado a la pantalla (y ya no vuelve a false). */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const watcher: Watcher = { el, show: () => setSeen(true) };
    watchers.add(watcher);
    startListening();
    schedule();
    return () => {
      watchers.delete(watcher);
      if (watchers.size === 0) stopListening();
    };
  }, [seen]);

  return { ref, seen };
}

interface RevealProps {
  children: ReactNode;
  /** Retardo en ms, para escalonar una lista. */
  delay?: number;
  className?: string;
}

/** Aparece desde abajo cuando entra en pantalla. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, seen } = useInView<HTMLDivElement>();
  const reduced = useReducedMotion();
  const shown = seen || reduced;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms', transitionTimingFunction: EASE }}
      className={cn(
        'transition-[opacity,transform] duration-[900ms] motion-reduce:transition-none',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Abre y cierra en alto sin saber cuánto mide el contenido, con el truco de
 * `grid-template-rows: 0fr → 1fr`: se anima de verdad, a diferencia de
 * `height: auto`, y sin medir nada en JavaScript.
 */
export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      style={{ transitionTimingFunction: EASE }}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-500 motion-reduce:transition-none',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
