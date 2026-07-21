/**
 * ITimerRepository — Timer veri erişim sözleşmesi.
 *
 * localStorage veya başka bir depolama sistemi bu interface'i implement eder.
 * Domain katmanı sadece bu sözleşmeyi bilir, implementasyonu bilmez.
 *
 * @packageDocumentation
 */

import type { TimerEntity, TimerConfig } from '../entities/timer.entity'

/**
 * Timer repository interface'i.
 * Infrastructure katmanında implementasyonu yapılır.
 */
export interface ITimerRepository {
  /**
   * Mevcut timer durumunu kaydeder.
   * @param timer - Kaydedilecek timer entity'si
   */
  save(timer: TimerEntity): Promise<void>

  /**
   * Kayıtlı timer durumunu yükler.
   * @returns Timer entity'si veya null (kayıt yoksa)
   */
  load(): Promise<TimerEntity | null>

  /**
   * Timer konfigürasyonunu kaydeder.
   * @param config - Kullanıcının süre ayarları
   */
  saveConfig(config: TimerConfig): Promise<void>

  /**
   * Kayıtlı timer konfigürasyonunu yükler.
   * @returns Konfigürasyon veya null (kayıt yoksa)
   */
  loadConfig(): Promise<TimerConfig | null>

  /**
   * Timer verilerini siler.
   */
  clear(): Promise<void>
}
