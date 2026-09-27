'use client';

// Confirmar: el formulario, en su propia página. Es lo único que de verdad
// necesitamos de cada invitado, así que ocupa el centro del menú.

import { useGuest } from '@/components/guest';
import { RsvpForm } from '@/components/form';
import { Page } from '@/components/shell';

export default function Confirmar() {
  const { token, firstName, answer, answered, saved } = useGuest();
  return (
    <Page
      label="Confirmación"
      title={
        <>
          ¿Nos <em className="text-teja">acompañas</em>?
        </>
      }
      lead="Puedes cambiar la respuesta cuando quieras: este enlace es tuyo y sigue funcionando."
    >
      <div className="max-w-3xl pb-8">
        <RsvpForm token={token} firstName={firstName} initial={answer} answered={answered} onSaved={saved} />
      </div>
    </Page>
  );
}
