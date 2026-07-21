'use client'

/**
 * TaskInput — Yeni görev ekleme formu.
 *
 * @packageDocumentation
 */

import React, { useState } from 'react'
import type { TaskPriority } from '@/domain/entities/task.entity'
import { cn } from '@/shared/utils/cn.utils'

interface TaskInputProps {
  readonly onAddTask: (title: string, estPomodoros: number, priority: TaskPriority) => Promise<unknown>
  readonly className?: string
}

export function TaskInput({ onAddTask, className }: TaskInputProps) {
  const [title, setTitle] = useState('')
  const [pomodoros, setPomodoros] = useState(1)
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await onAddTask(title.trim(), pomodoros, priority)
    setTitle('')
    setPomodoros(1)
    setPriority('medium')
    setIsExpanded(false)
  }

  return (
    <div className={cn('glass overflow-hidden rounded-2xl transition-all duration-300', className)}>
      <form onSubmit={handleSubmit} className="flex flex-col p-2">
        <div className="flex items-center gap-2 px-2 py-1">
          {/* Hızlı ekleme inputu */}
          <button 
            type="button" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-glass-border)] hover:text-[var(--color-text-primary)]"
            aria-label="Detayları aç/kapat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform", isExpanded && "rotate-45")}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Ne üzerinde çalışacaksın?"
            className="flex-1 bg-transparent px-2 py-2 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none"
            required
            autoComplete="off"
          />

          {!isExpanded && (
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-full bg-[var(--color-accent)] p-2 text-white transition-transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50"
              aria-label="Ekle"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Genişletilmiş Alan */}
        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-2 mt-2 flex flex-col gap-4 border-t border-[var(--color-glass-border)] px-4 py-4">
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Tahmini Pomodoro</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={pomodoros}
                    onChange={(e) => setPomodoros(parseInt(e.target.value, 10))}
                    className="h-1.5 w-32 cursor-pointer appearance-none rounded-lg bg-[var(--color-glass-border)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-accent)]"
                  />
                  <span className="w-4 font-mono text-sm font-semibold">{pomodoros}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Öncelik</span>
                 <div className="flex gap-1" role="radiogroup">
                    {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                      <button
                        key={p}
                        type="button"
                        role="radio"
                        aria-checked={priority === p}
                        onClick={() => setPriority(p)}
                        className={cn(
                          "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                          priority === p 
                            ? (p === 'low' ? 'bg-blue-500/20 text-blue-400' : p === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400')
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-border)] hover:text-[var(--color-text-primary)]"
                        )}
                      >
                        {p === 'low' && 'Düşük'}
                        {p === 'medium' && 'Orta'}
                        {p === 'high' && 'Yüksek'}
                      </button>
                    ))}
                 </div>
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false)
                  setTitle('')
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-glass-border)] hover:text-[var(--color-text-primary)]"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="rounded-lg bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50"
              >
                Görevi Ekle
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
