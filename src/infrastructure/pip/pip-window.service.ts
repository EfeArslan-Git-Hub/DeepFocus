/**
 * PipWindowService — Picture-in-Picture (Document PiP veya popup) yöneticisi.
 *
 * Tarayıcı Document Picture-in-Picture API'yi destekliyorsa onu kullanır,
 * aksi hâlde küçük bir popup pencere açar.
 *
 * @packageDocumentation
 */

/** PiP penceresi seçenekleri */
export interface PipWindowOptions {
  readonly width?: number
  readonly height?: number
}

/** PiP Window servisi döndürülen handle */
export interface PipWindowHandle {
  /** Pencereyi kapatır */
  close(): void
  /** Pencere kapatıldığında çağrılır */
  onClose(callback: () => void): void
}

/**
 * Timer PiP penceresini açar.
 * Document PiP API destekleniyorsa kullanır, yoksa popup açar.
 *
 * @param url - Açılacak URL (/pip-timer gibi)
 * @param options - Pencere boyut seçenekleri
 * @returns PiP pencere handle'ı veya null (başarısız açılırsa)
 */
export async function openPipWindow(
  url: string,
  options: PipWindowOptions = {},
): Promise<PipWindowHandle | null> {
  const width = options.width ?? 320
  const height = options.height ?? 200

  const absoluteUrl = new URL(url, window.location.origin).toString()

  // Fallback: popup pencere
  const popup = window.open(
    absoluteUrl,
    'deepfocus-pip',
    `width=${width},height=${height},resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no`,
  )

  if (!popup) return null

  let closeCallback: (() => void) | null = null

  const interval = setInterval(() => {
    if (popup.closed) {
      clearInterval(interval)
      closeCallback?.()
    }
  }, 500)

  return {
    close: () => {
      clearInterval(interval)
      popup.close()
    },
    onClose: (cb) => { closeCallback = cb },
  }
}
