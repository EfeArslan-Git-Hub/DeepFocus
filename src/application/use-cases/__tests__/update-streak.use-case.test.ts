/**
 * UpdateStreak Use-Case Testleri
 *
 * Streak mantığının tüm dallarını doğrular:
 * - İlk kullanım (stats yok)
 * - Aynı gün tekrar çağrı (streak değişmemeli)
 * - Dün aktif → streak devam eder
 * - Dünden öncesi aktif → streak sıfırlanır
 * - Longest streak güncellenmesi
 *
 * @group application/use-cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { updateStreak } from '@/application/use-cases/update-streak.use-case'
import { createMockStatsRepository, createTestStats } from '@/test/mocks/stats-repository.mock'
import { getTodayDateString, getYesterdayDateString } from '@/shared/utils/date.utils'

describe('updateStreak', () => {
  let statsRepo: ReturnType<typeof createMockStatsRepository>

  beforeEach(() => {
    statsRepo = createMockStatsRepository()
  })

  // ─── İLK KULLANIM ────────────────────────────────────────────────────────

  it('hiç stats yokken streak = 1 ile başlar', async () => {
    // Arrange: statsRepo boş (null döner)

    // Act
    const { stats, streakIncremented } = await updateStreak(statsRepo)

    // Assert
    expect(stats.currentStreak).toBe(1)
    expect(stats.longestStreak).toBe(1)
    expect(streakIncremented).toBe(true)
  })

  it('hiç stats yokken lastActiveDate bugüne ayarlanır', async () => {
    const today = getTodayDateString()

    const { stats } = await updateStreak(statsRepo)

    expect(stats.lastActiveDate).toBe(today)
  })

  it("hiç stats yokken istatistikler sıfırdan oluşturulur", async () => {
    const { stats } = await updateStreak(statsRepo)

    expect(stats.totalFocusMinutes).toBe(0)
    expect(stats.totalCompletedSessions).toBe(0)
    expect(stats.totalCompletedTasks).toBe(0)
  })

  it("hiç stats yokken yeni stats repository'e kaydedilir", async () => {
    await updateStreak(statsRepo)

    const saved = await statsRepo.load()
    expect(saved).not.toBeNull()
    expect(saved?.currentStreak).toBe(1)
  })

  // ─── AYNI GÜN TEKRAR ÇAĞRI ──────────────────────────────────────────────

  it('lastActiveDate bugünse streak değişmez', async () => {
    const today = getTodayDateString()
    statsRepo._store.stats = createTestStats(today, 5)

    const { stats, streakIncremented } = await updateStreak(statsRepo)

    expect(stats.currentStreak).toBe(5) // değişmemeli
    expect(streakIncremented).toBe(false)
  })

  it('lastActiveDate bugünse repo güncellenmez', async () => {
    const today = getTodayDateString()
    statsRepo._store.stats = createTestStats(today, 5)
    const saveSpy = vi.fn()
    statsRepo.save = saveSpy

    await updateStreak(statsRepo)

    expect(saveSpy).not.toHaveBeenCalled()
  })

  // ─── STREAK DEVAM ETTİRME ────────────────────────────────────────────────

  it('dün aktif olunduğunda streak 1 artırılır', async () => {
    const yesterday = getYesterdayDateString()
    statsRepo._store.stats = createTestStats(yesterday, 4)

    const { stats, streakIncremented } = await updateStreak(statsRepo)

    expect(stats.currentStreak).toBe(5)
    expect(streakIncremented).toBe(true)
  })

  it('dün aktif → lastActiveDate bugüne güncellenir', async () => {
    const today = getTodayDateString()
    const yesterday = getYesterdayDateString()
    statsRepo._store.stats = createTestStats(yesterday, 3)

    const { stats } = await updateStreak(statsRepo)

    expect(stats.lastActiveDate).toBe(today)
  })

  it('dün aktif → yeni stats repository\'e kaydedilir', async () => {
    const yesterday = getYesterdayDateString()
    statsRepo._store.stats = createTestStats(yesterday, 2)

    await updateStreak(statsRepo)

    const saved = await statsRepo.load()
    expect(saved?.currentStreak).toBe(3)
  })

  // ─── STREAK SIFIRLANMASI ─────────────────────────────────────────────────

  it('2 gün önce aktif olunduğunda streak sıfırlanır (= 1)', async () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10)

    statsRepo._store.stats = createTestStats(twoDaysAgoStr, 10)

    const { stats, streakIncremented } = await updateStreak(statsRepo)

    expect(stats.currentStreak).toBe(1)
    expect(streakIncremented).toBe(false)
  })

  it('1 hafta önce aktif olunduğunda streak sıfırlanır (= 1)', async () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().slice(0, 10)

    statsRepo._store.stats = createTestStats(weekAgoStr, 30)

    const { stats } = await updateStreak(statsRepo)

    expect(stats.currentStreak).toBe(1)
  })

  it('streak sıfırlandığında longestStreak korunur', async () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10)

    statsRepo._store.stats = createTestStats(twoDaysAgoStr, 10) // longestStreak = 10 gibi
    const longestBefore = statsRepo._store.stats.longestStreak

    const { stats } = await updateStreak(statsRepo)

    expect(stats.longestStreak).toBe(longestBefore) // korunmalı
    expect(stats.currentStreak).toBe(1) // sıfırlandı
  })

  // ─── LONGEST STREAK GÜNCELLEMESİ ────────────────────────────────────────

  it('yeni streak eskisinden büyükse longestStreak güncellenir', async () => {
    const yesterday = getYesterdayDateString()
    // currentStreak = 5, longestStreak = 5 — 1 artınca 6 olur ve longest güncellenmeli
    statsRepo._store.stats = {
      ...createTestStats(yesterday, 5),
      longestStreak: 5,
    }

    const { stats } = await updateStreak(statsRepo)

    expect(stats.currentStreak).toBe(6)
    expect(stats.longestStreak).toBe(6)
  })

  it('yeni streak eskisinden küçükse longestStreak değişmez', async () => {
    const yesterday = getYesterdayDateString()
    // currentStreak = 3, longestStreak = 10 → artınca 4 olur ama longest 10 kalmalı
    statsRepo._store.stats = {
      ...createTestStats(yesterday, 3),
      longestStreak: 10,
    }

    const { stats } = await updateStreak(statsRepo)

    expect(stats.currentStreak).toBe(4)
    expect(stats.longestStreak).toBe(10) // değişmemeli
  })

  // ─── MEVCUT İSTATİSTİKLERİN KORUNMASI ───────────────────────────────────

  it('streak güncellenirken diğer istatistikler korunur', async () => {
    const yesterday = getYesterdayDateString()
    const stats = createTestStats(yesterday, 3)
    statsRepo._store.stats = stats

    const { stats: updatedStats } = await updateStreak(statsRepo)

    expect(updatedStats.totalFocusMinutes).toBe(stats.totalFocusMinutes)
    expect(updatedStats.totalCompletedSessions).toBe(stats.totalCompletedSessions)
    expect(updatedStats.totalCompletedTasks).toBe(stats.totalCompletedTasks)
    expect(updatedStats.dailyStats).toEqual(stats.dailyStats)
  })

  // ─── HATA SENARYOLARI ────────────────────────────────────────────────────

  it('stats kayıt hatası fırlatırsa üst katmana iletilir', async () => {
    const failingRepo = createMockStatsRepository(null, {
      save: vi.fn().mockRejectedValue(new Error('Stats save failed')),
    })

    await expect(updateStreak(failingRepo)).rejects.toThrow('Stats save failed')
  })
})
