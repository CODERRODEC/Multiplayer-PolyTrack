export type GameState = "menu" | "lobby" | "racing" | "results"

export interface Player {
  id: string
  name: string
  isHost: boolean
  ready: boolean
  position?: [number, number, number]
  rotation?: number
  color?: string
}

export interface Track {
  id: string
  name: string
  description: string
  difficulty: string
  length: string
}

export interface RaceResult {
  playerId: string
  playerName: string
  position: number
  totalTime: string
  bestLap: string
  lapTimes: string[]
}

export interface GameSettings {
  graphics: {
    quality: "low" | "medium" | "high" | "ultra"
    resolution: string
    fullscreen: boolean
    vsync: boolean
    shadows: boolean
    renderDistance: number
  }
  audio: {
    masterVolume: number
    musicVolume: number
    sfxVolume: number
    engineSounds: boolean
    ambientSounds: boolean
  }
  controls: {
    scheme: "wasd" | "arrows" | "gamepad"
    sensitivity: number
    autoBrake: boolean
    tractionControl: boolean
  }
  gameplay: {
    difficulty: "easy" | "medium" | "hard" | "expert"
    cameraView: "third-person" | "first-person" | "top-down"
    showMinimap: boolean
    showSpeedometer: boolean
    ghostCars: boolean
    raceLength: "short" | "medium" | "long"
  }
}

export interface LobbyData {
  code: string
  hostId: string
  trackId: string
  players: Player[]
  maxPlayers: number
  isRacing: boolean
}
