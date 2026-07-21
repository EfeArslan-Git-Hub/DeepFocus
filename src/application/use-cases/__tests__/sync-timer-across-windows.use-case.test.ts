/**
 * SyncTimerAcrossWindows Use-Case Testleri
 *
 * BroadcastChannel API'sini mock'layarak pencereler arası
 * timer senkronizasyonunu test eder.
 *
 * @group application/use-cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  broadcastTimerState,
  listenTimerSync,
  TIMER_BROADCAST_CHANNEL,
  type WindowSyncMessage,
} from '@/application/use-cases/sync-timer-across-windows.use-case'
import { createTestTimer } from '@/test/mocks/timer.factory'

/** BroadcastChannel mock implementasyonu */
class MockBroadcastChannel {
  name: string
  private static instances: MockBroadcastChannel[] = []
  private listeners: Array<(event: MessageEvent) => void> = []
  public closed = false

  constructor(name: string) {
    this.name = name
    MockBroadcastChannel.instances.push(this)
  }

  postMessage(data: unknown): void {
    // Diğer aynı add kanal adındaki instance'lara mesaj gönder
    MockBroadcastChannel.instances
      .filter((ch) => ch !== this && ch.name === this.name && !ch.closed)
      .forEach((ch) => {
        ch.listeners.forEach((fn) => fn(new MessageEvent('message', { data })))
      })
  }

  addEventListener(_type: string, fn: (event: MessageEvent) => void): void {
    this.listeners.push(fn)
  }

  removeEventListener(_type: string, fn: (event: MessageEvent) => void): void {
    this.listeners = this.listeners.filter((l) => l !== fn)
  }

  close(): void {
    this.closed = true
    MockBroadcastChannel.instances = MockBroadcastChannel.instances.filter((ch) => ch !== this)
  }

  static reset(): void {
    MockBroadcastChannel.instances = []
  }
}

describe('broadcastTimerState', () => {
  beforeEach(() => {
    MockBroadcastChannel.reset()
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    MockBroadcastChannel.reset()
  })

  it('TIMER_STATE_UPDATE mesajını yayınlar', () => {
    const received: WindowSyncMessage[] = []
    const cleanup = listenTimerSync((msg) => received.push(msg))

    broadcastTimerState({
      type: 'TIMER_STATE_UPDATE',
      payload: createTestTimer(),
      timestamp: Date.now(),
    })

    expect(received).toHaveLength(1)
    expect(received[0]?.type).toBe('TIMER_STATE_UPDATE')

    cleanup()
  })

  it('TIMER_START mesajını yayınlar', () => {
    const received: WindowSyncMessage[] = []
    const cleanup = listenTimerSync((msg) => received.push(msg))

    broadcastTimerState({
      type: 'TIMER_START',
      payload: createTestTimer(),
      timestamp: Date.now(),
    })

    expect(received[0]?.type).toBe('TIMER_START')
    cleanup()
  })

  it('TIMER_PAUSE mesajını yayınlar', () => {
    const received: WindowSyncMessage[] = []
    const cleanup = listenTimerSync((msg) => received.push(msg))

    broadcastTimerState({
      type: 'TIMER_PAUSE',
      timestamp: Date.now(),
    })

    expect(received[0]?.type).toBe('TIMER_PAUSE')
    cleanup()
  })

  it('TIMER_COMPLETE mesajını yayınlar', () => {
    const received: WindowSyncMessage[] = []
    const cleanup = listenTimerSync((msg) => received.push(msg))

    broadcastTimerState({
      type: 'TIMER_COMPLETE',
      timestamp: Date.now(),
    })

    expect(received[0]?.type).toBe('TIMER_COMPLETE')
    cleanup()
  })

  it('mesajda doğru payload gönderilir', () => {
    const timer = createTestTimer({ remainingSeconds: 750 })
    const received: WindowSyncMessage[] = []
    const cleanup = listenTimerSync((msg) => received.push(msg))

    broadcastTimerState({
      type: 'TIMER_STATE_UPDATE',
      payload: timer,
      timestamp: 1234567890,
    })

    expect(received[0]?.payload?.remainingSeconds).toBe(750)
    expect(received[0]?.timestamp).toBe(1234567890)
    cleanup()
  })

  it('BroadcastChannel desteklenmiyorsa sessizce geçer (no-op)', () => {
    vi.stubGlobal('BroadcastChannel', undefined)

    // Hata fırlatmamalı
    expect(() =>
      broadcastTimerState({ type: 'TIMER_START', timestamp: Date.now() }),
    ).not.toThrow()
  })

  it('doğru kanal adını kullanır', () => {
    const constructorSpy = vi.fn().mockImplementation((name: string) => {
      return {
        name,
        postMessage: vi.fn(),
        close: vi.fn(),
        addEventListener: vi.fn(),
      }
    })
    vi.stubGlobal('BroadcastChannel', constructorSpy)

    broadcastTimerState({ type: 'TIMER_START', timestamp: Date.now() })

    expect(constructorSpy).toHaveBeenCalledWith(TIMER_BROADCAST_CHANNEL)
  })
})

describe('listenTimerSync', () => {
  beforeEach(() => {
    MockBroadcastChannel.reset()
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    MockBroadcastChannel.reset()
  })

  it('temizleme fonksiyonu çağrıldığında mesaj dinlemeyi durdurur', () => {
    const received: WindowSyncMessage[] = []
    const cleanup = listenTimerSync((msg) => received.push(msg))

    // Temizle
    cleanup()

    // Temizlemeden sonra yayınla
    broadcastTimerState({ type: 'TIMER_START', timestamp: Date.now() })

    expect(received).toHaveLength(0)
  })

  it('birden fazla listener aynı mesajı alır', () => {
    const received1: WindowSyncMessage[] = []
    const received2: WindowSyncMessage[] = []

    const cleanup1 = listenTimerSync((msg) => received1.push(msg))
    const cleanup2 = listenTimerSync((msg) => received2.push(msg))

    broadcastTimerState({ type: 'TIMER_COMPLETE', timestamp: Date.now() })

    expect(received1).toHaveLength(1)
    expect(received2).toHaveLength(1)

    cleanup1()
    cleanup2()
  })

  it('BroadcastChannel desteklenmiyorsa no-op cleanup döner', () => {
    vi.stubGlobal('BroadcastChannel', undefined)

    const cleanup = listenTimerSync(() => {})

    // Hata fırlatmamalı
    expect(() => cleanup()).not.toThrow()
  })

  it('listener birden fazla mesaj alabilir', () => {
    const received: WindowSyncMessage[] = []
    const cleanup = listenTimerSync((msg) => received.push(msg))

    broadcastTimerState({ type: 'TIMER_START', timestamp: 1 })
    broadcastTimerState({ type: 'TIMER_STATE_UPDATE', timestamp: 2 })
    broadcastTimerState({ type: 'TIMER_COMPLETE', timestamp: 3 })

    expect(received).toHaveLength(3)
    expect(received.map((m) => m.type)).toEqual([
      'TIMER_START',
      'TIMER_STATE_UPDATE',
      'TIMER_COMPLETE',
    ])

    cleanup()
  })
})
