/**
 * UserStats Entity — Kullanıcı istatistikleri modeli.
 *
 * Streak, günlük/haftalık/aylık odaklanma süresi ve
 * tamamlanan oturum sayısını takip eder.
 * Framework bağımsız, saf TypeScript.
 *
 * @packageDocumentation
 */

/** Günlük istatistik özeti */
export interface DailyStats {
  /** İstatistik tarihi (YYYY-MM-DD) */
  readonly date: string
  /** Toplam odaklanma süresi (dakika) */
  readonly focusMinutes: number
  /** Tamamlanan oturum sayısı */
  readonly completedSessions: number
  /** Tamamlanan görev sayısı */
  readonly completedTasks: number
}

/** Kullanıcı istatistikleri Entity */
export interface UserStatsEntity {
  /** Güncel streak (kaç gündür kesintisiz kullanım) */
  readonly currentStreak: number
  /** En uzun streak */
  readonly longestStreak: number
  /** Son aktif tarih (YYYY-MM-DD) */
  readonly lastActiveDate: string
  /** Toplam odaklanma süresi (tüm zamanlar, dakika) */
  readonly totalFocusMinutes: number
  /** Toplam tamamlanan oturum sayısı */
  readonly totalCompletedSessions: number
  /** Toplam tamamlanan görev sayısı */
  readonly totalCompletedTasks: number
  /** Günlük istatistikler (son 30 gün) */
  readonly dailyStats: readonly DailyStats[]
}
