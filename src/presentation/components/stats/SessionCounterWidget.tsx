'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { LocalStorageSessionRepository } from '@/infrastructure/storage/local-storage-session.repository'
import { cn } from '@/shared/utils/cn.utils'

interface SessionsCount {
  focus: number
  'short-break': number
  'long-break': number
}

interface SessionCounterWidgetProps {
  readonly className?: string
}

export function SessionCounterWidget({ className }: SessionCounterWidgetProps) {
  const [counts, setCounts] = useState<SessionsCount>({ focus: 0, 'short-break': 0, 'long-break': 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  const loadTodaySessions = useCallback(async () => {
    try {
      const repo = new LocalStorageSessionRepository()
      const now = new Date()
      // Bugünün başlangıç ve bitişini oluştur
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      
      const sessions = await repo.findByDateRange(startOfDay, endOfDay)
      
      const newCounts = { focus: 0, 'short-break': 0, 'long-break': 0 }
      sessions.forEach(session => {
        if (session.wasCompleted) {
          newCounts[session.mode]++
        }
      })
      
      setCounts(newCounts)
    } catch (err) {
      console.error('[SessionCounterWidget] Failed to load today sessions:', err)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    void loadTodaySessions()

    // Eğer ana ekrandaysak zamanlayıcı bitince bu widget'in yenilenmesini dinleyebiliriz
    // 'TIMER_COMPLETE' mesajını veya periyodik bir anket kullanabiliriz, 
    // ama basitlik için window odağında güncelleyeğiz.
    const onFocus = () => void loadTodaySessions()
    window.addEventListener('focus', onFocus)
    
    // Uygulama içi event'lerle de güncellenebilmesi için:
    const onStorage = () => void loadTodaySessions()
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('storage', onStorage)
    }
  }, [loadTodaySessions])

  if (!isLoaded) return null

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-full bg-[var(--color-glass)] border border-[var(--color-glass-border)] px-4 py-1.5 backdrop-blur-md shadow-sm text-xs font-medium text-[var(--color-text-secondary)]",
      className
    )}>
      <div className="flex items-center gap-1.5" title="Bugün Tamamlanan Odak">
        <span className="text-[var(--color-accent)]">🎯</span>
        <span className="opacity-80">×{counts.focus}</span>
      </div>
      <span className="opacity-30">·</span>
      <div className="flex items-center gap-1.5" title="Bugün Yapılan Kısa Mola">
        <span className="text-green-500">☕</span>
        <span className="opacity-80">×{counts['short-break']}</span>
      </div>
      <span className="opacity-30">·</span>
      <div className="flex items-center gap-1.5" title="Bugün Yapılan Uzun Mola">
        <span className="text-blue-500">🌙</span>
        <span className="opacity-80">×{counts['long-break']}</span>
      </div>
    </div>
  )
}
