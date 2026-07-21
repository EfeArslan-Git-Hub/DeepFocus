'use client'

/**
 * AudioStore — Ambient ses tercihlerini yönetir (Zustand).
 *
 * localStorage ile senkron çalışarak volume ve seçili ambient sesi kaydeder.
 *
 * @packageDocumentation
 */

import { create } from 'zustand'
import { ambientAudioService } from '@/infrastructure/audio/ambient-audio.service'
import { AMBIENT_SOUNDS, DEFAULT_VOLUME } from '@/shared/constants/audio.constants'

export interface AudioStoreState {
  volume: number
  activeSoundId: string | null
  isPlaying: boolean
}

export interface AudioStoreActions {
  setVolume: (volume: number) => void
  toggleSound: (soundId: string) => void
  stop: () => void
  init: () => void // İstemci tarafında ilk yükleme
}

export type AudioStore = AudioStoreState & AudioStoreActions

const STORAGE_KEY = 'deepfocus-audio-config'

function loadConfig() {
  if (typeof window === 'undefined') return { volume: DEFAULT_VOLUME, activeSoundId: null }
  
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
       const parsed = JSON.parse(data)
       return {
         volume: typeof parsed.volume === 'number' ? parsed.volume : DEFAULT_VOLUME,
         activeSoundId: parsed.activeSoundId || null
       }
    }
  } catch (err) {
    console.error('Audio config yüklenemedi:', err)
  }
  return { volume: DEFAULT_VOLUME, activeSoundId: null }
}

function saveConfig(volume: number, activeSoundId: string | null) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume, activeSoundId }))
  } catch (err) {
    // silent
  }
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  volume: DEFAULT_VOLUME,
  activeSoundId: null,
  isPlaying: false,

  init: () => {
    const config = loadConfig()
    set({ volume: config.volume, activeSoundId: config.activeSoundId, isPlaying: false })
    ambientAudioService.setVolume(config.volume)
  },

  setVolume: (vol) => {
    const volume = Math.max(0, Math.min(1, vol))
    set({ volume })
    ambientAudioService.setVolume(volume)
    saveConfig(volume, get().activeSoundId)
  },

  toggleSound: (soundId) => {
    const { activeSoundId, isPlaying, volume } = get()
    
    // Aynı sese tekrar tıklandıysa durdur
    if (activeSoundId === soundId && isPlaying) {
       ambientAudioService.stop()
       set({ isPlaying: false })
       return
    }

    // Yeni sesi bul ve çal
    const sound = AMBIENT_SOUNDS.find(s => s.id === soundId)
    if (sound) {
       ambientAudioService.play(sound.filePath, sound.id, volume)
       set({ activeSoundId: soundId, isPlaying: true })
       saveConfig(volume, soundId)
    }
  },

  stop: () => {
    ambientAudioService.stop()
    set({ isPlaying: false })
  }
}))
