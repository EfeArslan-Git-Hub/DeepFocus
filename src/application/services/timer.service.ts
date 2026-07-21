/**
 * TimerService — Timer ile ilgili tüm use-case'leri orkestre eden servis.
 *
 * Presentation katmanındaki hook'lar bu servisi çağırır.
 * İş mantığı içermez — sadece use-case'leri bağlar.
 *
 * @packageDocumentation
 */

import type { ITimerRepository } from '../../domain/repositories/timer.repository'
import type { ISessionRepository } from '../../domain/repositories/session.repository'
import type { IStatsRepository } from '../../domain/repositories/stats.repository'
import type { TimerMode, TimerEntity } from '../../domain/entities/timer.entity'
import { startFocusSession } from '../use-cases/start-focus-session.use-case'
import { completeSession } from '../use-cases/complete-session.use-case'
import { updateStreak } from '../use-cases/update-streak.use-case'
import { broadcastTimerState } from '../use-cases/sync-timer-across-windows.use-case'

/** TimerService bağımlılıkları */
export interface TimerServiceDeps {
  readonly timerRepo: ITimerRepository
  readonly sessionRepo: ISessionRepository
  readonly statsRepo: IStatsRepository
}

/**
 * Timer servisi — tüm timer işlemlerini yöneten facade.
 *
 * @param deps - Repository bağımlılıkları
 * @returns Timer servis metodları
 */
export function createTimerService(deps: TimerServiceDeps) {
  const { timerRepo, sessionRepo, statsRepo } = deps

  return {
    /**
     * Yeni bir focus/break oturumu başlatır.
     * @param mode - Timer modu
     * @param completedPomodoros - O anki tamamlanmış görev sayısı (UI Sync)
     * @returns Başlatılan timer entity'si
     */
    async start(mode: TimerMode, completedPomodoros?: number): Promise<TimerEntity> {
      const { timer } = await startFocusSession(timerRepo, { 
        mode, 
        ...(completedPomodoros !== undefined ? { completedPomodoros } : {})
      })
      broadcastTimerState({ type: 'TIMER_START', payload: timer, timestamp: Date.now() })
      return timer
    },

    /**
     * Timer durumunu senkronize eder (tick sonrası çağrılır).
     * @param timer - Güncellenmiş timer entity'si
     */
    async syncState(timer: TimerEntity): Promise<void> {
      await timerRepo.save(timer)
      broadcastTimerState({ type: 'TIMER_STATE_UPDATE', payload: timer, timestamp: Date.now() })
    },

    /**
     * Oturumu tamamlar.
     * @param timer - Tamamlanan timer
     * @param wasCompleted - Gerçekten tamamlandı mı?
     * @param taskId - Bağlı görev ID'si
     */
    async complete(timer: TimerEntity, wasCompleted: boolean, taskId?: string) {
      const result = await completeSession(timerRepo, sessionRepo, statsRepo, {
        timer,
        wasCompleted,
        ...(taskId !== undefined ? { taskId } : {}),
      })
      broadcastTimerState({ type: 'TIMER_COMPLETE', timestamp: Date.now() })
      return result
    },

    /**
     * Streak'i günceller (ilk focus oturumunda çağrılır).
     */
    async updateStreak() {
      return updateStreak(statsRepo)
    },
  }
}
