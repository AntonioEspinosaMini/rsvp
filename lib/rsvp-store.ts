// El buzón de RSVP en Firestore, visto desde el lado del invitado.
//
// ─── CONTRATO COMPARTIDO ────────────────────────────────────────────────────
// La forma de `rsvps/{token}` (RsvpAnswer + RsvpDoc, aquí abajo) es una
// interfaz entre DOS repositorios:
//
//   - este sitio (público, dominio propio): lee y escribe el documento.
//   - el gestor privado (repo `nalitos`, `lib/rsvp-store.ts`): lo crea con el
//     nombre del invitado, se lee las respuestas nuevas y las importa.
//
// Añadir, renombrar o quitar un campo obliga a tocar y desplegar los dos. Si
// cambias algo aquí, cópialo tal cual allí — y al revés.
// ────────────────────────────────────────────────────────────────────────────
//
// Este lado solo sabe hacer dos cosas —leer su propio documento y escribirlo—
// y no conoce nada más de la boda: ni JSONBin, ni el presupuesto, ni la lista
// de invitados. Esa ignorancia es el motivo de que este sitio exista aparte
// del gestor (ver README).
//
// El control de acceso vive en las reglas de seguridad de Firestore (README >
// "Firebase"), no en ocultar la config: en Firebase, al contrario que en la
// Access Key de JSONBin del gestor, `apiKey`/`projectId`/`appId` son públicos
// por diseño. Lo que protege a un invitado de otro es que `rsvp_token` es
// aleatorio e inadivinable y que las reglas prohíben listar la colección.

import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, type Firestore } from 'firebase/firestore';

/** Los tres estados del gestor. El invitado solo elige entre los dos últimos. */
export type GuestStatus = 'pendiente' | 'confirmado' | 'no_viene';

/** Lo que puede responder un invitado desde este sitio. */
export interface RsvpAnswer {
  /** Solo 'confirmado' o 'no_viene': el invitado no ve la opción 'pendiente'. */
  status: GuestStatus;
  allergies: string | null;
  transport: boolean;
  song_request: string | null;
  notes: string | null;
}

/** El documento tal cual vive en Firestore. */
export interface RsvpDoc extends RsvpAnswer {
  first_name: string;
  last_name: string;
  /** true recién respondido: el gestor lo importa y lo vuelve a poner en false. */
  pending: boolean;
  updated_at: string;
}

const CONFIG: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = Boolean(CONFIG.apiKey && CONFIG.projectId && CONFIG.appId);

let db: Firestore | null = null;

function firestore(): Firestore {
  if (!isConfigured) {
    throw new Error('Falta configurar Firebase. Revisa .env.local (ver README.md).');
  }
  if (!db) {
    // Guard por si este módulo se evalúa más de una vez (HMR en desarrollo).
    const app = getApps()[0] ?? initializeApp(CONFIG);
    db = getFirestore(app);
  }
  return db;
}

function rsvpRef(token: string) {
  return doc(firestore(), 'rsvps', token);
}

export const rsvpStore = {
  isConfigured,

  /** null si el token no existe: la página lo trata como enlace inválido. */
  async getRsvp(token: string): Promise<RsvpDoc | null> {
    const snap = await getDoc(rsvpRef(token));
    return snap.exists() ? (snap.data() as RsvpDoc) : null;
  },

  /**
   * Guarda la respuesta. `merge: true` para no tocar `first_name`/`last_name`,
   * que los pone el gestor y este sitio no debe sobrescribir nunca.
   *
   * `pending: true` es la señal que espera el gestor para importarla; al
   * terminar, es él quien la vuelve a poner en false.
   */
  async submitRsvp(token: string, answer: RsvpAnswer): Promise<void> {
    await setDoc(
      rsvpRef(token),
      { ...answer, pending: true, updated_at: new Date().toISOString() },
      { merge: true }
    );
  },
};
