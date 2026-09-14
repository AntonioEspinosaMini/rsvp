import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Junta clases de Tailwind resolviendo las que se pisan entre sí. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
