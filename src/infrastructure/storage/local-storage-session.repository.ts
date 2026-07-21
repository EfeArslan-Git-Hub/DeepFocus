/**
 * LocalStorage Session Repository — ISessionRepository'nin localStorage implementasyonu.
 *
 * @packageDocumentation
 */

import type { ISessionRepository } from '../../domain/repositories/session.repository'
import type { SessionEntity } from '../../domain/entities/session.entity'
import { STORAGE_KEYS } from '../../shared/constants/timer.constants'

export class LocalStorageSessionRepository implements ISessionRepository {
  private loadAll(): SessionEntity[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS)
      if (!raw) return []
      return (JSON.parse(raw) as SessionEntity[]).map((s) => ({
        ...s,
        startedAt: new Date(s.startedAt),
        completedAt: new Date(s.completedAt),
      }))
    } catch {
      return []
    }
  }

  async findAll(): Promise<SessionEntity[]> {
    return this.loadAll()
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<SessionEntity[]> {
    return this.loadAll().filter(
      (s) => s.startedAt >= startDate && s.completedAt <= endDate,
    )
  }

  async save(session: SessionEntity): Promise<void> {
    const sessions = this.loadAll()
    sessions.push(session)
    // Maksimum 1000 oturum sakla (eski oturumları at)
    const trimmed = sessions.slice(-1000)
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(trimmed))
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS)
  }
}
