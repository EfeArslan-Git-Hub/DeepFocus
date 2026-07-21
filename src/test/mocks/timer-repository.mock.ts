/**
 * Mock Timer Repository — Test amaçlı in-memory ITimerRepository implementasyonu.
 *
 * @packageDocumentation
 */

import type { ITimerRepository } from '@/domain/repositories/timer.repository'
import type { TimerEntity, TimerConfig } from '@/domain/entities/timer.entity'

/**
 * Test'lerde dependency injection için kullanılan sahte timer repository.
 * vi.fn() çağrıları ile her metodun kaç kez çağrıldığı izlenebilir.
 */
export function createMockTimerRepository(
  overrides: Partial<ITimerRepository> = {},
): ITimerRepository & { _store: { timer: TimerEntity | null; config: TimerConfig | null } } {
  const store: { timer: TimerEntity | null; config: TimerConfig | null } = {
    timer: null,
    config: null,
  }

  return {
    _store: store,

    async save(timer: TimerEntity): Promise<void> {
      store.timer = timer
    },

    async load(): Promise<TimerEntity | null> {
      return store.timer
    },

    async saveConfig(config: TimerConfig): Promise<void> {
      store.config = config
    },

    async loadConfig(): Promise<TimerConfig | null> {
      return store.config
    },

    async clear(): Promise<void> {
      store.timer = null
    },

    ...overrides,
  }
}
