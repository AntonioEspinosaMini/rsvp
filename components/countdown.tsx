'use client';

// La cuenta atrás de la portada. Vive en su propio componente para que el
// tic de cada segundo re-renderice cuatro números y no la página entera.
// Cifras tabulares: con las proporcionales el bloque bailaría a cada cambio.

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const pad = (n: number) => String(n).padStart(2, '0');

function Cell({ value, label, tick }: { value: string; label: string; tick?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="relative block overflow-hidden text-[clamp(1.5rem,6vw,2rem)] font-medium leading-none tracking-[-0.02em] tabular-nums">
        {/* `key` fuerza a remontar el número al cambiar: así la entrada se
            repite en cada tic, sin JavaScript de animación. */}
        <span key={tick ? value : undefined} className={cn('block', tick && 'animate-tick text-teja')}>
          {value}
        </span>
      </span>
      <span className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.2em] text-ink-500">{label}</span>
    </div>
  );
}

export function Countdown({ target }: { target: string }) {
  const end = new Date(target).getTime();
  // null hasta montar: la hora del servidor y la del móvil nunca coinciden, y
  // pintar una en cada lado da un aviso de hidratación y un salto visible.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now === null) return <div className="h-[3.4rem]" aria-hidden />;

  const left = Math.max(0, end - now);
  if (left === 0) return null;

  const s = Math.floor(left / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  return (
    <div role="timer" aria-live="off">
      <span className="sr-only">Faltan {days} días.</span>
      <div aria-hidden className="grid grid-cols-4 gap-5 text-ink-900 sm:gap-8">
        <Cell value={String(days)} label="Días" />
        <Cell value={pad(hours)} label="Horas" />
        <Cell value={pad(mins)} label="Min" />
        <Cell value={pad(secs)} label="Seg" tick />
      </div>
    </div>
  );
}
