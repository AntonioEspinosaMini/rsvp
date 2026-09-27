import type { ReactNode } from 'react';

// A diferencia del layout, el template se vuelve a montar en cada navegación:
// es el sitio para la entrada suave de cada página al pulsar el menú.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-in-up">{children}</div>;
}
