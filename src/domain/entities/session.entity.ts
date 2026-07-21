/**
 * Session Entity — Tamamlanan focus oturumlarının kaydı.
 *
 * Her tamamlanan pomodoro oturumunu temsil eder.
 * Framework bağımsız, saf TypeScript.
 *
 * @packageDocumentation
 */

import type { TimerMode } from './timer.entity'

/** Oturum Entity */
export interface SessionEntity {
  /** Benzersiz oturum ID'si */
  readonly id: string
  /** Oturum modu */
  readonly mode: TimerMode
  /** Oturum süresi (dakika) */
  readonly durationMinutes: number
  /** Bağlı görev ID'si (varsa) */
  readonly taskId?: string
  /** Başlangıç zamanı */
  readonly startedAt: Date
  /** Bitiş zamanı */
  readonly completedAt: Date
  /** Oturum gerçekten tamamlandı mı yoksa kesildi mi? */
  readonly wasCompleted: boolean
}
