/**
 * Mock Stats Repository — Test amaçlı in-memory IStatsRepository implementasyonu.
 *
 * @packageDocumentation
 */

import type { IStatsRepository } from '@/domain/repositories/stats.repository'
import type { UserStatsEntity } from '@/domain/entities/user-stats.entity'

/**
 * Test'lerde dependency injection için kullanılan sahte stats repository.
 */
export function createMockStatsRepository(
  initialStats: UserStatsEntity | null = null,
  overrides: Partial<IStatsRepository> = {},
): IStatsRepository & { _store: { stats: UserStatsEntity | null } } {
  const store: { stats: UserStatsEntity | null } = { stats: initialStats }

  return {
    _store: store,

    async load(): Promise<UserStatsEntity | null> {
      return store.stats
    },

    async save(stats: UserStatsEntity): Promise<void> {
      store.stats = stats
    },

    async clear(): Promise<void> {
      store.stats = null
    },

    ...overrides,
  }
}

/**
 * Belirli bir tarihe sahip standart test istatistiği oluşturur.
 *
 * @param lastActiveDate - Son aktif tarih (YYYY-MM-DD)
 * @param currentStreak - Mevcut streak sayısı
 * @returns UserStatsEntity
 */
export function createTestStats(
  lastActiveDate: string,
  currentStreak: number = 3,
): UserStatsEntity {
  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, 5),
    lastActiveDate,
    totalFocusMinutes: 100,
    totalCompletedSessions: 10,
    totalCompletedTasks: 5,
    dailyStats: [],
  }
}
