/**
 * Tarih yardımcıları — Streak ve istatistik hesaplamalarında kullanılır.
 *
 * @packageDocumentation
 */

/**
 * Bugünün tarihini "YYYY-MM-DD" formatında döndürür.
 *
 * @returns Bugünün tarihi
 *
 * @example
 * ```ts
 * getTodayDateString() // "2026-07-21"
 * ```
 */
export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Dünün tarihini "YYYY-MM-DD" formatında döndürür.
 *
 * @returns Dünün tarihi
 *
 * @example
 * ```ts
 * getYesterdayDateString() // "2026-07-20"
 * ```
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().slice(0, 10)
}

/**
 * Verilen tarih aralığı için günlük tarih stringlerini üretir.
 *
 * @param days - Geriye gidilecek gün sayısı
 * @returns Tarih string dizisi (bugün dahil)
 */
export function getLastNDaysStrings(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return date.toISOString().slice(0, 10)
  })
}
