/**
 * StartFocusSession Use-Case Testleri
 *
 * TDD yaklaşımı: use-case davranışını mock repository'ler ile doğrular.
 * Domain ve application katmanı framework bağımsız olduğu için
 * React/Next.js import edilmez.
 *
 * @group application/use-cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { startFocusSession } from '@/application/use-cases/start-focus-session.use-case'
import { createMockTimerRepository } from '@/test/mocks/timer-repository.mock'
import { createDuration } from '@/domain/value-objects/duration.value-object'
import { TIMER_DEFAULTS } from '@/shared/constants/timer.constants'
import type { TimerConfig } from '@/domain/entities/timer.entity'

// crypto.randomUUID sisteme yüklü olmayabilir — mock'la
vi.stubGlobal('crypto', {
  randomUUID: () => 'mock-uuid-1234',
})

describe('startFocusSession', () => {
  let timerRepo: ReturnType<typeof createMockTimerRepository>

  beforeEach(() => {
    timerRepo = createMockTimerRepository()
  })

  // ─── TEMEL DAVRANIŞLAR ────────────────────────────────────────────────────

  it('focus modunda timer entity oluşturur', async () => {
    const { timer } = await startFocusSession(timerRepo, { mode: 'focus' })

    expect(timer.mode).toBe('focus')
    expect(timer.status).toBe('running')
  })

  it('short-break modunda timer entity oluşturur', async () => {
    const { timer } = await startFocusSession(timerRepo, { mode: 'short-break' })

    expect(timer.mode).toBe('short-break')
    expect(timer.status).toBe('running')
  })

  it('long-break modunda timer entity oluşturur', async () => {
    const { timer } = await startFocusSession(timerRepo, { mode: 'long-break' })

    expect(timer.mode).toBe('long-break')
    expect(timer.status).toBe('running')
  })

  // ─── SÜRE HESAPLAMALARI ──────────────────────────────────────────────────

  it('focus modunda varsayılan süreyi (25 dk = 1500s) atar', async () => {
    const { timer } = await startFocusSession(timerRepo, { mode: 'focus' })

    expect(timer.totalSeconds).toBe(1500)
    expect(timer.remainingSeconds).toBe(1500)
  })

  it('short-break modunda varsayılan süreyi (5 dk = 300s) atar', async () => {
    const { timer } = await startFocusSession(timerRepo, { mode: 'short-break' })

    expect(timer.totalSeconds).toBe(300)
    expect(timer.remainingSeconds).toBe(300)
  })

  it('long-break modunda varsayılan süreyi (15 dk = 900s) atar', async () => {
    const { timer } = await startFocusSession(timerRepo, { mode: 'long-break' })

    expect(timer.totalSeconds).toBe(900)
    expect(timer.remainingSeconds).toBe(900)
  })

  // ─── KONFİGÜRASYON ──────────────────────────────────────────────────────

  it("kayıtlı config yoksa varsayılan TIMER_DEFAULTS'u kullanır", async () => {
    const { timer } = await startFocusSession(timerRepo, { mode: 'focus' })

    expect(timer.config.focusDuration).toEqual(TIMER_DEFAULTS.focusDuration)
    expect(timer.config.longBreakInterval).toBe(TIMER_DEFAULTS.longBreakInterval)
  })

  it("kayıtlı config varsa onu kullanır", async () => {
    const customConfig: TimerConfig = {
      focusDuration: createDuration(50),
      shortBreakDuration: createDuration(10),
      longBreakDuration: createDuration(30),
      longBreakInterval: 3,
    }
    timerRepo._store.config = customConfig

    const { timer } = await startFocusSession(timerRepo, { mode: 'focus' })

    expect(timer.totalSeconds).toBe(3000)  // 50 dk = 3000s
    expect(timer.config.focusDuration.minutes).toBe(50)
  })

  it('input config verilirse override eder', async () => {
    const customConfig: Partial<TimerConfig> = {
      focusDuration: createDuration(45),
    }

    const { timer } = await startFocusSession(timerRepo, {
      mode: 'focus',
      config: customConfig,
    })

    expect(timer.totalSeconds).toBe(2700)  // 45 dk = 2700s
  })

  // ─── ID VE META ─────────────────────────────────────────────────────────

  it('benzersiz bir ID atar', async () => {
    const { timer } = await startFocusSession(timerRepo, { mode: 'focus' })

    expect(timer.id).toBeTruthy()
    expect(typeof timer.id).toBe('string')
  })

  it('completedPomodoros sıfırdan başlar', async () => {
    const { timer } = await startFocusSession(timerRepo, { mode: 'focus' })

    expect(timer.completedPomodoros).toBe(0)
  })

  it('createdAt ve updatedAt tarihleri oluşturulur', async () => {
    const before = new Date()
    const { timer } = await startFocusSession(timerRepo, { mode: 'focus' })
    const after = new Date()

    expect(timer.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(timer.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    expect(timer.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })

  // ─── REPOSITORY ETKİLEŞİMİ ──────────────────────────────────────────────

  it("timer'ı repository'e kaydeder", async () => {
    const { timer } = await startFocusSession(timerRepo, { mode: 'focus' })

    const saved = await timerRepo.load()
    expect(saved).not.toBeNull()
    expect(saved?.id).toBe(timer.id)
    expect(saved?.mode).toBe('focus')
  })

  it("repository'den config yükler (loadConfig çağrılır)", async () => {
    const loadConfigSpy = vi.fn().mockResolvedValue(null)
    const repoWithSpy = createMockTimerRepository({ loadConfig: loadConfigSpy })

    await startFocusSession(repoWithSpy, { mode: 'focus' })

    expect(loadConfigSpy).toHaveBeenCalledOnce()
  })

  it("kayıt başarısız olursa hata fırlatır", async () => {
    const failingRepo = createMockTimerRepository({
      save: vi.fn().mockRejectedValue(new Error('Storage error')),
    })

    await expect(startFocusSession(failingRepo, { mode: 'focus' })).rejects.toThrow(
      'Storage error',
    )
  })
})
