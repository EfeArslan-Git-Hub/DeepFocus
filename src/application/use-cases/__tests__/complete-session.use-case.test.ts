/**
 * CompleteSession Use-Case Testleri
 *
 * Oturumun tamamlanması, istatistik güncellemesi ve timer temizleme
 * senaryolarını doğrular.
 *
 * @group application/use-cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { completeSession } from '@/application/use-cases/complete-session.use-case'
import { createMockTimerRepository } from '@/test/mocks/timer-repository.mock'
import { createMockSessionRepository } from '@/test/mocks/session-repository.mock'
import { createMockStatsRepository, createTestStats } from '@/test/mocks/stats-repository.mock'
import { createTestTimer, createCompletedTimer } from '@/test/mocks/timer.factory'
import { getTodayDateString } from '@/shared/utils/date.utils'

vi.stubGlobal('crypto', {
  randomUUID: () => 'mock-session-uuid',
})

describe('completeSession', () => {
  let timerRepo: ReturnType<typeof createMockTimerRepository>
  let sessionRepo: ReturnType<typeof createMockSessionRepository>
  let statsRepo: ReturnType<typeof createMockStatsRepository>

  beforeEach(() => {
    timerRepo = createMockTimerRepository()
    sessionRepo = createMockSessionRepository()
    statsRepo = createMockStatsRepository()
  })

  // ─── OTURUM KAYDI ────────────────────────────────────────────────────────

  it('tamamlanan oturumu session repository\'e kaydeder', async () => {
    const timer = createCompletedTimer('focus')

    await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    const sessions = await sessionRepo.findAll()
    expect(sessions).toHaveLength(1)
    expect(sessions[0]?.mode).toBe('focus')
    expect(sessions[0]?.wasCompleted).toBe(true)
  })

  it('yarıda kesilen oturumu wasCompleted: false ile kaydeder', async () => {
    const timer = createTestTimer({ mode: 'focus', remainingSeconds: 500, totalSeconds: 1500 })

    await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: false,
    })

    const sessions = await sessionRepo.findAll()
    expect(sessions[0]?.wasCompleted).toBe(false)
  })

  it('oturum ID\'si benzersiz ve dolu olarak atanır', async () => {
    const timer = createCompletedTimer()

    const { session } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    expect(session.id).toBe('mock-session-uuid')
  })

  it('oturuma taskId bağlar', async () => {
    const timer = createCompletedTimer()

    const { session } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
      taskId: 'task-abc',
    })

    expect(session.taskId).toBe('task-abc')
  })

  it('taskId verilmezse session.taskId undefined olur', async () => {
    const timer = createCompletedTimer()

    const { session } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    expect(session.taskId).toBeUndefined()
  })

  it('oturum moduyla timer modunun eşleşmesini sağlar', async () => {
    const timer = createCompletedTimer('short-break')

    const { session } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    expect(session.mode).toBe('short-break')
  })

  // ─── SÜRE HESAPLAMASI ────────────────────────────────────────────────────

  it('yarıda tamamlanan focus için doğru durationMinutes hesaplar', async () => {
    // 25 dk timer'dan 10 dk harcandı (remainingSeconds = 900)
    const timer = createTestTimer({
      mode: 'focus',
      totalSeconds: 1500,
      remainingSeconds: 900,
    })

    const { session } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: false,
    })

    // 1500 - 900 = 600 saniye = 10 dakika
    expect(session.durationMinutes).toBe(10)
  })

  it('tam tamamlanan 25 dk focus için 25 dakika döndürür', async () => {
    const timer = createCompletedTimer('focus')

    const { session } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    expect(session.durationMinutes).toBe(25)
  })

  // ─── İSTATİSTİK GÜNCELLEMESİ ────────────────────────────────────────────

  it('hiç stats yokken ilk focus oturumunda stats sıfırdan oluşturur', async () => {
    const timer = createCompletedTimer('focus')

    const { stats } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    expect(stats.totalFocusMinutes).toBe(25)
    expect(stats.totalCompletedSessions).toBe(1)
  })

  it('mevcut stats varsa totalFocusMinutes üzerine ekler', async () => {
    statsRepo._store.stats = createTestStats(getTodayDateString())
    const initialMinutes = statsRepo._store.stats.totalFocusMinutes // 100
    const timer = createCompletedTimer('focus')

    const { stats } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    expect(stats.totalFocusMinutes).toBe(initialMinutes + 25)
  })

  it('mevcut stats varsa totalCompletedSessions üzerine ekler', async () => {
    statsRepo._store.stats = createTestStats(getTodayDateString())
    const initialSessions = statsRepo._store.stats.totalCompletedSessions // 10
    const timer = createCompletedTimer('focus')

    const { stats } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    expect(stats.totalCompletedSessions).toBe(initialSessions + 1)
  })

  it('short-break oturumunda focus minutes EKLENMEZ', async () => {
    statsRepo._store.stats = createTestStats(getTodayDateString())
    const initialMinutes = statsRepo._store.stats.totalFocusMinutes
    const timer = createCompletedTimer('short-break')

    const { stats } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    expect(stats.totalFocusMinutes).toBe(initialMinutes) // değişmemeli
  })

  it('long-break oturumunda focus minutes EKLENMEZ', async () => {
    statsRepo._store.stats = createTestStats(getTodayDateString())
    const initialMinutes = statsRepo._store.stats.totalFocusMinutes
    const timer = createCompletedTimer('long-break')

    const { stats } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    expect(stats.totalFocusMinutes).toBe(initialMinutes)
  })

  it('wasCompleted: false ise focus minutes EKLENMEZ', async () => {
    statsRepo._store.stats = createTestStats(getTodayDateString())
    const initialMinutes = statsRepo._store.stats.totalFocusMinutes
    const timer = createTestTimer({ mode: 'focus', remainingSeconds: 500, totalSeconds: 1500 })

    const { stats } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: false,
    })

    expect(stats.totalFocusMinutes).toBe(initialMinutes)
  })

  it('wasCompleted: false ise totalCompletedSessions ARTMAZ', async () => {
    statsRepo._store.stats = createTestStats(getTodayDateString())
    const initialSessions = statsRepo._store.stats.totalCompletedSessions
    const timer = createTestTimer({ mode: 'focus', remainingSeconds: 500 })

    const { stats } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: false,
    })

    expect(stats.totalCompletedSessions).toBe(initialSessions)
  })

  // ─── GÜNLÜK İSTATİSTİKLER ────────────────────────────────────────────────

  it('bugünkü günlük istatistikleri doğru günceller', async () => {
    const today = getTodayDateString()
    const timer = createCompletedTimer('focus')

    const { stats } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    const todayStats = stats.dailyStats.find((d) => d.date === today)
    expect(todayStats).toBeDefined()
    expect(todayStats?.focusMinutes).toBe(25)
    expect(todayStats?.completedSessions).toBe(1)
  })

  it('aynı günde ikinci oturum tamamlanınca günlük stats üzerine eklenir', async () => {
    const today = getTodayDateString()
    statsRepo._store.stats = {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      totalFocusMinutes: 25,
      totalCompletedSessions: 1,
      totalCompletedTasks: 0,
      dailyStats: [
        { date: today, focusMinutes: 25, completedSessions: 1, completedTasks: 0 },
      ],
    }

    const timer = createCompletedTimer('focus')
    const { stats } = await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    const todayStats = stats.dailyStats.find((d) => d.date === today)
    expect(todayStats?.focusMinutes).toBe(50)
    expect(todayStats?.completedSessions).toBe(2)
  })

  // ─── TİMER TEMİZLEME ─────────────────────────────────────────────────────

  it("tamamlama sonrasında timer repository'yi temizler", async () => {
    const timer = createCompletedTimer()
    timerRepo._store.timer = timer

    await completeSession(timerRepo, sessionRepo, statsRepo, {
      timer,
      wasCompleted: true,
    })

    const saved = await timerRepo.load()
    expect(saved).toBeNull()
  })

  // ─── HATA SENARYOLARI ────────────────────────────────────────────────────

  it('session kayıt hatası fırlatırsa üst katmana iletilir', async () => {
    const failingSessionRepo = createMockSessionRepository({
      save: vi.fn().mockRejectedValue(new Error('Session save failed')),
    })

    const timer = createCompletedTimer()

    await expect(
      completeSession(timerRepo, failingSessionRepo, statsRepo, {
        timer,
        wasCompleted: true,
      }),
    ).rejects.toThrow('Session save failed')
  })
})
