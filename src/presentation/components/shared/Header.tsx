'use client'

/**
 * Header — Logo ve Ayar/Tema butonlarını barındıran üst alan.
 *
 * @packageDocumentation
 */

import React, { useState } from 'react'
import { ThemesPanel } from '@/presentation/components/theme/ThemesPanel'
import { SettingsPanel } from '@/presentation/components/settings/SettingsPanel'

export function Header() {
  const [isThemesOpen, setIsThemesOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <>
      <header className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between p-6">
        <div className="flex items-center gap-2 font-bold tracking-tight">
          <span className="text-xl text-[var(--color-text-primary)] drop-shadow-md">Deep<span className="text-[var(--color-accent)]">Focus</span></span>
        </div>

        <nav className="flex items-center gap-4">
          <button
            onClick={() => setIsThemesOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[var(--color-glass-bg)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] shadow-sm backdrop-blur-md transition-colors hover:bg-[var(--color-glass-border)]"
            aria-label="Temalar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="hidden sm:inline">Tema</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[var(--color-glass-bg)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] shadow-sm backdrop-blur-md transition-colors hover:bg-[var(--color-glass-border)]"
            aria-label="Ayarlar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span className="hidden sm:inline">Ayarlar</span>
          </button>
        </nav>
      </header>

      <ThemesPanel isOpen={isThemesOpen} onClose={() => setIsThemesOpen(false)} />
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  )
}
