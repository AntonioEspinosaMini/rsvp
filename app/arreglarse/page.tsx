'use client';

// Dónde arreglarse: peluquerías y barberías, en una página con dos secciones
// para no gastar dos huecos del menú. Los datos, en `lib/wedding-info.ts`.

import { BARBERS, HAIR_SALONS, WEDDING } from '@/lib/wedding-info';
import { Places } from '@/components/places';
import { Container, Empty, Page, Section } from '@/components/shell';

export default function Arreglarse() {
  const sections = [
    {
      id: 'peluquerias',
      label: 'Peluquerías',
      lead: `Las que nos gustan en ${WEDDING.place}. Pide cita con tiempo: ese fin de semana se llenan.`,
      places: HAIR_SALONS,
    },
    { id: 'barberias', label: 'Barberías', lead: 'Para el arreglo de última hora.', places: BARBERS },
  ].filter((s) => s.places.length > 0);

  return (
    <Page
      label="Dónde arreglarse"
      title={
        <>
          Para ir <em className="text-teja">guapísimos</em>.
        </>
      }
      lead="Peluquerías y barberías cerca de la boda, con el teléfono a mano."
      full
    >
      {sections.length === 0 ? (
        <Container className="pb-8">
          <Empty>Aún estamos eligiendo sitios. En cuanto los tengamos, aparecerán aquí.</Empty>
        </Container>
      ) : (
        <>
          {sections.map((s, i) => (
            <Section
              key={s.id}
              id={s.id}
              index={String(i + 1).padStart(2, '0')}
              label={s.label}
              title={<>{s.label}.</>}
              lead={s.lead}
            >
              <Places places={s.places} />
            </Section>
          ))}
        </>
      )}
    </Page>
  );
}
