'use client';

// Las listas de sitios: hoteles, peluquerías, barberías. Una tarjeta de papel
// por sitio, sin desplegables — el teléfono de una peluquería es justo el dato
// que nadie debería tener que buscar dos veces, así que está siempre a la vista.

import { ArrowUpRight, MapPin, Phone } from 'lucide-react';
import type { InfoPlace } from '@/lib/wedding-info';
import { cn } from '@/lib/utils';
import { EASE, useInView, useReducedMotion } from './motion';

/** Enlace de contacto: una píldora de filete fino que se rellena de teja al pasar. */
function Link({ href, icon: Icon, children }: { href: string; icon: typeof Phone; children: string }) {
  const external = !href.startsWith('tel:');
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink-300 bg-bone-50 px-4 text-[13px] font-medium text-ink-800 transition-colors duration-300 hover:border-teja hover:bg-teja hover:text-bone-50 active:bg-teja-dark"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      {children}
    </a>
  );
}

function Place({ place, index }: { place: InfoPlace; index: number }) {
  const { name, note, perk, phone, address, web } = place;
  const maps = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`
    : null;
  // El observador va en el propio <li>: envolverlo en un <div> para animarlo
  // rompería `ul > li`.
  const { ref, seen } = useInView<HTMLLIElement>();
  const reduced = useReducedMotion();
  const on = seen || reduced;

  return (
    <li
      ref={ref}
      style={{ transitionDelay: on && !reduced ? `${index * 90}ms` : '0ms', transitionTimingFunction: EASE }}
      className={cn(
        'relative rounded-[28px] bg-bone-50 p-6 shadow-soft ring-1 ring-ink-900/[0.05] transition-[opacity,transform] duration-[900ms] motion-reduce:transition-none sm:p-8',
        on ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      <span className="absolute right-6 top-6 text-[11px] font-medium tabular-nums tracking-[0.2em] text-ink-400 sm:right-8 sm:top-8" aria-hidden>
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <h3 className="pr-10 font-display text-[clamp(1.9rem,7vw,2.5rem)] leading-[1.05] text-ink-900">{name}</h3>
        {note && <p className="mt-2 text-[16px] leading-relaxed text-ink-500">{note}</p>}

        {perk && (
          <p className="mt-4 flex items-start gap-3 rounded-2xl bg-sol/35 px-4 py-3 text-[15px] leading-snug text-ink-800">
            <span className="mt-[0.45rem] h-1.5 w-1.5 flex-none rounded-full bg-teja" aria-hidden />
            {perk}
          </p>
        )}

        {(phone || maps || web) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {phone && (
              <Link href={`tel:${phone.replace(/\s/g, '')}`} icon={Phone}>
                {phone}
              </Link>
            )}
            {maps && (
              <Link href={maps} icon={MapPin}>
                Cómo llegar
              </Link>
            )}
            {web && (
              <Link href={web.startsWith('http') ? web : `https://${web}`} icon={ArrowUpRight}>
                Web
              </Link>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export function Places({ places }: { places: InfoPlace[] }) {
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {places.map((place, i) => (
        <Place key={place.name} place={place} index={i} />
      ))}
    </ul>
  );
}
