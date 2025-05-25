"use client"

import { useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useKeyboardControls, KeyboardControls } from "@react-three/drei"
import * as THREE from "three"
import type { Player, GameSettings } from "../types/game"
import Car from "./car"
import Track from "./track"

interface GameSceneProps {
  trackId: string
  players: Player[]
  settings: GameSettings
  onRaceFinish: () => void
}

const keyMap = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
  { name: "brake", keys: ["Space"] },
  { name: "drift", keys: ["Shift"] },
]

function GameControls({ onRaceFinish }: { onRaceFinish: () => void }) {
  const { camera } = useThree()
  const carBodyRef = useRef<any>(null)
  const [, getKeys] = useKeyboardControls()

  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [isDrifting, setIsDrifting] = useState(false)

  // Enhanced performance parameters
  const maxForwardForce = 25
  const maxBackwardForce = 15
  const maxSteerForce = 4
  const brakeForce = 30
  const driftThreshold = 8
  const maxSpeed = 100

  useFrame((state, delta) => {
    if (!carBodyRef.current) return

    const { forward, backward, left, right, brake, drift } = getKeys()

    // Get current state
    const velocity = carBodyRef.current.linvel()
    const position = carBodyRef.current.translation()
    const rotation = carBodyRef.current.rotation()

    // Calculate speed and convert to MPH for display
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
    const speedMPH = Math.round(speed * 10) // Simplified conversion for better feel
    setCurrentSpeed(Math.min(speedMPH, 300))

    // Get forward direction
    const forwardDirection = new THREE.Vector3(0, 0, -1)
    forwardDirection.applyQuaternion(new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w))

    // Apply speed limit
    if (speed > maxSpeed) {
      const limitedVelocity = {
        x: (velocity.x / speed) * maxSpeed,
        y: velocity.y,
        z: (velocity.z / speed) * maxSpeed,
      }
      carBodyRef.current.setLinvel(limitedVelocity, true)
    }

    // Acceleration and deceleration
    if (forward && speed < maxSpeed) {
      const force = forwardDirection.multiplyScalar(maxForwardForce)
      carBodyRef.current.addForce({ x: force.x, y: 0, z: force.z }, true)
    } else if (backward) {
      const force = forwardDirection.multiplyScalar(-maxBackwardForce)
      carBodyRef.current.addForce({ x: force.x, y: 0, z: force.z }, true)
    }

    // Enhanced braking
    if (brake) {
      const brakeForceVector = {
        x: -velocity.x * brakeForce * delta * 60,
        y: 0,
        z: -velocity.z * brakeForce * delta * 60,
      }
      carBodyRef.current.addForce(brakeForceVector, true)
    }

    // Responsive steering based on speed
    if (speed > 2) {
      const steerMultiplier = Math.min(1, Math.max(0.3, 20 / speed)) // Better steering at all speeds

      if (left) {
        carBodyRef.current.addTorque({ x: 0, y: maxSteerForce * steerMultiplier, z: 0 }, true)
      } else if (right) {
        carBodyRef.current.addTorque({ x: 0, y: -maxSteerForce * steerMultiplier, z: 0 }, true)
      }
    }

    // Enhanced drifting mechanics
    const isDriftingNow = drift && speed > driftThreshold
    setIsDrifting(isDriftingNow)

    if (isDriftingNow) {
      // Reduce lateral grip for controlled sliding
      const driftFactor = 0.7
      const driftedVelocity = {
        x: velocity.x * driftFactor,
        y: velocity.y,
        z: velocity.z * driftFactor,
      }
      carBodyRef.current.setLinvel(driftedVelocity, true)

      // Add slight downward force during drift
      carBodyRef.current.addForce({ x: 0, y: -5, z: 0 }, true)
    }

    // Constant downforce for track adhesion
    carBodyRef.current.addForce({ x: 0, y: -Math.max(5, speed * 0.5), z: 0 }, true)

    // Smooth camera following
    const cameraOffset = new THREE.Vector3(0, 10, 18)
    const carQuaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    cameraOffset.applyQuaternion(carQuaternion)

    const targetCameraPosition = new THREE.Vector3(position.x, position.y + 2, position.z).add(cameraOffset)
    camera.position.lerp(targetCameraPosition, 0.08)

    const lookAtTarget = new THREE.Vector3(position.x, position.y + 1, position.z)
    camera.lookAt(lookAtTarget)

    // Update HUD values
    ;(window as any).currentSpeed = speedMPH
    ;(window as any).isDrifting = isDriftingNow
  })

  return (
    <RigidBody
      ref={carBodyRef}
      type="dynamic"
      position={[0, 4, 0]}
      colliders="cuboid"
      mass={1.2}
      restitution={0.1}
      friction={1.8}
      linearDamping={0.3}
      angularDamping={0.9}
    >
      <Car color="#ff4444" />
    </RigidBody>
  )
}

export default function GameScene({ trackId, players, settings, onRaceFinish }: GameSceneProps) {
  return (
    <KeyboardControls map={keyMap}>
      {/* Optimized lighting for performance */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[30, 40, 20]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
        shadow-camera-far={80}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      {/* Track */}
      <Track trackId={trackId} />

      {/* Player Car */}
      <GameControls onRaceFinish={onRaceFinish} />

      {/* Other Players - simplified */}
      {players
        .filter((p) => p.name !== "Player")
        .slice(0, 3) // Limit to 3 other players for performance
        .map((player, index) => (
          <RigidBody key={player.id} type="dynamic" position={[index * 5, 4, 10]} colliders="cuboid">
            <Car color={`hsl(${index * 120}, 70%, 50%)`} />
          </RigidBody>
        ))}

      {/* Simplified ground */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -8, 0]}>
          <boxGeometry args={[400, 12, 400]} />
          <meshStandardMaterial color="#2a4d1a" />
        </mesh>
      </RigidBody>
    </KeyboardControls>
  )
}
