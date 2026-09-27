'use client';

// El formulario de confirmación. Vive aparte de la página porque tiene toda
// la interacción de la pieza: la elección, los campos que se despliegan, el
// envío y el estado de "gracias" — que no es otra pantalla, sino esta misma
// transformándose. Si vuelves a esta página con la respuesta ya dada, lo
// primero que ves es ese resumen, no el formulario otra vez en blanco.

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { rsvpStore, type GuestStatus, type RsvpAnswer } from '@/lib/rsvp-store';
import { cn, guestCode } from '@/lib/utils';
import { Collapse, EASE } from './motion';
import { NAV, useHref } from './nav';
import { Label } from './shell';

export interface RsvpFormState {
  status: GuestStatus;
  allergies: string;
  transport: boolean;
  song_request: string;
  notes: string;
}

/**
 * Una de las dos respuestas: una tarjeta a todo el ancho que, al elegirla, se
 * llena de luz desde abajo y se enmarca en teja. La decisión se ve desde
 * lejos, sin iconos ni colores de semáforo.
 */
function Choice({
  selected,
  onSelect,
  label,
  hint,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'group relative flex w-full cursor-pointer items-center justify-between gap-4 overflow-hidden rounded-[24px] bg-bone-50 px-5 py-6 text-left text-ink-900 shadow-soft sm:px-7 sm:py-7',
        'ring-inset transition-shadow duration-300 motion-reduce:transition-none',
        selected ? 'ring-2 ring-teja' : 'ring-1 ring-ink-900/[0.06] hover:ring-ink-900/20'
      )}
      style={{ transitionTimingFunction: EASE }}
    >
      {/* El relleno sube desde abajo: el gesto de "marcar", no un cambio seco. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 origin-bottom bg-sol/35 transition-transform duration-500 motion-reduce:transition-none',
          selected ? 'scale-y-100' : 'scale-y-0'
        )}
        style={{ transitionTimingFunction: EASE }}
      />
      <span className="relative flex items-center gap-4 sm:gap-5">
        <span
          aria-hidden
          className={cn(
            'flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-colors duration-300',
            selected ? 'border-teja' : 'border-ink-400 group-hover:border-ink-800'
          )}
        >
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full bg-teja transition-transform duration-300 motion-reduce:transition-none',
              selected ? 'scale-100' : 'scale-0'
            )}
          />
        </span>
        <span className="font-display text-[clamp(1.9rem,8vw,2.6rem)] leading-none tracking-[-0.01em]">{label}</span>
      </span>
      <span
        className={cn(
          'relative hidden text-[13px] min-[400px]:block',
          selected ? 'text-ink-700' : 'text-ink-500'
        )}
      >
        {hint}
      </span>
    </button>
  );
}

/**
 * Campo de una línea: sin caja, solo un filete abajo que se tiñe de teja al
 * enfocar. Menos ruido que un input con borde, y el gesto se ve.
 */
function LineField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="group block">
      <Label>{label}</Label>
      <div className="relative mt-3">
        {children}
        <span className="absolute inset-x-0 bottom-0 h-px bg-ink-300" aria-hidden />
        <span
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-teja transition-transform duration-500 group-focus-within:scale-x-100 motion-reduce:transition-none"
          style={{ transitionTimingFunction: EASE }}
          aria-hidden
        />
      </div>
      {hint && <span className="mt-2 block text-[13px] text-ink-500">{hint}</span>}
    </label>
  );
}

const INPUT =
  'block w-full bg-transparent pb-3 text-[19px] leading-normal text-ink-900 placeholder:text-ink-300 focus:outline-none focus-visible:outline-none';

/** Interruptor de verdad, no un checkbox: se entiende de un vistazo. */
function Switch({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer items-center justify-between gap-4 border-b border-ink-300 pb-5 text-left"
    >
      <span className="min-w-0">
        <span className="block text-[17px] text-ink-900">{label}</span>
        <span className="mt-0.5 block text-[13px] text-ink-500">{hint}</span>
      </span>
      <span
        className={cn(
          'relative h-8 w-14 flex-none rounded-full transition-colors duration-300',
          checked ? 'bg-teja' : 'bg-bone-300'
        )}
      >
        <span
          className="absolute top-1 h-6 w-6 rounded-full bg-bone-50 shadow-soft transition-transform duration-300 motion-reduce:transition-none"
          style={{
            transitionTimingFunction: EASE,
            transform: `translateX(${checked ? '1.75rem' : '0.25rem'})`,
          }}
        />
      </span>
    </button>
  );
}

/** El "hecho": un círculo y un palito que se dibujan solos. */
function DrawnCheck() {
  return (
    <svg viewBox="0 0 48 48" className="h-14 w-14" fill="none" aria-hidden>
      <circle
        cx="24"
        cy="24"
        r="22"
        strokeWidth="1.25"
        className="animate-draw stroke-ink-900 [stroke-dasharray:139] [stroke-dashoffset:139]"
      />
      <path
        d="M15 24.5 21.5 31 33 18"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-draw stroke-teja [animation-delay:600ms] [stroke-dasharray:30] [stroke-dashoffset:30]"
      />
    </svg>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-4 border-t border-ink-300 py-4">
      <dt>
        <Label>{label}</Label>
      </dt>
      <dd className="min-w-0 break-words text-[16px] text-ink-900">{value}</dd>
    </div>
  );
}

/** Las páginas a las que invitar tras confirmar, con su texto. */
const NEXT_STEPS: Record<string, string> = {
  '/el-dia/': 'Ver el plan del día',
  '/dormir/': 'Dónde dormir',
  '/arreglarse/': 'Dónde arreglarse',
};

// Solo las que salen en el menú: si una lista está vacía, tampoco se ofrece aquí.
const nextSteps = NAV.filter((item) => item.href in NEXT_STEPS);

/** Siguiente paso tras responder: una tarjeta hacia otra página del menú. */
function Next({ href, label }: { href: string; label: string }) {
  const withToken = useHref();
  return (
    <Link
      href={withToken(href)}
      className="group flex min-h-14 items-center justify-between gap-4 rounded-[20px] bg-bone-50 px-5 text-[16px] font-medium text-ink-900 shadow-soft ring-1 ring-ink-900/[0.06] transition-shadow hover:ring-teja"
    >
      {label}
      <ArrowRight
        className="h-4 w-4 text-teja transition-transform duration-500 group-hover:translate-x-1 motion-reduce:transition-none"
        style={{ transitionTimingFunction: EASE }}
        aria-hidden
      />
    </Link>
  );
}

interface RsvpFormProps {
  token: string;
  firstName: string;
  initial: RsvpFormState;
  /** true si ya había respondido: se abre en el resumen, no en el formulario. */
  answered: boolean;
  /** Avisa al resto del sitio: el menú quita el punto de "sin responder". */
  onSaved: (answer: RsvpFormState) => void;
}

export function RsvpForm({ token, firstName, initial, answered, onSaved }: RsvpFormProps) {
  const [form, setForm] = useState<RsvpFormState>(initial);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(answered);
  const [failed, setFailed] = useState(false);

  const comes = form.status === 'confirmado';

  function set<K extends keyof RsvpFormState>(key: K, value: RsvpFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setSending(true);
    setFailed(false);
    const answer: RsvpAnswer = {
      status: form.status,
      allergies: form.allergies.trim() || null,
      transport: form.transport,
      song_request: form.song_request.trim() || null,
      notes: form.notes.trim() || null,
    };
    try {
      await rsvpStore.submitRsvp(token, answer);
      setSent(true);
      onSaved(form);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="animate-in-up" role="status">
        <div className="flex items-start justify-between gap-6">
          <DrawnCheck />
          <Label className="pt-2 tabular-nums">Nº {guestCode(token)}</Label>
        </div>

        <p className="balance mt-8 font-display text-[clamp(2.75rem,11vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-ink-900">
          Gracias{firstName ? <>, <em className="text-teja">{firstName}</em></> : ''}.
        </p>
        <p className="mt-5 max-w-[30rem] text-[17px] leading-relaxed text-ink-500">
          {comes
            ? 'Lo tenemos todo apuntado. Si cambia algo, vuelve aquí cuando quieras: este enlace es tuyo.'
            : 'Qué pena que no puedas venir. Gracias por decírnoslo.'}
        </p>

        <dl className="mt-10 rounded-[24px] bg-bone-50 px-5 shadow-soft ring-1 ring-ink-900/[0.05] sm:px-7 [&>div:first-child]:border-t-0">
          <SummaryRow label="Asistencia" value={comes ? 'Allí estaré' : 'No podré ir'} />
          {comes && form.allergies.trim() && <SummaryRow label="Alergias" value={form.allergies.trim()} />}
          {comes && form.transport && <SummaryRow label="Transporte" value="Sí, lo necesito" />}
          {comes && form.song_request.trim() && <SummaryRow label="Canción" value={form.song_request.trim()} />}
          {comes && form.notes.trim() && <SummaryRow label="Nota" value={form.notes.trim()} />}
        </dl>

        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-8 inline-flex min-h-11 cursor-pointer items-center text-[13px] font-medium uppercase tracking-[0.18em] text-ink-900 underline decoration-ink-300 decoration-1 underline-offset-[7px] transition-colors hover:decoration-teja"
        >
          Cambiar mi respuesta
        </button>

        {/* Con la respuesta dada, lo siguiente que suele querer saber. */}
        {comes && nextSteps.length > 0 && (
          <div className="mt-12 grid gap-3 sm:grid-cols-2">
            {nextSteps.map((item) => (
              <Next key={item.href} href={item.href} label={NEXT_STEPS[item.href]} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div role="radiogroup" aria-label="¿Vienes?" className="grid gap-3">
        <Choice selected={comes} onSelect={() => set('status', 'confirmado')} label="Allí estaré" hint="No me lo pierdo" />
        <Choice selected={!comes} onSelect={() => set('status', 'no_viene')} label="No podré ir" hint="Otra vez será" />
      </div>

      <Collapse open={comes}>
        <div className="grid gap-10 pt-14 sm:grid-cols-2 sm:gap-x-10">
          <div className="sm:col-span-2">
            <LineField label="Alergias o intolerancias" hint="Se lo pasamos tal cual al catering.">
              <input
                className={INPUT}
                value={form.allergies}
                onChange={(e) => set('allergies', e.target.value)}
                placeholder="Sin lactosa, sin frutos secos…"
              />
            </LineField>
          </div>

          <div className="sm:col-span-2">
            <Switch
              checked={form.transport}
              onChange={(v) => set('transport', v)}
              label="Necesitaré transporte"
              hint="Si sois varios, ponemos autobús."
            />
          </div>

          <LineField label="La canción que no puede faltar">
            <input
              className={INPUT}
              value={form.song_request}
              onChange={(e) => set('song_request', e.target.value)}
              placeholder="Título y artista"
            />
          </LineField>

          <LineField label="Algo más que debamos saber">
            <textarea
              rows={1}
              className={cn(INPUT, 'resize-none')}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Cualquier otra cosa…"
            />
          </LineField>
        </div>
      </Collapse>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={sending}
        className={cn(
          'group relative mt-14 flex h-[4.5rem] w-full cursor-pointer items-center justify-between overflow-hidden rounded-[24px] bg-teja px-6 text-bone-50 shadow-float sm:px-8',
          'disabled:cursor-wait disabled:opacity-70'
        )}
      >
        {/* Barrido más oscuro al pasar: de izquierda a derecha, bajo el texto. */}
        <span
          aria-hidden
          className="absolute inset-0 origin-left scale-x-0 bg-teja-dark transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
          style={{ transitionTimingFunction: EASE }}
        />
        <span className="relative text-[14px] font-medium uppercase tracking-[0.2em]">
          {sending ? 'Enviando' : 'Enviar mi respuesta'}
        </span>
        <span className="relative flex h-6 w-6 items-center justify-center overflow-hidden" aria-hidden>
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowRight
              className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1 motion-reduce:transition-none"
              style={{ transitionTimingFunction: EASE }}
            />
          )}
        </span>
      </button>

      {failed && (
        <p role="alert" className="mt-4 text-[14px] text-teja">
          No hemos podido guardarlo. Revisa la conexión y prueba otra vez.
        </p>
      )}
    </div>
  );
}
