import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Junta clases de Tailwind resolviendo las que se pisan entre sí. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Número de invitación para enseñar en pantalla: "7K2F-9A". Es un hash
 * (FNV-1a) del token, no un trozo de él — una captura del billete compartida
 * en un grupo no revela nada del enlace.
 */
export function guestCode(token: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const s = (h >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(-6);
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}
