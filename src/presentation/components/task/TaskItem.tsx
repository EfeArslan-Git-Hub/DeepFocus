'use client'

/**
 * TaskItem — Tekil görev gösterimi bileşeni.
 *
 * @packageDocumentation
 */

import React from 'react'
import type { TaskEntity } from '@/domain/entities/task.entity'
import { cn } from '@/shared/utils/cn.utils'

interface TaskItemProps {
  readonly task: TaskEntity
  readonly onToggle: (id: string) => void
  readonly onSetActive: (id: string) => void
  readonly onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onSetActive, onDelete }: TaskItemProps) {
  const isCompleted = task.completed
  const isActive = task.isActive

  // Öncelik renk ayarları
  const priorityColor = 
    task.priority === 'high' ? 'text-red-400 bg-red-400/10' :
    task.priority === 'medium' ? 'text-yellow-400 bg-yellow-400/10' :
    'text-blue-400 bg-blue-400/10'

  return (
    <div
      className={cn(
        'glass group relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-transparent p-3 pr-4 transition-all duration-300',
        isActive ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5' : 'hover:border-[var(--color-glass-border)]',
        isCompleted && 'opacity-60 grayscale-[50%]'
      )}
    >
      {/* Sol kısımdaki aktif çizgi dekorasyonu */}
      {isActive && (
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-[var(--color-accent)]" aria-hidden="true" />
      )}

      {/* Checkbox alanı */}
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          isCompleted 
            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white" 
            : "border-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)]"
        )}
        aria-label={isCompleted ? "Görevi tamamlanmadı işaretle" : "Görevi tamamla"}
      >
        {isCompleted && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Metin içeriği */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className={cn(
          "truncate font-medium transition-colors",
          isCompleted ? "text-[var(--color-text-secondary)] line-through" : "text-[var(--color-text-primary)]"
        )}>
          {task.title}
        </h4>
        <div className="mt-1 flex items-center gap-3">
          <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest", priorityColor)}>
             P-{task.priority.charAt(0)}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
            <span className={cn("h-1.5 w-1.5 rounded-full", task.completedPomodoros >= task.estimatedPomodoros ? "bg-green-500" : "bg-[var(--color-accent)]")} />
            {task.completedPomodoros} / {task.estimatedPomodoros}
          </span>
        </div>
      </div>

      {/* Aksiyon butonları */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 sm:opacity-100">
        {!isCompleted && (
          <button
            onClick={() => onSetActive(task.id)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              isActive 
                ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10" 
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-border)] hover:text-[var(--color-text-primary)]"
            )}
            title={isActive ? "Mevcut aktif görev" : "Görevi aktif odak yap"}
            aria-label="Odaklan"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        )}
        
        <button
          onClick={() => onDelete(task.id)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-red-500/20 hover:text-red-400"
          title="Görevi Sil"
          aria-label="Sil"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>

    </div>
  )
}
