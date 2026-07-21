/**
 * Mock yardımcıları — TimerEntity test factory'si.
 *
 * @packageDocumentation
 */

import type { TimerEntity, TimerMode, TimerStatus } from '@/domain/entities/timer.entity'
import { TIMER_DEFAULTS } from '@/shared/constants/timer.constants'

/**
 * Test için geçerli bir TimerEntity oluşturur.
 * Varsayılan değerleri override edebilirsiniz.
 *
 * @param overrides - Üzerine yazılacak alanlar
 */
export function createTestTimer(overrides: Partial<TimerEntity> = {}): TimerEntity {
  return {
    id: 'test-timer-id',
    mode: 'focus' as TimerMode,
    remainingSeconds: 1500,
    totalSeconds: 1500,
    status: 'running' as TimerStatus,
    completedPomodoros: 0,
    config: TIMER_DEFAULTS,
    createdAt: new Date('2026-07-21T10:00:00Z'),
    updatedAt: new Date('2026-07-21T10:00:00Z'),
    ...overrides,
  }
}

/**
 * Tamamlanmış bir timer oluşturur (remainingSeconds = 0).
 *
 * @param mode - Timer modu
 * @param overrides - Üzerine yazılacak alanlar
 */
export function createCompletedTimer(
  mode: TimerMode = 'focus',
  overrides: Partial<TimerEntity> = {},
): TimerEntity {
  const totalSeconds = mode === 'focus' ? 1500 : mode === 'short-break' ? 300 : 900
  return createTestTimer({
    mode,
    totalSeconds,
    remainingSeconds: 0,
    status: 'completed',
    ...overrides,
  })
}
