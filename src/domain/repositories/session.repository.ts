/**
 * ISessionRepository — Tamamlanan oturum kayıtları için veri erişim sözleşmesi.
 *
 * @packageDocumentation
 */

import type { SessionEntity } from '../entities/session.entity'

/**
 * Session repository interface'i.
 * Infrastructure katmanında implementasyonu yapılır.
 */
export interface ISessionRepository {
  /**
   * Tüm oturumları getirir.
   * @returns Oturum listesi
   */
  findAll(): Promise<SessionEntity[]>

  /**
   * Belirli bir tarih aralığındaki oturumları getirir.
   * @param startDate - Başlangıç tarihi
   * @param endDate - Bitiş tarihi
   * @returns Filtrelenmiş oturum listesi
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<SessionEntity[]>

  /**
   * Yeni oturum kaydeder.
   * @param session - Kaydedilecek oturum entity'si
   */
  save(session: SessionEntity): Promise<void>

  /**
   * Tüm oturumları siler.
   */
  clear(): Promise<void>
}
