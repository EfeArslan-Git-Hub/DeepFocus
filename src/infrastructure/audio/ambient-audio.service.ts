/**
 * AmbientAudioService — Ortam sesi çalma servisi.
 *
 * Tarayıcı Audio API'sini kullanarak ambient sesleri çalar/duraklatır.
 * Singleton pattern ile session başına tek instance yönetilir.
 *
 * @packageDocumentation
 */

/**
 * Ambient ses servisi.
 * Presentation katmanı bu servisi dependency injection ile alır.
 */
export class AmbientAudioService {
  private audio: HTMLAudioElement | null = null
  private currentSoundId: string | null = null

  /**
   * Belirtilen ses dosyasını çalar.
   * Aynı ses zaten çalıyorsa devam eder.
   *
   * @param filePath - Ses dosyası yolu
   * @param soundId - Ses ID'si (tekrar çalmayı önlemek için)
   * @param volume - Ses seviyesi (0-1 arası)
   */
  play(filePath: string, soundId: string, volume: number = 0.5): void {
    if (this.currentSoundId === soundId && this.audio && !this.audio.paused) {
      return
    }

    this.stop()

    this.audio = new Audio(filePath)
    this.audio.loop = true
    this.audio.volume = Math.max(0, Math.min(1, volume))
    this.currentSoundId = soundId
    void this.audio.play()
  }

  /**
   * Sesi duraklatır.
   */
  pause(): void {
    this.audio?.pause()
  }

  /**
   * Sesi durdurur ve kaynağı temizler.
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
      this.audio = null
      this.currentSoundId = null
    }
  }

  /**
   * Ses seviyesini günceller.
   * @param volume - 0-1 arası ses seviyesi
   */
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume))
    }
  }

  /** Mevcut ses çalıyor mu? */
  get isPlaying(): boolean {
    return this.audio !== null && !this.audio.paused
  }

  /** Mevcut çalan ses ID'si */
  get activeSoundId(): string | null {
    return this.currentSoundId
  }
}

/** Singleton ambient ses servisi instance'ı */
export const ambientAudioService = new AmbientAudioService()
