'use client'

/**
 * PiP (Picture in Picture) Minimal Timer Sayfası.
 *
 * Sadece zamanlayıcı göstergesini ve statü (focus/break) çubuğunu içerir.
 * BroadcastChannel ile ana sekmeye senkronizedir.
 *
 * @packageDocumentation
 */

import React, { useEffect, useState } from 'react'
import { useTimer } from '@/presentation/hooks/useTimer'
import { formatSeconds } from '@/domain/value-objects/duration.value-object'
import { MODE_LABELS } from '@/shared/constants/timer.constants'
import { cn } from '@/shared/utils/cn.utils'

export default function PipTimerPage() {
  const { mode, status, remainingSeconds, isCompleting, toggle, reset } = useTimer({ isPip: true })

  // Renk hesaplama
  const badgeColors = mode === 'focus' ? 'bg-[var(--color-accent)] text-white' 
                    : mode === 'short-break' ? 'bg-green-500/20 text-green-400' 
                    : 'bg-blue-500/20 text-blue-400'
  const isRunning = status === 'running'
  const label = MODE_LABELS[mode]

  // Düzen State'i ve LocalStorage Yönetimi
  const [layout, setLayout] = useState<'vertical' | 'horizontal' | 'compact'>('vertical')

  useEffect(() => {
    const savedLayout = localStorage.getItem('pip-layout') as 'vertical' | 'horizontal' | 'compact'
    if (savedLayout && ['vertical', 'horizontal', 'compact'].includes(savedLayout)) {
      setLayout(savedLayout)
    }
  }, [])

  const changeLayout = (newLayout: 'vertical' | 'horizontal' | 'compact') => {
    setLayout(newLayout)
    localStorage.setItem('pip-layout', newLayout)
  }

  // PiP penceresinde scroll'u kapat, body arka planını transparent yap
  useEffect(() => {
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'
    document.body.style.overflow = 'hidden'
  }, [])

  return (
    <main className="group/main flex h-screen w-full flex-col items-center justify-center p-2 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
       {/* PiP Wrapper */}
       <div className={cn(
         "relative flex transition-all duration-300 shadow-xl",
         isCompleting ? "anim-completing-flash" : "border border-[var(--color-glass-border)] bg-[var(--color-glass)]",
         layout === 'vertical' && "h-full w-full max-h-[220px] max-w-[320px] flex-col items-center justify-between rounded-[1.5rem] p-4",
         layout === 'horizontal' && "h-[100px] w-fit flex-row items-center justify-center gap-6 rounded-full px-8 py-3",
         layout === 'compact' && "h-fit w-fit flex-col items-center justify-center rounded-[1.25rem] px-5 py-3"
       )}>
          
          {/* Düzen Değiştirici Bölümü (Hover'da görünür) */}
          <div className="absolute -top-3 -right-3 z-50 flex flex-col gap-1 opacity-0 group-hover/main:opacity-100 transition-opacity duration-200">
             <div className="flex bg-[var(--color-glass)] border border-[var(--color-glass-border)] rounded-lg shadow p-1 gap-1 backdrop-blur-md text-[var(--color-text-secondary)]">
                <button title="Dikey (Varsayılan)" onClick={() => changeLayout('vertical')} className={cn("p-1 rounded hover:bg-[var(--color-icon-bg-hover)] hover:text-[var(--color-text-primary)]", layout === 'vertical' && "bg-[var(--color-icon-bg)] text-white")}>
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><rect x="6" y="3" width="12" height="18" rx="2"></rect></svg>
                </button>
                <button title="Yatay" onClick={() => changeLayout('horizontal')} className={cn("p-1 rounded hover:bg-[var(--color-icon-bg-hover)] hover:text-[var(--color-text-primary)]", layout === 'horizontal' && "bg-[var(--color-icon-bg)] text-white")}>
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="6" width="18" height="12" rx="2"></rect></svg>
                </button>
                <button title="Kompakt" onClick={() => changeLayout('compact')} className={cn("p-1 rounded hover:bg-[var(--color-icon-bg-hover)] hover:text-[var(--color-text-primary)]", layout === 'compact' && "bg-[var(--color-icon-bg)] text-white")}>
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><rect x="7" y="7" width="10" height="10" rx="2"></rect></svg>
                </button>
             </div>
          </div>

          {/* Üst Kısım: Mod Etiketi (Kompakt modda gizle veya minimal yap) */}
          {layout !== 'compact' && (
            <div className={cn(
              "rounded-full px-3 py-1 font-bold uppercase tracking-widest shadow-sm",
              badgeColors,
              layout === 'horizontal' ? "text-[10px]" : "text-[11px]"
            )}>
              {label}
            </div>
          )}

          {/* Orta Kısım: Süre */}
          <div 
             className={cn(
               "font-mono leading-none font-light tracking-tighter transition-all",
               status === 'paused' && "opacity-60",
               !isCompleting && remainingSeconds <= 60 && remainingSeconds > 0 && "text-red-400 pulse-rapid",
               layout === 'vertical' ? "text-[3.5rem]" : "text-[3rem]"
             )}
          >
             {formatSeconds(remainingSeconds)}
          </div>
          
          {/* Alt Kısım: Kontroller (Sadece Icon, Kompakt modda gizle) */}
          {layout !== 'compact' && (
            <div className={cn(
               "flex items-center gap-4",
               layout === 'vertical' ? "mt-2" : "mt-0"
            )}>
            <button 
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-icon-bg)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-icon-bg-hover)] hover:text-[var(--color-text-primary)] active:scale-95"
              title={isRunning ? "Durdur" : "Başlat"}
            >
              {isRunning ? (
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              )}
            </button>
            <button 
              onClick={reset}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-icon-bg)] text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-icon-bg-hover)] hover:text-red-400 active:scale-95"
              title="Sıfırla"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            </button>
            </div>
          )}

       </div>
    </main>
  )
}
