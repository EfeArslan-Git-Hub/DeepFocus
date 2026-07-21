'use client'

/**
 * TimerProgressRing — SVG dairesel ilerleme göstergesi.
 *
 * Timer'ın ne kadar tamamlandığını görsel olarak gösterir.
 * Tamamlanma durumunda pulse animasyonu çalar.
 *
 * @packageDocumentation
 */

import React from 'react'
import { cn } from '@/shared/utils/cn.utils'

interface TimerProgressRingProps {
  /** İlerleme oranı (0'dan 1'e) */
  readonly progress: number
  /** Ring rengi (hex veya CSS değişkeni) */
  readonly color: string
  /** SVG boyutu (px) — varsayılan 280 */
  readonly size?: number
  /** Çizgi kalınlığı — varsayılan 5 */
  readonly strokeWidth?: number
  /** Timer çalışıyor mu (pulse animasyonu için) */
  readonly isRunning?: boolean
  /** İçerik */
  readonly children?: React.ReactNode
  /** CSS class */
  readonly className?: string
}

/**
 * Dairesel SVG ilerleme halkası.
 * stroke-dashoffset ile animasyon sağlar.
 */
export function TimerProgressRing({
  progress,
  color,
  size = 280,
  strokeWidth = 5,
  isRunning = false,
  children,
  className,
}: TimerProgressRingProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const center = size / 2
  const radius = center - strokeWidth * 2
  const circumference = 2 * Math.PI * radius
  // Sıfırdan başlayıp dolu gelen: progress 0 iken offset = circumference (boş)
  // progress 1 iken offset = 0 (dolu)
  const strokeDashoffset = circumference * (1 - clampedProgress)

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        {/* Arka plan halkası */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-glass-border)"
          strokeWidth={strokeWidth}
          opacity={0.4}
        />

        {/* İlerleme halkası */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease',
            filter: isRunning ? `drop-shadow(0 0 8px ${color}80)` : 'none',
          }}
        />

        {/* Çalışırken parlayan uç nokta */}
        {isRunning && clampedProgress > 0 && clampedProgress < 1 && (
          <circle
            cx={center + radius * Math.cos((2 * Math.PI * clampedProgress) - Math.PI / 2)}
            cy={center + radius * Math.sin((2 * Math.PI * clampedProgress) - Math.PI / 2)}
            r={strokeWidth * 1.2}
            fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        )}
      </svg>

      {/* Merkez içerik */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}
