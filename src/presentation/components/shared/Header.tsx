'use client'

/**
 * Header — Logo ve Ayar/Tema butonlarını barındıran üst alan.
 *
 * @packageDocumentation
 */

import React, { useState } from 'react'
import { ThemesPanel } from '@/presentation/components/theme/ThemesPanel'
import { SettingsPanel } from '@/presentation/components/settings/SettingsPanel'
import { AudioPanel } from '@/presentation/components/audio/AudioPanel'
import { useAudioStore } from '@/presentation/store/audio.store'
import { openPipWindow } from '@/infrastructure/pip/pip-window.service'

export function Header() {
  const [isThemesOpen, setIsThemesOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAudioOpen, setIsAudioOpen] = useState(false)
  
  const { isPlaying } = useAudioStore()

  return (
    <>
      <header className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center font-bold tracking-tight">
            <span className="text-xl text-[var(--color-text-primary)] drop-shadow-md">Deep<span className="text-[var(--color-accent)]">Focus</span></span>
          </div>
          
          {/* Portfolio Linki (Yazar İmzası) */}
          <span className="text-[var(--color-text-secondary)] opacity-30 select-none text-xs hidden sm:inline-block">|</span>
          <a
            href="https://efe-arslan-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-[var(--color-text-secondary)] opacity-60 hover:opacity-100 hover:text-[var(--color-accent)] transition-colors hidden sm:inline-block"
            title="Geliştiricinin Portfolyosunu Görüntüle"
          >
            by Efe Arslan
          </a>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsAudioOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[var(--color-glass-bg)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] shadow-sm backdrop-blur-md transition-colors hover:bg-[var(--color-glass-border)] sm:px-4"
            aria-label="Ortam Sesleri"
          >
            <span className="relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isPlaying ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
              {isPlaying && (
                <span className="absolute -right-1 -top-1 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]"></span>
                </span>
              )}
            </span>
            <span className="hidden sm:inline">Sesler</span>
          </button>
          
          <button
            onClick={() => void openPipWindow('/pip-timer')}
            className="flex items-center gap-2 rounded-full bg-[var(--color-glass-bg)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] shadow-sm backdrop-blur-md transition-colors hover:bg-[var(--color-glass-border)] sm:px-4"
            aria-label="Yüzer Pencere"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <rect x="12" y="14" width="7" height="5" rx="1" />
            </svg>
            <span className="hidden sm:inline">PiP</span>
          </button>
          
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
      <AudioPanel isOpen={isAudioOpen} onClose={() => setIsAudioOpen(false)} />
    </>
  )
}
