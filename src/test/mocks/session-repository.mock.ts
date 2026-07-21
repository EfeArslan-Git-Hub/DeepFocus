/**
 * Mock Session Repository — Test amaçlı in-memory ISessionRepository implementasyonu.
 *
 * @packageDocumentation
 */

import type { ISessionRepository } from '@/domain/repositories/session.repository'
import type { SessionEntity } from '@/domain/entities/session.entity'

/**
 * Test'lerde dependency injection için kullanılan sahte session repository.
 */
export function createMockSessionRepository(
  overrides: Partial<ISessionRepository> = {},
): ISessionRepository & { _store: { sessions: SessionEntity[] } } {
  const store: { sessions: SessionEntity[] } = { sessions: [] }

  return {
    _store: store,

    async findAll(): Promise<SessionEntity[]> {
      return [...store.sessions]
    },

    async findByDateRange(startDate: Date, endDate: Date): Promise<SessionEntity[]> {
      return store.sessions.filter(
        (s) => s.startedAt >= startDate && s.completedAt <= endDate,
      )
    },

    async save(session: SessionEntity): Promise<void> {
      store.sessions.push(session)
    },

    async clear(): Promise<void> {
      store.sessions = []
    },

    ...overrides,
  }
}
