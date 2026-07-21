'use client'

/**
 * ThemesPanel — Tema seçim modali.
 *
 * @packageDocumentation
 */

import React from 'react'
import { Modal } from '@/presentation/components/shared/Modal'
import { useThemeStore } from '@/presentation/store/theme.store'
import { BUILT_IN_THEMES } from '@/shared/constants/theme.constants'
import { cn } from '@/shared/utils/cn.utils'

interface ThemesPanelProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

export function ThemesPanel({ isOpen, onClose }: ThemesPanelProps) {
  const { activeThemeId, setTheme } = useThemeStore()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Temalar">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {BUILT_IN_THEMES.map((theme) => {
          const isActive = theme.id === activeThemeId

          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={cn(
                'group relative flex aspect-video flex-col items-center justify-end overflow-hidden rounded-xl border-2 p-3 transition-all duration-300',
                isActive
                  ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg-primary)]'
                  : 'border-[var(--color-glass-border)] hover:border-[var(--color-text-secondary)]'
              )}
            >
              {/* Thumbnail Arka Planı */}
              <div
                className="absolute inset-0 -z-20 transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundColor: theme.colors['--color-bg-primary'],
                  backgroundImage: theme.backgroundImageUrl ? `url(${theme.backgroundImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {/* Karartma overlay */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 to-transparent" />
              
              <span className="relative z-10 text-sm font-semibold text-white drop-shadow-md">
                {theme.name}
              </span>

              {/* Aktif sembolü */}
              {isActive && (
                <div className="absolute right-2 top-2 rounded-full bg-[var(--color-accent)] p-1 text-white shadow-lg">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
