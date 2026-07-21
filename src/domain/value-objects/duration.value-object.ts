/**
 * Duration Value Object — Zaman süresi için değer nesnesi.
 *
 * Geçersiz süre değerlerinin sisteme girmesini engeller.
 * Dakika, saniye ve milisaniye çevirme yardımcıları içerir.
 *
 * @packageDocumentation
 */

/** Minimum süre (dakika) */
const MIN_DURATION_MINUTES = 1

/** Maksimum süre (dakika) */
const MAX_DURATION_MINUTES = 120

/** Süre değer nesnesi */
export interface Duration {
  /** Dakika cinsinden süre */
  readonly minutes: number
  /** Saniye cinsinden süre */
  readonly seconds: number
}

/**
 * Yeni bir Duration değer nesnesi oluşturur.
 * Geçersiz değerlerde hata fırlatır.
 *
 * @param minutes - Dakika cinsinden süre
 * @returns Doğrulanmış Duration nesnesi
 * @throws {RangeError} Süre geçerli aralıkta değilse
 *
 * @example
 * ```ts
 * const duration = createDuration(25) // { minutes: 25, seconds: 1500 }
 * ```
 */
export function createDuration(minutes: number): Duration {
  if (!Number.isFinite(minutes) || minutes < MIN_DURATION_MINUTES || minutes > MAX_DURATION_MINUTES) {
    throw new RangeError(
      `Duration must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES} minutes. Got: ${minutes}`,
    )
  }

  return {
    minutes,
    seconds: minutes * 60,
  }
}

/**
 * Verilen saniye değerini MM:SS biçimine çevirir.
 *
 * @param totalSeconds - Toplam saniye
 * @returns "MM:SS" biçimli string
 *
 * @example
 * ```ts
 * formatSeconds(1500) // "25:00"
 * formatSeconds(90)   // "01:30"
 * ```
 */
export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
