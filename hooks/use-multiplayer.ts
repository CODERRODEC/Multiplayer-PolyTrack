"use client"

import { useState, useEffect, useCallback } from "react"
import type { Player, RaceResult } from "../types/game"

// Mock WebSocket implementation for demo purposes
class MockWebSocket {
  private listeners: { [key: string]: Function[] } = {}
  private static instance: MockWebSocket

  static getInstance() {
    if (!MockWebSocket.instance) {
      MockWebSocket.instance = new MockWebSocket()
    }
    return MockWebSocket.instance
  }

  addEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  removeEventListener(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
    }
  }

  send(data: string) {
    // Simulate server response
    setTimeout(() => {
      const message = JSON.parse(data)
      this.simulateServerResponse(message)
    }, 100)
  }

  private simulateServerResponse(message: any) {
    switch (message.type) {
      case "create_lobby":
        this.emit("message", {
          type: "lobby_created",
          lobbyCode: this.generateLobbyCode(),
          players: [
            {
              id: "player1",
              name: message.playerName,
              isHost: true,
              ready: true,
            },
          ],
        })
        break
      case "join_lobby":
        this.emit("message", {
          type: "lobby_joined",
          players: [
            { id: "player1", name: "Host", isHost: true, ready: true },
            { id: "player2", name: message.playerName, isHost: false, ready: false },
          ],
        })
        break
      case "start_race":
        this.emit("message", { type: "race_started" })
        break
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback({ data: JSON.stringify(data) }))
    }
  }

  private generateLobbyCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }
}

export function useMultiplayer() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [raceResults, setRaceResults] = useState<RaceResult[]>([])
  const [ws, setWs] = useState<MockWebSocket | null>(null)

  useEffect(() => {
    const websocket = MockWebSocket.getInstance()
    setWs(websocket)
    setIsConnected(true)

    const handleMessage = (event: any) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case "lobby_created":
        case "lobby_joined":
          setPlayers(data.players)
          break
        case "player_joined":
          setPlayers((prev) => [...prev, data.player])
          break
        case "player_left":
          setPlayers((prev) => prev.filter((p) => p.id !== data.playerId))
          break
        case "race_started":
          // Handle race start
          break
        case "race_finished":
          setRaceResults(data.results)
          break
      }
    }

    websocket.addEventListener("message", handleMessage)

    return () => {
      websocket.removeEventListener("message", handleMessage)
    }
  }, [])

  const createLobby = useCallback(
    async (playerName: string, trackId: string): Promise<string> => {
      return new Promise((resolve) => {
        if (ws) {
          ws.send(
            JSON.stringify({
              type: "create_lobby",
              playerName,
              trackId,
            }),
          )

          // Mock response
          setTimeout(() => {
            resolve("ABC123")
          }, 200)
        }
      })
    },
    [ws],
  )

  const joinLobby = useCallback(
    async (lobbyCode: string, playerName: string) => {
      if (ws) {
        ws.send(
          JSON.stringify({
            type: "join_lobby",
            lobbyCode,
            playerName,
          }),
        )
      }
    },
    [ws],
  )

  const startRace = useCallback(() => {
    if (ws) {
      ws.send(JSON.stringify({ type: "start_race" }))
    }
  }, [ws])

  const leaveGame = useCallback(() => {
    setPlayers([])
    setRaceResults([])
  }, [])

  // Mock race results for demo
  useEffect(() => {
    if (players.length > 0) {
      const mockResults: RaceResult[] = players.map((player, index) => ({
        playerId: player.id,
        playerName: player.name,
        position: index + 1,
        totalTime: `${2 + index}:${30 + index * 5}.${Math.floor(Math.random() * 100)}`,
        bestLap: `0:${45 + index * 2}.${Math.floor(Math.random() * 100)}`,
        lapTimes: [
          `0:${45 + index * 2}.${Math.floor(Math.random() * 100)}`,
          `0:${47 + index * 2}.${Math.floor(Math.random() * 100)}`,
          `0:${46 + index * 2}.${Math.floor(Math.random() * 100)}`,
        ],
      }))
      setRaceResults(mockResults)
    }
  }, [players])

  return {
    players,
    isConnected,
    raceResults,
    createLobby,
    joinLobby,
    startRace,
    leaveGame,
  }
}
