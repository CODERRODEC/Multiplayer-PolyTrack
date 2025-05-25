"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Physics } from "@react-three/rapier"
import { Sky, Environment } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Users, Trophy, Play, Plus } from "lucide-react"
import GameScene from "../components/game-scene"
import SettingsPanel from "../components/settings-panel"
import type { GameState, Track } from "../types/game"
import { useGameStore } from "../store/game-store"
import { useMultiplayer } from "../hooks/use-multiplayer"

const TRACKS: Track[] = [
  {
    id: "mountain-circuit",
    name: "Mountain Circuit",
    description: "Epic mountain track with massive elevation changes and technical sections",
    difficulty: "Hard",
    length: "5.4 km",
  },
  {
    id: "desert-speedway",
    name: "Desert Speedway",
    description: "High-speed oval perfect for reaching maximum velocity",
    difficulty: "Medium",
    length: "4.8 km",
  },
  {
    id: "forest-rally",
    name: "Forest Rally",
    description: "Technical forest track with tight corners and elevation changes",
    difficulty: "Expert",
    length: "3.6 km",
  },
]

export default function PolyTrackGame() {
  const [gameState, setGameState] = useState<GameState>("menu")
  const [showSettings, setShowSettings] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<string>(TRACKS[0].id)
  const [playerName, setPlayerName] = useState("")
  const [lobbyCode, setLobbyCode] = useState("")
  const [isCreatingLobby, setIsCreatingLobby] = useState(false)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [isDrifting, setIsDrifting] = useState(false)

  const { players, isConnected, raceResults, createLobby, joinLobby, startRace, leaveGame } = useMultiplayer()

  const { settings, updateSettings } = useGameStore()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("playerName")
      if (savedName) setPlayerName(savedName)
    }
  }, [])

  // Update speed and drift status from game scene
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        if ((window as any).currentSpeed !== undefined) {
          setCurrentSpeed((window as any).currentSpeed)
        }
        if ((window as any).isDrifting !== undefined) {
          setIsDrifting((window as any).isDrifting)
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const handleCreateLobby = async () => {
    if (!playerName.trim()) return
    localStorage.setItem("playerName", playerName)
    setIsCreatingLobby(true)

    try {
      const code = await createLobby(playerName, selectedTrack)
      setLobbyCode(code)
      setGameState("lobby")
    } catch (error) {
      console.error("Failed to create lobby:", error)
    } finally {
      setIsCreatingLobby(false)
    }
  }

  const handleJoinLobby = async () => {
    if (!playerName.trim() || !lobbyCode.trim()) return
    localStorage.setItem("playerName", playerName)

    try {
      await joinLobby(lobbyCode, playerName)
      setGameState("lobby")
    } catch (error) {
      console.error("Failed to join lobby:", error)
    }
  }

  const handleStartRace = () => {
    startRace()
    setGameState("racing")
  }

  const handleBackToMenu = () => {
    leaveGame()
    setGameState("menu")
    setLobbyCode("")
  }

  const handleRaceFinish = () => {
    setGameState("results")
  }

  if (showSettings) {
    return (
      <SettingsPanel settings={settings} onUpdateSettings={updateSettings} onClose={() => setShowSettings(false)} />
    )
  }

  if (gameState === "racing") {
    return (
      <div className="w-full h-screen relative">
        <Canvas shadows camera={{ fov: 75, position: [0, 5, 10] }}>
          <Physics gravity={[0, -9.81, 0]}>
            <Sky sunPosition={[100, 20, 100]} />
            <Environment preset="sunset" />
            <GameScene trackId={selectedTrack} players={players} settings={settings} onRaceFinish={handleRaceFinish} />
          </Physics>
        </Canvas>

        {/* Enhanced HUD */}
        <div className="absolute top-4 left-4 text-white">
          <div className="bg-black/60 rounded-lg p-4 space-y-2">
            <div className="text-sm">
              Position: {players.length > 0 ? "1/" + (players.length + 1) : "Single Player"}
            </div>
            <div className="text-sm">Lap: 1/3</div>
            <div className="text-lg font-bold">Speed: {currentSpeed} mph</div>
            {isDrifting && <div className="text-sm text-orange-400 font-bold animate-pulse">DRIFTING!</div>}
          </div>
        </div>

        {/* Controls Help */}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="bg-black/60 rounded-lg p-3 text-xs space-y-1">
            <div>W/↑ - Accelerate</div>
            <div>S/↓ - Reverse</div>
            <div>A/← D/→ - Steer</div>
            <div>Space - Brake</div>
            <div>Shift - Drift</div>
          </div>
        </div>

        <div className="absolute top-4 right-4">
          <Button variant="secondary" onClick={handleBackToMenu} className="bg-black/50 hover:bg-black/70">
            Leave Race
          </Button>
        </div>
      </div>
    )
  }

  if (gameState === "results") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Race Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {raceResults.map((result, index) => (
                <div
                  key={result.playerId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0
                      ? "bg-yellow-100 border-2 border-yellow-400"
                      : index === 1
                        ? "bg-gray-100 border-2 border-gray-400"
                        : index === 2
                          ? "bg-orange-100 border-2 border-orange-400"
                          : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={index < 3 ? "default" : "secondary"}>#{index + 1}</Badge>
                    <span className="font-medium">{result.playerName}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{result.totalTime}</div>
                    <div className="text-xs text-gray-500">Best: {result.bestLap}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleStartRace} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Race Again
              </Button>
              <Button variant="outline" onClick={handleBackToMenu} className="flex-1">
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "lobby") {
    const currentPlayer = players.find((p) => p.name === playerName)
    const isHost = currentPlayer?.isHost

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Race Lobby
              </span>
              <Badge variant="secondary">Code: {lobbyCode}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Selected Track</Label>
              <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                <div className="font-medium">{TRACKS.find((t) => t.id === selectedTrack)?.name}</div>
                <div className="text-sm text-gray-600">{TRACKS.find((t) => t.id === selectedTrack)?.description}</div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Players ({players.length}/8)</Label>
              <div className="mt-2 space-y-2">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{player.name}</span>
                    <div className="flex gap-2">
                      {player.isHost && <Badge variant="default">Host</Badge>}
                      <Badge variant={player.ready ? "default" : "secondary"}>
                        {player.ready ? "Ready" : "Not Ready"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {isHost ? (
                <Button
                  onClick={handleStartRace}
                  className="flex-1"
                  disabled={players.length < 2 || !players.every((p) => p.ready)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Race
                </Button>
              ) : (
                <Button className="flex-1" disabled>
                  Waiting for host to start...
                </Button>
              )}
              <Button variant="outline" onClick={handleBackToMenu}>
                Leave Lobby
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">PolyTrack</h1>
          <p className="text-xl text-white/80">Multiplayer Low-Poly Racing</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Single Player */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Single Player
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="singlePlayerName">Player Name</Label>
                <Input
                  id="singlePlayerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                />
              </div>

              <div>
                <Label htmlFor="singleTrack">Select Track</Label>
                <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRACKS.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        <div>
                          <div className="font-medium">{track.name}</div>
                          <div className="text-xs text-gray-500">
                            {track.difficulty} • {track.length}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => {
                  if (playerName.trim()) {
                    localStorage.setItem("playerName", playerName)
                    setGameState("racing")
                  }
                }}
                className="w-full"
                disabled={!playerName.trim()}
              >
                Start Race
              </Button>
            </CardContent>
          </Card>

          {/* Create Lobby */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Lobby
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="playerName">Player Name</Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                />
              </div>

              <div>
                <Label htmlFor="track">Select Track</Label>
                <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRACKS.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        <div>
                          <div className="font-medium">{track.name}</div>
                          <div className="text-xs text-gray-500">
                            {track.difficulty} • {track.length}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCreateLobby} className="w-full" disabled={!playerName.trim() || isCreatingLobby}>
                {isCreatingLobby ? "Creating..." : "Create Lobby"}
              </Button>
            </CardContent>
          </Card>

          {/* Join Lobby */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join Lobby
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="joinPlayerName">Player Name</Label>
                <Input
                  id="joinPlayerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                />
              </div>

              <div>
                <Label htmlFor="lobbyCode">Lobby Code</Label>
                <Input
                  id="lobbyCode"
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                  placeholder="Enter lobby code"
                  maxLength={6}
                />
              </div>

              <Button onClick={handleJoinLobby} className="w-full" disabled={!playerName.trim() || !lobbyCode.trim()}>
                Join Lobby
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Track Preview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Track Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {TRACKS.map((track) => (
                <div
                  key={track.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTrack === track.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  <div className="aspect-video bg-gradient-to-br from-green-400 to-blue-500 rounded mb-3"></div>
                  <h3 className="font-medium">{track.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{track.description}</p>
                  <div className="flex justify-between text-xs">
                    <Badge variant="outline">{track.difficulty}</Badge>
                    <span className="text-gray-500">{track.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Button */}
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
