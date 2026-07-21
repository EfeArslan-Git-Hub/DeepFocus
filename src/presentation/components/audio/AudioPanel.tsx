'use client'

/**
 * AudioPanel — Ortam (ambient) seslerinin seçimi ve ses seviyesi kontrolü.
 *
 * @packageDocumentation
 */

import React, { useEffect } from 'react'
import { Modal } from '@/presentation/components/shared/Modal'
import { useAudioStore } from '@/presentation/store/audio.store'
import { AMBIENT_SOUNDS } from '@/shared/constants/audio.constants'
import { cn } from '@/shared/utils/cn.utils'

interface AudioPanelProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

export function AudioPanel({ isOpen, onClose }: AudioPanelProps) {
  const { volume, activeSoundId, isPlaying, setVolume, toggleSound, init, stop } = useAudioStore()

  // Sayfa yüklendiğinde ayarları localStorage'dan çekmek için init
  useEffect(() => {
    init()
  }, [init])

  // Timer veya focus oturumuyla ses oynatmanın otomatik linklenmesini 
  // dilerseniz `useTimer` ile `useEffect` atarak yapabilirsiniz, 
  // şu an Ambient ses sadece kullanıcının açıp kapatmasına bağlıdır.

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ortam Sesleri">
      <div className="flex flex-col gap-6">
        
        {/* Seçenekler Listesi */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
           {AMBIENT_SOUNDS.map((sound) => {
             const isActive = isPlaying && activeSoundId === sound.id
             return (
               <button
                 key={sound.id}
                 onClick={() => toggleSound(sound.id)}
                 className={cn(
                   "group relative flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all duration-300",
                   isActive 
                     ? "bg-[var(--color-accent)] shadow-md"
                     : "bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] hover:border-[var(--color-text-secondary)]"
                 )}
               >
                  <span className="text-3xl transition-transform group-hover:scale-110">
                    {sound.emoji}
                  </span>
                  <span className={cn(
                    "text-xs font-semibold", 
                    isActive ? "text-white" : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]"
                  )}>
                    {sound.name}
                  </span>
                  
                  {isActive && (
                    <div className="absolute right-2 top-2">
                       <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                       </span>
                    </div>
                  )}
               </button>
             )
           })}
        </div>

        {/* Ses Seviyesi Kontrolü */}
        <div className="flex flex-col gap-2 border-t border-[var(--color-glass-border)] pt-4">
           <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Ses Seviyesi</span>
              <span className="text-xs font-medium text-[var(--color-text-primary)]">{Math.round(volume * 100)}%</span>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setVolume(0)} 
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                aria-label="Sesi Kapat"
              >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-[var(--color-glass-border)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-accent)]"
              />

              <button 
                onClick={() => setVolume(1)} 
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                aria-label="Sesi Aç"
              >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
              </button>
           </div>
        </div>

        {isPlaying && (
          <div className="flex justify-end">
            <button
              onClick={stop}
              className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
            >
              Tamamen Durdur
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
