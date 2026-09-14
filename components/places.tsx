'use client';

// Las listas de sitios: hoteles, peluquerías, barberías. Sin tarjetas y sin
// desplegables — el teléfono de una peluquería es justo el dato que nadie
// debería tener que buscar dos veces, así que está siempre a la vista.

import { ArrowUpRight, MapPin, Phone } from 'lucide-react';
import type { InfoPlace } from '@/lib/wedding-info';
import { cn } from '@/lib/utils';
import { EASE, useInView, useReducedMotion } from './motion';

/** Enlace de contacto: sin caja, con una regla que se rellena al pasar. */
function Link({ href, icon: Icon, children }: { href: string; icon: typeof Phone; children: string }) {
  const external = !href.startsWith('tel:');
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group/link relative inline-flex items-center gap-1.5 py-1 text-[13.5px] text-ink-600 transition-colors hover:text-ink-900"
    >
      <Icon className="h-3.5 w-3.5 text-blush-400" strokeWidth={1.75} />
      {children}
      <span
        style={{ transitionTimingFunction: EASE }}
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-blush-300 transition-transform duration-300 group-hover/link:scale-x-100 motion-reduce:transition-none"
        aria-hidden
      />
    </a>
  );
}

function Place({ place, index }: { place: InfoPlace; index: number }) {
  const { name, note, perk, phone, address, web } = place;
  const maps = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`
    : null;
  // El observador va en el propio <li>: envolverlo en un <div> para animarlo
  // rompería `ul > li` y, con él, la línea que separa un sitio del siguiente.
  const { ref, seen } = useInView<HTMLLIElement>();
  const reduced = useReducedMotion();
  const on = seen || reduced;

  return (
    <li
      ref={ref}
      style={{ transitionDelay: on && !reduced ? `${index * 90}ms` : '0ms', transitionTimingFunction: EASE }}
      className={cn(
        'py-6 transition-[opacity,transform] duration-[900ms] first:pt-0 motion-reduce:transition-none',
        index > 0 && 'border-t border-ink-200/70',
        on ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      <h3 className="font-display text-[1.6rem] font-light leading-tight text-ink-800">{name}</h3>
      {note && <p className="mt-1 text-[14px] leading-relaxed text-ink-500">{note}</p>}

      {perk && (
        <p className="mt-3 inline-block rounded-full bg-sage-100 px-3 py-1.5 text-[13px] leading-snug text-sage-700">
          {perk}
        </p>
      )}

      {(phone || maps || web) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-5">
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
    </li>
  );
}

export function Places({ places }: { places: InfoPlace[] }) {
  return (
    <ul>
      {places.map((place, i) => (
        <Place key={place.name} place={place} index={i} />
      ))}
    </ul>
  );
}
