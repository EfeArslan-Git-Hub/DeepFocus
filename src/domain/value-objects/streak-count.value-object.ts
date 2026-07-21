/**
 * StreakCount Value Object — Kesintisiz kullanım sayacı.
 *
 * Negatif streak değerlerini engeller.
 *
 * @packageDocumentation
 */

/** Streak değer nesnesi */
export interface StreakCount {
  /** Mevcut streak sayısı (gün) */
  readonly value: number
  /** Streak aktif mi? (bugün kullanım gerçekleşti mi) */
  readonly isActive: boolean
}

/**
 * Yeni bir StreakCount değer nesnesi oluşturur.
 *
 * @param value - Streak sayısı (0 veya pozitif tam sayı)
 * @param isActive - Streak bugün güncellendi mi
 * @returns Doğrulanmış StreakCount nesnesi
 * @throws {RangeError} Streak değeri negatifse
 *
 * @example
 * ```ts
 * const streak = createStreakCount(7, true) // { value: 7, isActive: true }
 * ```
 */
export function createStreakCount(value: number, isActive: boolean): StreakCount {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`Streak count must be a non-negative integer. Got: ${value}`)
  }

  return { value, isActive }
}

/**
 * Streak'i bir gün artırır.
 *
 * @param streak - Mevcut streak
 * @returns Artırılmış streak
 */
export function incrementStreak(streak: StreakCount): StreakCount {
  return createStreakCount(streak.value + 1, true)
}

/**
 * Streak'i sıfırlar (kesinti durumunda).
 *
 * @returns Sıfırlanmış streak
 */
export function resetStreak(): StreakCount {
  return createStreakCount(0, false)
}
