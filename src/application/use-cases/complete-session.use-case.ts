/**
 * CompleteSession Use-Case — Oturumu tamamlar ve istatistikleri günceller.
 *
 * @packageDocumentation
 */

import type { ITimerRepository } from '../../domain/repositories/timer.repository'
import type { ISessionRepository } from '../../domain/repositories/session.repository'
import type { IStatsRepository } from '../../domain/repositories/stats.repository'
import type { TimerEntity } from '../../domain/entities/timer.entity'
import type { SessionEntity } from '../../domain/entities/session.entity'
import type { UserStatsEntity, DailyStats } from '../../domain/entities/user-stats.entity'
import { getTodayDateString } from '../../shared/utils/date.utils'

/** CompleteSession use-case'inin girdi parametreleri */
export interface CompleteSessionInput {
  /** Tamamlanan timer entity'si */
  readonly timer: TimerEntity
  /** Oturum gerçekten tamamlandı mı yoksa kesildi mi? */
  readonly wasCompleted: boolean
  /** Bağlı görev ID'si (varsa) */
  readonly taskId?: string
}

/** CompleteSession use-case'inin çıktısı */
export interface CompleteSessionOutput {
  /** Kaydedilen oturum entity'si */
  readonly session: SessionEntity
  /** Güncellenmiş kullanıcı istatistikleri */
  readonly stats: UserStatsEntity
}

/**
 * Oturumu tamamlayan ve istatistikleri güncelleyen use-case.
 *
 * @param timerRepo - Timer repository
 * @param sessionRepo - Session repository
 * @param statsRepo - Stats repository
 * @param input - Tamamlama parametreleri
 * @returns Kaydedilen oturum ve güncellenmiş istatistikler
 */
export async function completeSession(
  timerRepo: ITimerRepository,
  sessionRepo: ISessionRepository,
  statsRepo: IStatsRepository,
  input: CompleteSessionInput,
): Promise<CompleteSessionOutput> {
  const now = new Date()
  const durationMinutes = Math.round(
    (input.timer.totalSeconds - input.timer.remainingSeconds) / 60,
  )

  // Oturumu kaydet
  const session: SessionEntity = {
    id: crypto.randomUUID(),
    mode: input.timer.mode,
    durationMinutes,
    ...(input.taskId !== undefined ? { taskId: input.taskId } : {}),
    startedAt: input.timer.createdAt,
    completedAt: now,
    wasCompleted: input.wasCompleted,
  }

  await sessionRepo.save(session)

  // İstatistikleri güncelle (sadece tamamlanan focus oturumları için)
  const currentStats = await statsRepo.load()
  const today = getTodayDateString()

  const existingDailyStats = currentStats?.dailyStats ?? []
  const todayStats = existingDailyStats.find((d) => d.date === today)

  const focusMinutesToAdd = input.timer.mode === 'focus' && input.wasCompleted ? durationMinutes : 0
  const sessionsToAdd = input.wasCompleted ? 1 : 0

  const updatedDailyStats: DailyStats = {
    date: today,
    focusMinutes: (todayStats?.focusMinutes ?? 0) + focusMinutesToAdd,
    completedSessions: (todayStats?.completedSessions ?? 0) + sessionsToAdd,
    completedTasks: todayStats?.completedTasks ?? 0,
  }

  const dailyStats: readonly DailyStats[] = todayStats
    ? existingDailyStats.map((d) => (d.date === today ? updatedDailyStats : d))
    : [...existingDailyStats.slice(-29), updatedDailyStats] // Son 30 günü tut

  const stats: UserStatsEntity = {
    currentStreak: currentStats?.currentStreak ?? 0,
    longestStreak: currentStats?.longestStreak ?? 0,
    lastActiveDate: currentStats?.lastActiveDate ?? today,
    totalFocusMinutes: (currentStats?.totalFocusMinutes ?? 0) + focusMinutesToAdd,
    totalCompletedSessions: (currentStats?.totalCompletedSessions ?? 0) + sessionsToAdd,
    totalCompletedTasks: currentStats?.totalCompletedTasks ?? 0,
    dailyStats,
  }

  await statsRepo.save(stats)

  // Timer'ı temizle
  await timerRepo.clear()

  return { session, stats }
}
