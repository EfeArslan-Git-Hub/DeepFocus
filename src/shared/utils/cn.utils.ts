/**
 * CSS class birleştirme yardımcısı.
 *
 * clsx ve tailwind-merge'ü kombine eder, Tailwind class çakışmalarını çözer.
 *
 * @packageDocumentation
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * CSS class isimlerini akıllıca birleştirir.
 * Tailwind class çakışmalarını otomatik çözer.
 *
 * @param inputs - CSS class değerleri (string, nesne, dizi)
 * @returns Birleştirilmiş CSS class string'i
 *
 * @example
 * ```ts
 * cn('px-4 py-2', isActive && 'bg-accent', 'px-6') // 'py-2 bg-accent px-6'
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
