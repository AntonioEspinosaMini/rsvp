'use client';

// El día, hora a hora. Una tabla de horarios de las de antes, sobre una hoja
// de papel: la hora en grande a la izquierda, lo que pasa a la derecha, un
// filete entre cada fila que se traza al llegar a él. Sin nodos, sin líneas
// de metro.

import type { TimelineStop } from '@/lib/wedding-info';
import { cn } from '@/lib/utils';
import { EASE, useInView, useReducedMotion } from './motion';

function Stop({ stop, index }: { stop: TimelineStop; index: number }) {
  const { ref, seen } = useInView<HTMLLIElement>();
  const reduced = useReducedMotion();
  const on = seen || reduced;
  const delay = reduced ? 0 : index * 80;

  return (
    <li ref={ref} className="relative grid grid-cols-[5.5rem_1fr] gap-x-5 py-7 sm:grid-cols-[9rem_1fr] sm:gap-x-8">
      {index > 0 && (
        <span
          aria-hidden
          className={cn(
            'absolute inset-x-0 top-0 h-px origin-left bg-ink-300 transition-transform duration-[1100ms] motion-reduce:transition-none',
            on ? 'scale-x-100' : 'scale-x-0'
          )}
          style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: EASE }}
        />
      )}
      <time
        style={{ transitionDelay: `${delay + 80}ms`, transitionTimingFunction: EASE }}
        className={cn(
          'font-display text-[clamp(2rem,8vw,2.75rem)] leading-none tabular-nums text-ink-900 transition-[opacity,transform] duration-700 motion-reduce:transition-none',
          on ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        )}
      >
        {stop.time}
      </time>
      <div
        style={{ transitionDelay: `${delay + 160}ms`, transitionTimingFunction: EASE }}
        className={cn(
          'pt-1 transition-[opacity,transform] duration-700 motion-reduce:transition-none',
          on ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        )}
      >
        <p className="text-[18px] font-medium leading-snug text-ink-900">{stop.title}</p>
        {stop.place && <p className="mt-1 text-[15px] text-ink-600">{stop.place}</p>}
        {stop.detail && <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{stop.detail}</p>}
      </div>
    </li>
  );
}

export function Timeline({ stops }: { stops: TimelineStop[] }) {
  return (
    <ol className="rounded-[28px] bg-bone-50 px-6 py-2 shadow-soft ring-1 ring-ink-900/[0.05] sm:px-10 sm:py-4">
      {stops.map((stop, i) => (
        <Stop key={`${stop.time}-${stop.title}`} stop={stop} index={i} />
      ))}
    </ol>
  );
}
