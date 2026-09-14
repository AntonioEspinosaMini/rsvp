'use client';

// El formulario de confirmación. Vive aparte de la página porque tiene toda
// la interacción de la pieza: la elección, los campos que se despliegan, el
// envío y el estado de "gracias" — que no es otra pantalla, sino esta misma
// transformándose, para que el invitado no pierda de vista el resto de la
// información al responder.

import { useState, type ReactNode } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { rsvpStore, type GuestStatus, type RsvpAnswer } from '@/lib/rsvp-store';
import { cn } from '@/lib/utils';
import { Collapse, EASE, Reveal } from './motion';
import { Mono } from './shell';

export interface RsvpFormState {
  status: GuestStatus;
  allergies: string;
  transport: boolean;
  song_request: string;
  notes: string;
}

/** Una de las dos respuestas grandes. Ocupa media pantalla a propósito. */
function Choice({
  selected,
  onSelect,
  label,
  hint,
  tone,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  hint: string;
  tone: 'yes' | 'no';
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{ transitionTimingFunction: EASE }}
      className={cn(
        'group relative flex min-h-[6.75rem] flex-col justify-between overflow-hidden rounded-[1.25rem] p-4 text-left',
        'transition-[background-color,color,box-shadow,transform] duration-500 active:scale-[0.98] motion-reduce:transition-none',
        selected
          ? tone === 'yes'
            ? 'bg-sage-500 text-white shadow-lg shadow-sage-500/20'
            : 'bg-ink-700 text-white shadow-lg shadow-ink-700/20'
          : 'bg-white/70 text-ink-500 ring-1 ring-inset ring-ink-200 hover:bg-white hover:ring-ink-300'
      )}
    >
      <span
        style={{ transitionTimingFunction: EASE }}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 motion-reduce:transition-none',
          selected ? 'scale-100 bg-white/25 opacity-100' : 'scale-50 opacity-0'
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
      <span>
        <span className="block font-display text-2xl leading-tight">{label}</span>
        <span className={cn('mt-0.5 block text-[13px]', selected ? 'text-white/70' : 'text-ink-400')}>
          {hint}
        </span>
      </span>
    </button>
  );
}

/**
 * Campo de una línea: sin caja, solo una regla abajo que se tiñe de rosa al
 * enfocar. Menos ruido que un input con borde, y el gesto se ve.
 */
function LineField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="group block">
      <Mono className="block text-ink-500">{label}</Mono>
      <div className="relative mt-2">
        {children}
        <span className="absolute inset-x-0 bottom-0 h-px bg-ink-200" aria-hidden />
        <span
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-blush-400 transition-transform duration-500 group-focus-within:scale-x-100 motion-reduce:transition-none"
          style={{ transitionTimingFunction: EASE }}
          aria-hidden
        />
      </div>
      {hint && <span className="mt-1.5 block text-[12.5px] text-ink-400">{hint}</span>}
    </label>
  );
}

const INPUT = 'w-full bg-transparent pb-2.5 text-[17px] text-ink-800 placeholder:text-ink-300 focus:outline-none';

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
      className="flex w-full items-center justify-between gap-4 py-1 text-left"
    >
      <span className="min-w-0">
        <span className="block text-[15px] text-ink-800">{label}</span>
        <span className="block text-[12.5px] text-ink-400">{hint}</span>
      </span>
      <span
        className={cn(
          'relative h-7 w-[3.25rem] flex-none rounded-full transition-colors duration-300',
          checked ? 'bg-sage-500' : 'bg-ink-200'
        )}
      >
        <span
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 motion-reduce:transition-none"
          style={{
            transitionTimingFunction: EASE,
            transform: `translateX(${checked ? '1.5rem' : '0.25rem'})`,
          }}
        />
      </span>
    </button>
  );
}

/** El "hecho": un círculo y un palito que se dibujan solos. */
function DrawnCheck() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" aria-hidden>
      <circle
        cx="24"
        cy="24"
        r="21"
        strokeWidth="1.5"
        className="animate-draw stroke-sage-400 [stroke-dasharray:133] [stroke-dashoffset:133] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
      />
      <path
        d="M15 24.5 21.5 31 33 18"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-draw stroke-sage-500 [animation-delay:500ms] [stroke-dasharray:30] [stroke-dashoffset:30] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
      />
    </svg>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-ink-200/70 py-2.5 first:border-0">
      <Mono>{label}</Mono>
      <span className="min-w-0 text-right text-[14px] text-ink-700">{value}</span>
    </div>
  );
}

interface RsvpFormProps {
  token: string;
  firstName: string;
  initial: RsvpFormState;
  /** Avisa a la página: con la respuesta enviada, sobra el botón flotante. */
  onSentChange?: (sent: boolean) => void;
}

export function RsvpForm({ token, firstName, initial, onSentChange }: RsvpFormProps) {
  const [form, setForm] = useState<RsvpFormState>(initial);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
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
      onSentChange?.(true);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="animate-in-up">
        <DrawnCheck />
        <p className="mt-5 font-display text-[clamp(2rem,8vw,2.6rem)] font-light leading-[1.05] text-ink-800">
          Gracias{firstName ? `, ${firstName}` : ''}.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
          {comes
            ? 'Lo tenemos todo apuntado. Sigue bajando para ver el plan del día y dónde quedarte.'
            : 'Qué pena que no puedas venir. Gracias por decírnoslo.'}
        </p>

        <div className="mt-7">
          <SummaryRow label="Asistencia" value={comes ? 'Allí estaré' : 'No podré ir'} />
          {comes && form.allergies.trim() && <SummaryRow label="Alergias" value={form.allergies.trim()} />}
          {comes && form.transport && <SummaryRow label="Transporte" value="Sí, lo necesito" />}
          {comes && form.song_request.trim() && <SummaryRow label="Canción" value={form.song_request.trim()} />}
          {comes && form.notes.trim() && <SummaryRow label="Nota" value={form.notes.trim()} />}
        </div>

        <button
          type="button"
          onClick={() => {
            setSent(false);
            onSentChange?.(false);
          }}
          className="mt-7 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400 underline decoration-ink-300 underline-offset-[6px] transition-colors hover:text-ink-700"
        >
          Cambiar mi respuesta
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Choice
          selected={comes}
          onSelect={() => set('status', 'confirmado')}
          label="Allí estaré"
          hint="No me lo pierdo"
          tone="yes"
        />
        <Choice
          selected={!comes}
          onSelect={() => set('status', 'no_viene')}
          label="No podré ir"
          hint="Otra vez será"
          tone="no"
        />
      </div>

      <Collapse open={comes}>
        <div className="space-y-7 pt-9">
          <LineField label="Alergias o intolerancias" hint="Se lo pasamos tal cual al catering.">
            <input
              className={INPUT}
              value={form.allergies}
              onChange={(e) => set('allergies', e.target.value)}
              placeholder="Sin lactosa, sin frutos secos…"
            />
          </LineField>

          <Switch
            checked={form.transport}
            onChange={(v) => set('transport', v)}
            label="Necesitaré transporte"
            hint="Si sois varios, ponemos autobús."
          />

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
              rows={2}
              className={cn(INPUT, 'resize-none')}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Cualquier otra cosa…"
            />
          </LineField>
        </div>
      </Collapse>

      <Reveal delay={80}>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={sending}
          style={{ transitionTimingFunction: EASE }}
          className={cn(
            'mt-9 flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-ink-800 text-[15px] font-medium text-white',
            'transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 hover:bg-ink-900 hover:shadow-xl hover:shadow-ink-800/20',
            'active:translate-y-0 active:scale-[0.99] disabled:opacity-60',
            'motion-reduce:transition-none motion-reduce:hover:translate-y-0'
          )}
        >
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          {sending ? 'Enviando' : 'Enviar mi respuesta'}
        </button>
      </Reveal>

      {failed && (
        <p className="mt-3 text-center text-[13px] text-rose-600">
          No hemos podido guardarlo. Revisa la conexión y prueba otra vez.
        </p>
      )}
    </div>
  );
}
