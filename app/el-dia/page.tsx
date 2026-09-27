'use client';

// El día, hora a hora. Los datos, en `lib/wedding-info.ts` > TIMELINE.

import { TIMELINE } from '@/lib/wedding-info';
import { Empty, Page } from '@/components/shell';
import { Timeline } from '@/components/timeline';

export default function ElDia() {
  return (
    <Page
      label="El día"
      title={
        <>
          El día, <em className="text-teja">hora a hora</em>.
        </>
      }
      lead="Para que nadie llegue con prisa ni de más ni de menos."
    >
      <div className="max-w-3xl pb-8">
        {TIMELINE.length > 0 ? (
          <Timeline stops={TIMELINE} />
        ) : (
          <Empty>Aún estamos cerrando los horarios. En cuanto los tengamos, aparecerán aquí.</Empty>
        )}
      </div>
    </Page>
  );
}
