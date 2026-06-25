'use client'

import { create } from 'zustand'

export interface CardRect {
  x: number
  y: number
  width: number
  height: number
}

interface TransitionState {
  cardRect: CardRect | null
  direction: 'forward' | 'back' | null
  setCardRect: (rect: CardRect | null) => void
  setDirection: (dir: 'forward' | 'back' | null) => void
  clear: () => void
}

export const useTransitionStore = create<TransitionState>((set) => ({
  cardRect: null,
  direction: null,
  setCardRect: (rect) => set({ cardRect: rect }),
  setDirection: (dir) => set({ direction: dir }),
  clear: () => set({ cardRect: null, direction: null }),
}))
