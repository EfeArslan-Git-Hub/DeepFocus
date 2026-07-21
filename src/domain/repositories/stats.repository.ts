/**
 * IStatsRepository — Kullanıcı istatistikleri veri erişim sözleşmesi.
 *
 * @packageDocumentation
 */

import type { UserStatsEntity } from '../entities/user-stats.entity'

/**
 * Stats repository interface'i.
 * Infrastructure katmanında implementasyonu yapılır.
 */
export interface IStatsRepository {
  /**
   * Kullanıcı istatistiklerini getirir.
   * @returns İstatistik entity'si veya null (ilk kullanımda)
   */
  load(): Promise<UserStatsEntity | null>

  /**
   * Kullanıcı istatistiklerini kaydeder.
   * @param stats - Güncellenmiş istatistik entity'si
   */
  save(stats: UserStatsEntity): Promise<void>

  /**
   * İstatistikleri sıfırlar.
   */
  clear(): Promise<void>
}
