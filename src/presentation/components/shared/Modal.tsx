'use client'

/**
 * Modal — Basit, erişilebilir, tekrar kullanılabilir modal pencere.
 *
 * @packageDocumentation
 */

import React, { useEffect, useRef } from 'react'
import { cn } from '@/shared/utils/cn.utils'

interface ModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly title: string
  readonly children: React.ReactNode
  readonly className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  // Dialog'un backdrop (overlay) tıklamasını dinlemek için
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className={cn(
        'glass m-auto w-full max-w-lg rounded-2xl p-6 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        'open:animate-in open:fade-in open:zoom-in-95',
        'text-[var(--color-text-primary)]',
        className
      )}
      style={{
        background: 'var(--color-bg-secondary)', // Glass efekti üstüne biraz zemin eklemek için
        borderColor: 'var(--color-glass-border)'
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-glass-bg)] hover:text-[var(--color-text-primary)]"
          aria-label="Kapat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div>{children}</div>
    </dialog>
  )
}
