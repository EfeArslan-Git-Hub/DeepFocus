/**
 * Timer Entity — Pomodoro zamanlayıcısının iş modeli.
 *
 * Timer'ın durumu, modu ve yapılandırmasını tanımlar.
 * Framework bağımsız, saf TypeScript.
 *
 * @packageDocumentation
 */

import type { Duration } from '../value-objects/duration.value-object'

/** Zamanlayıcı modları */
export type TimerMode = 'focus' | 'short-break' | 'long-break'

/** Zamanlayıcı çalışma durumları */
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

/** Timer konfigürasyonu — kullanıcı tarafından özelleştirilebilir süreler */
export interface TimerConfig {
  /** Odaklanma süresi */
  readonly focusDuration: Duration
  /** Kısa mola süresi */
  readonly shortBreakDuration: Duration
  /** Uzun mola süresi */
  readonly longBreakDuration: Duration
  /** Kaç pomodoro'dan sonra uzun mola verileceği */
  readonly longBreakInterval: number
}

/** Timer Entity — mevcut oturum durumunu temsil eder */
export interface TimerEntity {
  /** Benzersiz oturum ID'si */
  readonly id: string
  /** Aktif zamanlayıcı modu */
  readonly mode: TimerMode
  /** Kalan süre (saniye cinsinden) */
  readonly remainingSeconds: number
  /** Toplam süre (saniye cinsinden) */
  readonly totalSeconds: number
  /** Çalışma durumu */
  readonly status: TimerStatus
  /** Tamamlanan pomodoro sayısı (bu oturumda) */
  readonly completedPomodoros: number
  /** Zamanlayıcı konfigürasyonu */
  readonly config: TimerConfig
  /** Oluşturulma zamanı */
  readonly createdAt: Date
  /** Son güncelleme zamanı */
  readonly updatedAt: Date
}
