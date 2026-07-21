/**
 * LocalStorage Timer Repository — ITimerRepository'nin localStorage implementasyonu.
 *
 * @packageDocumentation
 */

import type { ITimerRepository } from '../../domain/repositories/timer.repository'
import type { TimerEntity, TimerConfig } from '../../domain/entities/timer.entity'
import { STORAGE_KEYS } from '../../shared/constants/timer.constants'

/**
 * localStorage tabanlı Timer repository implementasyonu.
 * Tüm veriler tarayıcının origin-scoped localStorage'ında saklanır.
 */
export class LocalStorageTimerRepository implements ITimerRepository {
  async save(timer: TimerEntity): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(timer))
  }

  async load(): Promise<TimerEntity | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TIMER)
      if (!raw) return null
      const parsed = JSON.parse(raw) as TimerEntity
      // Tarihleri Date nesnesine çevir (JSON.parse string olarak yükler)
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
      }
    } catch {
      return null
    }
  }

  async saveConfig(config: TimerConfig): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.TIMER_CONFIG, JSON.stringify(config))
  }

  async loadConfig(): Promise<TimerConfig | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TIMER_CONFIG)
      return raw ? (JSON.parse(raw) as TimerConfig) : null
    } catch {
      return null
    }
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.TIMER)
  }
}
