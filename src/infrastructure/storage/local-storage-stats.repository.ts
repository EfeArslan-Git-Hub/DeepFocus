/**
 * LocalStorage Stats Repository — IStatsRepository'nin localStorage implementasyonu.
 *
 * @packageDocumentation
 */

import type { IStatsRepository } from '../../domain/repositories/stats.repository'
import type { UserStatsEntity } from '../../domain/entities/user-stats.entity'
import { STORAGE_KEYS } from '../../shared/constants/timer.constants'

export class LocalStorageStatsRepository implements IStatsRepository {
  async load(): Promise<UserStatsEntity | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STATS)
      return raw ? (JSON.parse(raw) as UserStatsEntity) : null
    } catch {
      return null
    }
  }

  async save(stats: UserStatsEntity): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats))
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.STATS)
  }
}
