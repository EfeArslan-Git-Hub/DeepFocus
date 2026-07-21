/**
 * StartFocusSession Use-Case — Focus oturumunu başlatır.
 *
 * Bu use-case, timer'ı başlatmadan önce gerekli doğrulamaları yapar
 * ve timer entity'sini oluşturup repository'e kaydeder.
 *
 * @packageDocumentation
 */

import type { ITimerRepository } from '../../domain/repositories/timer.repository'
import type { TimerEntity, TimerConfig, TimerMode } from '../../domain/entities/timer.entity'
import { TIMER_DEFAULTS } from '../../shared/constants/timer.constants'

/** StartFocusSession use-case'inin girdi parametreleri */
export interface StartFocusSessionInput {
  /** Başlatılacak timer modu */
  readonly mode: TimerMode
  /** Özelleştirilmiş konfigürasyon (yoksa varsayılan kullanılır) */
  readonly config?: Partial<TimerConfig>
  /** Mevcut tamamlanan pomodoro sayısı (UI senkronizasyonu için) */
  readonly completedPomodoros?: number
}

/** StartFocusSession use-case'inin çıktısı */
export interface StartFocusSessionOutput {
  /** Oluşturulan timer entity'si */
  readonly timer: TimerEntity
}

/**
 * Focus oturumunu başlatan use-case.
 *
 * @param repository - Timer repository (dependency injection)
 * @param input - Oturum başlatma parametreleri
 * @returns Oluşturulan timer entity'si
 *
 * @example
 * ```ts
 * const output = await startFocusSession(timerRepo, { mode: 'focus' })
 * console.log(output.timer.remainingSeconds) // 1500
 * ```
 */
export async function startFocusSession(
  repository: ITimerRepository,
  input: StartFocusSessionInput,
): Promise<StartFocusSessionOutput> {
  const savedConfig = await repository.loadConfig()

  const config: TimerConfig = {
    focusDuration: savedConfig?.focusDuration ?? TIMER_DEFAULTS.focusDuration,
    shortBreakDuration: savedConfig?.shortBreakDuration ?? TIMER_DEFAULTS.shortBreakDuration,
    longBreakDuration: savedConfig?.longBreakDuration ?? TIMER_DEFAULTS.longBreakDuration,
    longBreakInterval: savedConfig?.longBreakInterval ?? TIMER_DEFAULTS.longBreakInterval,
    ...input.config,
  }

  const durationByMode: Record<TimerMode, number> = {
    focus: config.focusDuration.seconds,
    'short-break': config.shortBreakDuration.seconds,
    'long-break': config.longBreakDuration.seconds,
  }

  const totalSeconds = durationByMode[input.mode]

  const timer: TimerEntity = {
    id: crypto.randomUUID(),
    mode: input.mode,
    remainingSeconds: totalSeconds,
    totalSeconds,
    status: 'running',
    completedPomodoros: input.completedPomodoros ?? 0,
    config,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await repository.save(timer)

  return { timer }
}
