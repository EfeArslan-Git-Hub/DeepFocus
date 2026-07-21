'use client'

/**
 * useStats Hook — Kullanıcı istatistiklerini UI ile bağlar.
 *
 * @packageDocumentation
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { LocalStorageStatsRepository } from '@/infrastructure/storage/local-storage-stats.repository'
import type { UserStatsEntity } from '@/domain/entities/user-stats.entity'

export function useStats() {
  const [stats, setStats] = useState<UserStatsEntity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const mounted = useRef(false)

  const loadStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const repo = new LocalStorageStatsRepository()
      const data = await repo.load()
      setStats(data)
    } catch (err) {
      console.error('[useStats] İstatistikler yüklenemedi:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      void loadStats()
    }
  }, [loadStats])

  return {
    stats,
    isLoading,
    reload: loadStats,
  }
}
