/**
 * UpdateStreak Use-Case — Günlük streak'i günceller.
 *
 * Her gün ilk oturum tamamlandığında çağrılır.
 * Dün kullanım varsa streak devam eder, yoksa sıfırlanır.
 *
 * @packageDocumentation
 */

import type { IStatsRepository } from '../../domain/repositories/stats.repository'
import type { UserStatsEntity } from '../../domain/entities/user-stats.entity'
import { getTodayDateString, getYesterdayDateString } from '../../shared/utils/date.utils'

/** UpdateStreak use-case'inin çıktısı */
export interface UpdateStreakOutput {
  /** Güncellenmiş istatistikler */
  readonly stats: UserStatsEntity
  /** Streak artırıldı mı? */
  readonly streakIncremented: boolean
}

/**
 * Kullanıcının streak'ini günceleyen use-case.
 *
 * @param statsRepo - Stats repository
 * @returns Güncellenmiş istatistikler ve streak durumu
 */
export async function updateStreak(statsRepo: IStatsRepository): Promise<UpdateStreakOutput> {
  const currentStats = await statsRepo.load()
  const today = getTodayDateString()
  const yesterday = getYesterdayDateString()

  // İlk kullanım — yeni stats oluştur
  if (!currentStats) {
    const newStats: UserStatsEntity = {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      totalFocusMinutes: 0,
      totalCompletedSessions: 0,
      totalCompletedTasks: 0,
      dailyStats: [],
    }
    await statsRepo.save(newStats)
    return { stats: newStats, streakIncremented: true }
  }

  // Bugün zaten güncellendi
  if (currentStats.lastActiveDate === today) {
    return { stats: currentStats, streakIncremented: false }
  }

  // Dün aktifti — streak devam eder
  const streakIncremented = currentStats.lastActiveDate === yesterday
  const newStreak = streakIncremented ? currentStats.currentStreak + 1 : 1
  const newLongestStreak = Math.max(newStreak, currentStats.longestStreak)

  const updatedStats: UserStatsEntity = {
    ...currentStats,
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastActiveDate: today,
  }

  await statsRepo.save(updatedStats)
  return { stats: updatedStats, streakIncremented }
}
