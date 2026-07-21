/**
 * Tema sabitleri — Yerleşik tema listesi.
 *
 * @packageDocumentation
 */

import type { ThemeEntity } from '../../domain/entities/theme.entity'

/** Varsayılan tema ID'si */
export const DEFAULT_THEME_ID = 'minimal-dark' as const

/** Yerleşik temalar listesi */
export const BUILT_IN_THEMES: readonly ThemeEntity[] = [
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    category: 'minimal',
    colors: {
      '--color-bg-primary': '#0f0f13',
      '--color-bg-secondary': '#1a1a24',
      '--color-text-primary': '#e8e8f0',
      '--color-accent': '#7c6af7',
      '--color-glass-bg': 'rgba(255, 255, 255, 0.05)',
      '--color-glass-border': 'rgba(255, 255, 255, 0.1)',
    },
    availableContexts: ['home', 'focus', 'ambient'],
  },
  {
    id: 'forest',
    name: 'Forest',
    category: 'forest',
    backgroundImageUrl: '/themes/forest.jpg',
    colors: {
      '--color-bg-primary': '#1a2e1a',
      '--color-bg-secondary': '#243424',
      '--color-text-primary': '#d4e8c2',
      '--color-accent': '#6abf6a',
      '--color-glass-bg': 'rgba(0, 30, 0, 0.4)',
      '--color-glass-border': 'rgba(100, 200, 100, 0.2)',
    },
    availableContexts: ['home', 'focus', 'ambient'],
  },
  {
    id: 'rain',
    name: 'Rainy Day',
    category: 'rain',
    backgroundImageUrl: '/themes/rain.jpg',
    colors: {
      '--color-bg-primary': '#1a1f2e',
      '--color-bg-secondary': '#252c3d',
      '--color-text-primary': '#c8d8e8',
      '--color-accent': '#5b9bd5',
      '--color-glass-bg': 'rgba(20, 40, 80, 0.4)',
      '--color-glass-border': 'rgba(100, 160, 220, 0.2)',
    },
    availableContexts: ['home', 'focus', 'ambient'],
  },
  {
    id: 'library',
    name: 'Library',
    category: 'library',
    backgroundImageUrl: '/themes/library.jpg',
    colors: {
      '--color-bg-primary': '#1c1510',
      '--color-bg-secondary': '#261e16',
      '--color-text-primary': '#e8d8c0',
      '--color-accent': '#c8963c',
      '--color-glass-bg': 'rgba(40, 25, 10, 0.5)',
      '--color-glass-border': 'rgba(200, 150, 60, 0.2)',
    },
    availableContexts: ['home', 'focus', 'ambient'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    category: 'ocean',
    backgroundImageUrl: '/themes/ocean.jpg',
    colors: {
      '--color-bg-primary': '#0a1929',
      '--color-bg-secondary': '#102235',
      '--color-text-primary': '#b8d8f0',
      '--color-accent': '#29b6f6',
      '--color-glass-bg': 'rgba(5, 30, 60, 0.5)',
      '--color-glass-border': 'rgba(41, 182, 246, 0.2)',
    },
    availableContexts: ['home', 'focus', 'ambient'],
  },
] as const
