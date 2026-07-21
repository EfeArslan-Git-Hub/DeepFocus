/**
 * Date utility unit testleri.
 *
 * @group shared/utils
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getTodayDateString,
  getYesterdayDateString,
  getLastNDaysStrings,
} from '@/shared/utils/date.utils'

describe('getTodayDateString', () => {
  it('"YYYY-MM-DD" formatında bugünün tarihini döndürür', () => {
    const result = getTodayDateString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('bugünün ISO tarihiyle eşleşir', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(getTodayDateString()).toBe(today)
  })
})

describe('getYesterdayDateString', () => {
  it('"YYYY-MM-DD" formatında dünün tarihini döndürür', () => {
    const result = getYesterdayDateString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('bugünden 1 gün önceki tarihi döndürür', () => {
    const today = new Date()
    today.setDate(today.getDate() - 1)
    const expected = today.toISOString().slice(0, 10)
    expect(getYesterdayDateString()).toBe(expected)
  })
})

describe('getLastNDaysStrings', () => {
  it('7 günlük dizi döndürür', () => {
    const days = getLastNDaysStrings(7)
    expect(days).toHaveLength(7)
  })

  it('son eleman bugünün tarihi', () => {
    const days = getLastNDaysStrings(7)
    const today = new Date().toISOString().slice(0, 10)
    expect(days.at(-1)).toBe(today)
  })

  it('tarihler sıralı (artan)', () => {
    const days = getLastNDaysStrings(5)
    for (let i = 1; i < days.length; i++) {
      expect(days[i]! > days[i - 1]!).toBe(true)
    }
  })

  it('1 günlük dizi sadece bugünü içerir', () => {
    const today = new Date().toISOString().slice(0, 10)
    const days = getLastNDaysStrings(1)
    expect(days).toHaveLength(1)
    expect(days[0]).toBe(today)
  })
})
