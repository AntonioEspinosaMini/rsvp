'use client';

// El día, hora a hora. La línea que une los puntos no está dibujada: crece de
// arriba abajo según vas bajando, un tramo por parada. Es la única animación
// de la página que cuenta algo — el paso del tiempo.

import type { TimelineStop } from '@/lib/wedding-info';
import { cn } from '@/lib/utils';
import { EASE, useInView, useReducedMotion } from './motion';

function Stop({ stop, last, index }: { stop: TimelineStop; last: boolean; index: number }) {
  const { ref, seen } = useInView<HTMLLIElement>();
  const reduced = useReducedMotion();
  const on = seen || reduced;
  const delay = reduced ? 0 : index * 90;

  return (
    <li ref={ref} className="grid grid-cols-[3.5rem_1.25rem_1fr]">
      <time
        style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: EASE }}
        className={cn(
          'pt-px font-mono text-[13px] tabular-nums text-blush-600 transition-opacity duration-700 motion-reduce:transition-none',
          on ? 'opacity-100' : 'opacity-0'
        )}
      >
        {stop.time}
      </time>

      <div className="flex h-full flex-col items-center" aria-hidden>
        <span
          style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: EASE }}
          className={cn(
            'mt-[5px] h-[7px] w-[7px] flex-none rounded-full bg-blush-400 transition-transform duration-500 motion-reduce:transition-none',
            on ? 'scale-100' : 'scale-0'
          )}
        />
        {!last && (
          <span
            style={{ transitionDelay: `${delay + 120}ms`, transitionTimingFunction: EASE }}
            className={cn(
              'mt-1.5 w-px flex-1 origin-top bg-gradient-to-b from-ink-300/80 to-ink-200/40 transition-transform duration-[900ms] motion-reduce:transition-none',
              on ? 'scale-y-100' : 'scale-y-0'
            )}
          />
        )}
      </div>

      <div
        style={{ transitionDelay: `${delay + 60}ms`, transitionTimingFunction: EASE }}
        className={cn(
          'pb-8 transition-[opacity,transform] duration-700 motion-reduce:transition-none',
          last && 'pb-0',
          on ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        )}
      >
        <p className="text-[16px] leading-snug text-ink-800">{stop.title}</p>
        {stop.place && <p className="mt-0.5 text-[13.5px] text-ink-500">{stop.place}</p>}
        {stop.detail && <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400">{stop.detail}</p>}
      </div>
    </li>
  );
}

export function Timeline({ stops }: { stops: TimelineStop[] }) {
  return (
    <ol>
      {stops.map((stop, i) => (
        <Stop key={`${stop.time}-${stop.title}`} stop={stop} index={i} last={i === stops.length - 1} />
      ))}
    </ol>
  );
}
