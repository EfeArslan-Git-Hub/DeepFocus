/**
 * StreakCount value object unit testleri.
 *
 * @group domain/value-objects
 */

import { describe, it, expect } from 'vitest'
import {
  createStreakCount,
  incrementStreak,
  resetStreak,
} from '@/domain/value-objects/streak-count.value-object'

describe('createStreakCount', () => {
  it('geçerli değerler için StreakCount oluşturur', () => {
    const streak = createStreakCount(7, true)

    expect(streak.value).toBe(7)
    expect(streak.isActive).toBe(true)
  })

  it('0 değeri için çalışır', () => {
    const streak = createStreakCount(0, false)

    expect(streak.value).toBe(0)
    expect(streak.isActive).toBe(false)
  })

  it('negatif değer için RangeError fırlatır', () => {
    expect(() => createStreakCount(-1, false)).toThrow(RangeError)
  })

  it('ondalıklı değer için RangeError fırlatır', () => {
    expect(() => createStreakCount(1.5, true)).toThrow(RangeError)
  })
})

describe('incrementStreak', () => {
  it('streak değerini 1 artırır ve isActive true yapar', () => {
    const streak = createStreakCount(5, false)
    const incremented = incrementStreak(streak)

    expect(incremented.value).toBe(6)
    expect(incremented.isActive).toBe(true)
  })

  it('0\'dan başlayan streak\'i 1\'e yükseltir', () => {
    const streak = createStreakCount(0, false)
    const incremented = incrementStreak(streak)

    expect(incremented.value).toBe(1)
  })
})

describe('resetStreak', () => {
  it('streak\'i 0\'a sıfırlar ve isActive false yapar', () => {
    const reset = resetStreak()

    expect(reset.value).toBe(0)
    expect(reset.isActive).toBe(false)
  })
})
