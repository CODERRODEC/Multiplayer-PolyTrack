"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { GameSettings } from "../types/game"

interface GameStore {
  settings: GameSettings
  updateSettings: (newSettings: Partial<GameSettings>) => void
}

const defaultSettings: GameSettings = {
  graphics: {
    quality: "medium",
    resolution: "1920x1080",
    fullscreen: false,
    vsync: true,
    shadows: true,
    renderDistance: 100,
  },
  audio: {
    masterVolume: 80,
    musicVolume: 60,
    sfxVolume: 80,
    engineSounds: true,
    ambientSounds: true,
  },
  controls: {
    scheme: "wasd",
    sensitivity: 5,
    autoBrake: false,
    tractionControl: true,
  },
  gameplay: {
    difficulty: "medium",
    cameraView: "third-person",
    showMinimap: true,
    showSpeedometer: true,
    ghostCars: false,
    raceLength: "medium",
  },
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
            graphics: { ...state.settings.graphics, ...newSettings.graphics },
            audio: { ...state.settings.audio, ...newSettings.audio },
            controls: { ...state.settings.controls, ...newSettings.controls },
            gameplay: { ...state.settings.gameplay, ...newSettings.gameplay },
          },
        })),
    }),
    {
      name: "polytrack-settings",
    },
  ),
)
