'use client';

// Dónde dormir. Los datos, en `lib/wedding-info.ts` > HOTELS.

import { HOTELS } from '@/lib/wedding-info';
import { Places } from '@/components/places';
import { Empty, Page } from '@/components/shell';

export default function Dormir() {
  return (
    <Page
      label="Dónde dormir"
      title={
        <>
          Dónde <em className="text-teja">dormir</em>.
        </>
      }
      lead="Hemos hablado con estos hoteles. Al reservar, di que vienes a nuestra boda."
    >
      <div className="pb-8">
        {HOTELS.length > 0 ? (
          <Places places={HOTELS} />
        ) : (
          <Empty>Estamos hablando con varios hoteles. En cuanto cerremos algo, lo verás aquí.</Empty>
        )}
      </div>
    </Page>
  );
}
