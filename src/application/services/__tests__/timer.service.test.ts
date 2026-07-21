/**
 * TimerService Testleri
 *
 * createTimerService facade'ının tüm metodlarını doğrular.
 * Use-case'lerin doğru sırayla çağrıldığını ve broadcast'in
 * gerçekleştiğini kontrol eder.
 *
 * @group application/services
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTimerService } from '@/application/services/timer.service'
import { createMockTimerRepository } from '@/test/mocks/timer-repository.mock'
import { createMockSessionRepository } from '@/test/mocks/session-repository.mock'
import { createMockStatsRepository, createTestStats } from '@/test/mocks/stats-repository.mock'
import { createTestTimer, createCompletedTimer } from '@/test/mocks/timer.factory'
import { getTodayDateString } from '@/shared/utils/date.utils'

vi.stubGlobal('crypto', { randomUUID: () => 'mock-uuid' })

/** BroadcastChannel mock — mesaj yayının test için yakalanması */
const mockPostMessage = vi.fn()
const mockClose = vi.fn()

class MockBroadcastChannel {
  postMessage = mockPostMessage
  close = mockClose
  addEventListener = vi.fn()
}

describe('createTimerService', () => {
  let timerRepo: ReturnType<typeof createMockTimerRepository>
  let sessionRepo: ReturnType<typeof createMockSessionRepository>
  let statsRepo: ReturnType<typeof createMockStatsRepository>

  beforeEach(() => {
    timerRepo = createMockTimerRepository()
    sessionRepo = createMockSessionRepository()
    statsRepo = createMockStatsRepository()
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel)
    mockPostMessage.mockClear()
    mockClose.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // ─── start() ─────────────────────────────────────────────────────────────

  describe('start()', () => {
    it('focus modunda timer entity döndürür', async () => {
      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })

      const timer = await service.start('focus')

      expect(timer.mode).toBe('focus')
      expect(timer.status).toBe('running')
    })

    it('short-break modunda timer entity döndürür', async () => {
      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })

      const timer = await service.start('short-break')

      expect(timer.mode).toBe('short-break')
    })

    it('TIMER_START mesajını broadcast eder', async () => {
      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })

      await service.start('focus')

      expect(mockPostMessage).toHaveBeenCalledOnce()
      const msg = mockPostMessage.mock.calls[0]?.[0] as { type: string }
      expect(msg.type).toBe('TIMER_START')
    })

    it("timer'ı repository'e kaydeder", async () => {
      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })

      await service.start('focus')

      const saved = await timerRepo.load()
      expect(saved).not.toBeNull()
    })
  })

  // ─── syncState() ──────────────────────────────────────────────────────────

  describe('syncState()', () => {
    it("güncellenmiş timer'ı repository'e kaydeder", async () => {
      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })
      const timer = createTestTimer({ remainingSeconds: 1200 })

      await service.syncState(timer)

      const saved = await timerRepo.load()
      expect(saved?.remainingSeconds).toBe(1200)
    })

    it('TIMER_STATE_UPDATE mesajını broadcast eder', async () => {
      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })
      const timer = createTestTimer()

      await service.syncState(timer)

      expect(mockPostMessage).toHaveBeenCalledOnce()
      const msg = mockPostMessage.mock.calls[0]?.[0] as { type: string }
      expect(msg.type).toBe('TIMER_STATE_UPDATE')
    })
  })

  // ─── complete() ───────────────────────────────────────────────────────────

  describe('complete()', () => {
    it('tamamlanan oturumu session repository\'e kaydeder', async () => {
      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })
      const timer = createCompletedTimer('focus')

      await service.complete(timer, true)

      const sessions = await sessionRepo.findAll()
      expect(sessions).toHaveLength(1)
    })

    it('TIMER_COMPLETE mesajını broadcast eder', async () => {
      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })
      const timer = createCompletedTimer()

      await service.complete(timer, true)

      const allTypes = mockPostMessage.mock.calls.map(
        (c) => (c[0] as { type: string }).type,
      )
      expect(allTypes).toContain('TIMER_COMPLETE')
    })

    it('session ve stats sonuçlarını döndürür', async () => {
      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })
      const timer = createCompletedTimer('focus')

      const result = await service.complete(timer, true)

      expect(result.session).toBeDefined()
      expect(result.stats).toBeDefined()
    })

    it('wasCompleted: false ile yarıda kesilen oturumu kaydeder', async () => {
      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })
      const timer = createTestTimer({ remainingSeconds: 500 })

      const result = await service.complete(timer, false)

      expect(result.session.wasCompleted).toBe(false)
    })

    it('taskId ile oturumu kaydeder', async () => {
      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })
      const timer = createCompletedTimer()

      const result = await service.complete(timer, true, 'task-xyz')

      expect(result.session.taskId).toBe('task-xyz')
    })
  })

  // ─── updateStreak() ───────────────────────────────────────────────────────

  describe('updateStreak()', () => {
    it('ilk kullanımda streak 1 döndürür', async () => {
      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })

      const result = await service.updateStreak()

      expect(result.stats.currentStreak).toBe(1)
      expect(result.streakIncremented).toBe(true)
    })

    it('dün aktif → streak artırır', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10)
      statsRepo._store.stats = createTestStats(yesterdayStr, 7)

      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })

      const result = await service.updateStreak()

      expect(result.stats.currentStreak).toBe(8)
    })

    it('bugün zaten aktif → streak değişmez', async () => {
      const today = getTodayDateString()
      statsRepo._store.stats = createTestStats(today, 5)

      const service = createTimerService({ timerRepo, sessionRepo, statsRepo })

      const result = await service.updateStreak()

      expect(result.stats.currentStreak).toBe(5)
      expect(result.streakIncremented).toBe(false)
    })
  })
})
