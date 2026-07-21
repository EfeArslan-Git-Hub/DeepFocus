/**
 * Duration value object unit testleri.
 *
 * @group domain/value-objects
 */

import { describe, it, expect } from 'vitest'
import {
  createDuration,
  formatSeconds,
} from '@/domain/value-objects/duration.value-object'

describe('createDuration', () => {
  it('geçerli bir süre için Duration nesnesi oluşturur', () => {
    const duration = createDuration(25)

    expect(duration.minutes).toBe(25)
    expect(duration.seconds).toBe(1500)
  })

  it('minimum süre (1 dakika) için çalışır', () => {
    const duration = createDuration(1)

    expect(duration.minutes).toBe(1)
    expect(duration.seconds).toBe(60)
  })

  it('maksimum süre (120 dakika) için çalışır', () => {
    const duration = createDuration(120)

    expect(duration.minutes).toBe(120)
    expect(duration.seconds).toBe(7200)
  })

  it('0 dakika için RangeError fırlatır', () => {
    expect(() => createDuration(0)).toThrow(RangeError)
  })

  it('negatif değer için RangeError fırlatır', () => {
    expect(() => createDuration(-5)).toThrow(RangeError)
  })

  it('121 dakika (maksimum aşımı) için RangeError fırlatır', () => {
    expect(() => createDuration(121)).toThrow(RangeError)
  })

  it('ondalıklı değer için RangeError fırlatmaz (geçerli aralıktaysa)', () => {
    // 25.5 dakika geçerli — iş kuralı sadece min/max kontrolü yapıyor
    const duration = createDuration(25.5)
    expect(duration.minutes).toBe(25.5)
  })

  it('NaN için RangeError fırlatır', () => {
    expect(() => createDuration(NaN)).toThrow(RangeError)
  })

  it('Infinity için RangeError fırlatır', () => {
    expect(() => createDuration(Infinity)).toThrow(RangeError)
  })
})

describe('formatSeconds', () => {
  it('1500 saniyeyi "25:00" olarak formatlar', () => {
    expect(formatSeconds(1500)).toBe('25:00')
  })

  it('0 saniyeyi "00:00" olarak formatlar', () => {
    expect(formatSeconds(0)).toBe('00:00')
  })

  it('90 saniyeyi "01:30" olarak formatlar', () => {
    expect(formatSeconds(90)).toBe('01:30')
  })

  it('59 saniyeyi "00:59" olarak formatlar', () => {
    expect(formatSeconds(59)).toBe('00:59')
  })

  it('60 saniyeyi "01:00" olarak formatlar', () => {
    expect(formatSeconds(60)).toBe('01:00')
  })

  it('7200 saniyeyi "120:00" olarak formatlar', () => {
    expect(formatSeconds(7200)).toBe('120:00')
  })
})
