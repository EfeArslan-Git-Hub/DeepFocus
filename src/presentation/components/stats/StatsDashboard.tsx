'use client'

/**
 * StatsDashboard — İstatistikler ve grafik modülü.
 *
 * @packageDocumentation
 */

import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useStats } from '@/presentation/hooks/useStats'
import { cn } from '@/shared/utils/cn.utils'

export function StatsDashboard() {
  const { stats, isLoading } = useStats()

  // Son 7 gün dataset'i oluşturuluyor (gerekirse eksik günler 0 doldurulabilir, şimdilik entity'deki kayıtları kullanacağız)
  const chartData = useMemo(() => {
    if (!stats || stats.dailyStats.length === 0) return []
    // Son 7 günü al ve tersten düz (eskiden yeniye) dizi yap
    return [...stats.dailyStats]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7)
  }, [stats])

  if (isLoading) {
    return (
       <div className="glass mt-8 flex w-full animate-pulse flex-col gap-6 rounded-2xl p-6 opacity-60">
         <div className="h-6 w-32 rounded bg-[var(--color-glass-border)]" />
         <div className="h-40 rounded bg-[var(--color-glass-border)]" />
       </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="mt-8 flex w-full flex-col gap-6">
      <div className="flex items-center justify-between px-2">
         <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">İstatistikler</h2>
         <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            🔥 {stats.currentStreak} gün seri (Rekor: {stats.longestStreak})
         </div>
      </div>

      <div className="glass rounded-2xl p-6 shadow-md transition-shadow hover:shadow-lg">
        {/* Özet metrikler */}
        <div className="mb-6 grid grid-cols-3 divide-x divide-[var(--color-glass-border)]">
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <span className="text-2xl font-light text-[var(--color-text-primary)]">{Math.round(stats.totalFocusMinutes / 60)}s</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Odak</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <span className="text-2xl font-light text-[var(--color-text-primary)]">{stats.totalCompletedSessions}</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Oturum</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <span className="text-xl font-light text-[var(--color-text-primary)]">{stats.totalCompletedTasks}</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Görev</span>
          </div>
        </div>

        {/* Grafikler */}
        <div className="h-40 w-full" aria-label="Haftalık odaklanma süresi grafiği">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => {
                     const d = new Date(val)
                     return d.toLocaleDateString('tr-TR', { weekday: 'short' })
                  }}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
                  dy={10}
                />
                <YAxis 
                   dataKey="focusMinutes"
                   axisLine={false}
                   tickLine={false}
                   tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-glass-bg)' }}
                  contentStyle={{ 
                     backgroundColor: 'var(--color-bg-secondary)', 
                     borderColor: 'var(--color-glass-border)',
                     borderRadius: '8px',
                     color: 'var(--color-text-primary)',
                     fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value} dk`, 'Odaklanma']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR')}
                />
                <Bar 
                  dataKey="focusMinutes" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                       key={`cell-${index}`} 
                       fill={index === chartData.length - 1 ? 'var(--color-accent)' : 'var(--color-glass-border)'}
                       className="transition-colors duration-300"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-[var(--color-text-secondary)]">
              Grafik için yeterli veri yok.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
