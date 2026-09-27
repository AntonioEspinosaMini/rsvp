'use client';

// El menú flotante de abajo. Una píldora de papel que flota sobre el
// contenido, con cinco destinos como mucho — más no caben con su nombre en un
// móvil de 375px, y un icono sin nombre obliga a adivinar. Confirmar va en el
// centro, donde cae el pulgar, y lleva un punto mientras no hayas respondido:
// es lo único que de verdad necesitamos de cada invitado.
//
// El fondo del destino activo se desliza de uno a otro en vez de saltar: el
// menú vive en el layout y no se desmonta al navegar, así que la transición
// sale gratis con un `transform`.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BedDouble, CalendarClock, House, MailCheck, Scissors, type LucideIcon } from 'lucide-react';
import { BARBERS, HAIR_SALONS, HOTELS, TIMELINE } from '@/lib/wedding-info';
import { cn } from '@/lib/utils';
import { useGuest } from './guest';
import { EASE } from './motion';

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Una página sin datos (array vacío en `lib/wedding-info.ts`) no sale en el
// menú: mejor cuatro botones que uno que lleva a un "próximamente".
export const NAV: Item[] = [
  { href: '/', label: 'Inicio', icon: House },
  ...(TIMELINE.length > 0 ? [{ href: '/el-dia/', label: 'El día', icon: CalendarClock }] : []),
  { href: '/confirmar/', label: 'Confirmar', icon: MailCheck },
  ...(HOTELS.length > 0 ? [{ href: '/dormir/', label: 'Dormir', icon: BedDouble }] : []),
  ...(HAIR_SALONS.length + BARBERS.length > 0 ? [{ href: '/arreglarse/', label: 'Arreglarse', icon: Scissors }] : []),
];

/** Enlace interno con el token pegado, para que la URL siga siendo la suya. */
export function useHref() {
  const { token } = useGuest();
  return (href: string) => `${href}?t=${encodeURIComponent(token)}`;
}

const trim = (path: string) => path.replace(/\/+$/, '') || '/';

export function BottomNav() {
  const pathname = trim(usePathname() || '/');
  const { answered } = useGuest();
  const withToken = useHref();
  const active = NAV.findIndex((item) => trim(item.href) === pathname);

  return (
    <nav
      aria-label="Secciones"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
    >
      <ul
        className="pointer-events-auto relative grid w-full max-w-md rounded-[28px] bg-bone-50/85 p-1.5 shadow-float ring-1 ring-ink-900/[0.06] backdrop-blur-xl backdrop-saturate-150"
        style={{ gridTemplateColumns: `repeat(${NAV.length}, minmax(0, 1fr))` }}
      >
        {/* El fondo del activo: ocupa una columna y se desplaza a la suya. */}
        {active >= 0 && (
          <li
            aria-hidden
            className="absolute bottom-1.5 left-1.5 top-1.5 rounded-[22px] bg-teja shadow-soft transition-transform duration-500 motion-reduce:transition-none"
            style={{
              width: `calc((100% - 0.75rem) / ${NAV.length})`,
              transform: `translateX(${active * 100}%)`,
              transitionTimingFunction: EASE,
            }}
          />
        )}

        {NAV.map((item, i) => {
          const on = i === active;
          const Icon = item.icon;
          const pending = item.href === '/confirmar/' && !answered;
          return (
            <li key={item.href} className="relative">
              <Link
                href={withToken(item.href)}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 cursor-pointer touch-manipulation flex-col items-center justify-center gap-1 rounded-[22px] px-1 text-[11px] font-medium tracking-[0.01em] transition-colors duration-300',
                  'focus-visible:outline-offset-[-3px]',
                  on ? 'text-bone-50' : 'text-ink-500 hover:bg-bone-200/70 hover:text-ink-900 active:bg-bone-200'
                )}
              >
                <span className="relative">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={on ? 2 : 1.6} aria-hidden />
                  {pending && (
                    <span
                      className={cn(
                        'absolute -right-1 -top-0.5 h-2 w-2 rounded-full ring-2',
                        on ? 'bg-bone-50 ring-teja' : 'bg-teja ring-bone-50'
                      )}
                      aria-hidden
                    />
                  )}
                </span>
                <span className="max-w-full truncate">{item.label}</span>
                {pending && <span className="sr-only">(sin responder)</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
