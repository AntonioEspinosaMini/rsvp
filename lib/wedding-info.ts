// Información práctica que ven los invitados en `/rsvp`: el timing del día,
// los hoteles con descuento y dónde arreglarse en El Puerto.
//
// Es un archivo estático a propósito. La página de RSVP no puede leer el bin
// de JSONBin (ver la cabecera de `app/rsvp/page.tsx`), y meter esto en
// Firestore obligaría a abrir una colección pública nueva y a montarle
// pantallas de edición en la app privada — mucho andamio para cuatro listas
// que se tocan tres veces en toda la boda. Se edita aquí y se despliega.
//
// PARA EDITAR: cambia los datos de abajo. Un array vacío (`[]`) esconde su
// sección entera en la página, así que no hay que dejar huecos raros mientras
// no estén cerrados los sitios.

/** La cabecera y el pie de la página pública. */
export const WEDDING = {
  /** Los dos nombres, tal cual se leen arriba del todo. */
  couple: 'Antonio & Carmen',
  /** Fecha larga, para el pie: "27 de junio de 2027". */
  date_long: 'EJEMPLO — sustituir por la fecha',
  /** Fecha corta y numérica, para la esquina: "27.06.27". */
  date_short: '00.00.00',
  /** Dónde es la boda, en una línea. */
  place: 'El Puerto de Santa María',
};

/** Un sitio recomendado: hotel, peluquería o barbería. */
export interface InfoPlace {
  name: string;
  /** Una línea de contexto: dónde está, cómo es, a cuánto queda de la finca. */
  note?: string;
  /** Lo que hemos pactado para los invitados: descuento, tarifa, hueco reservado. */
  perk?: string;
  phone?: string;
  /** Se enseña como enlace a Google Maps con este texto como búsqueda. */
  address?: string;
  /** Con o sin `https://`, da igual: el componente lo normaliza. */
  web?: string;
}

/** Un momento del día de la boda. */
export interface TimelineStop {
  /** Hora tal cual se enseña: "17:30". */
  time: string;
  title: string;
  /** Dónde pasa, si no es en el mismo sitio que lo anterior. */
  place?: string;
  /** Detalle corto para el invitado: qué hacer, qué esperar. */
  detail?: string;
}

/** El día de la boda, de principio a fin. Vacío = no se enseña la sección. */
export const TIMELINE: TimelineStop[] = [
  { time: '12:00', title: 'EJEMPLO — sustituir', place: 'Lugar', detail: 'Qué pasa aquí.' },
];

/** Hoteles con los que hemos hablado. `perk` es el descuento para invitados. */
export const HOTELS: InfoPlace[] = [
  {
    name: 'EJEMPLO — sustituir',
    note: 'A X minutos de la finca.',
    perk: 'Descuento pendiente de cerrar — di que vienes a nuestra boda.',
  },
];

/** Peluquerías de El Puerto para el día de la boda. */
export const HAIR_SALONS: InfoPlace[] = [
  { name: 'EJEMPLO — sustituir', note: 'El Puerto de Santa María.' },
];

/** Barberías de El Puerto. */
export const BARBERS: InfoPlace[] = [
  { name: 'EJEMPLO — sustituir', note: 'El Puerto de Santa María.' },
];
