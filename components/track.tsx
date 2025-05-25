"use client"

import { RigidBody } from "@react-three/rapier"

interface TrackProps {
  trackId: string
}

export default function Track({ trackId }: TrackProps) {
  const getTrackLayout = () => {
    switch (trackId) {
      case "mountain-circuit":
        return <MountainCircuit />
      case "desert-speedway":
        return <DesertSpeedway />
      case "forest-rally":
        return <ForestRally />
      default:
        return <MountainCircuit />
    }
  }

  return <group>{getTrackLayout()}</group>
}

function createSimpleTrack(waypoints: Array<{ x: number; z: number; y?: number }>, trackWidth = 12) {
  const trackSegments = []
  const barriers = []
  const guidanceElements = []
  const segmentLength = 20 // Much larger segments for better performance

  for (let i = 0; i < waypoints.length; i++) {
    const current = waypoints[i]
    const next = waypoints[(i + 1) % waypoints.length]

    const dx = next.x - current.x
    const dz = next.z - current.z
    const dy = (next.y || 0) - (current.y || 0)
    const totalDistance = Math.sqrt(dx * dx + dz * dz)
    const numSegments = Math.max(1, Math.ceil(totalDistance / segmentLength))

    for (let j = 0; j < numSegments; j++) {
      const t = j / numSegments
      const nextT = (j + 1) / numSegments

      const startX = current.x + dx * t
      const startZ = current.z + dz * t
      const startY = (current.y || 0) + dy * t

      const endX = current.x + dx * nextT
      const endZ = current.z + dz * nextT
      const endY = (current.y || 0) + dy * nextT

      const segmentDx = endX - startX
      const segmentDz = endZ - startZ
      const segmentDy = endY - startY
      const segmentDistance = Math.sqrt(segmentDx * segmentDx + segmentDz * segmentDz)

      if (segmentDistance < 2) continue

      const angle = Math.atan2(segmentDx, segmentDz)
      const slope = Math.atan2(segmentDy, segmentDistance)

      const segmentX = startX + segmentDx / 2
      const segmentZ = startZ + segmentDz / 2
      const segmentY = startY + segmentDy / 2

      // Track segment
      trackSegments.push({
        position: [segmentX, segmentY, segmentZ],
        rotation: [slope, angle, 0],
        size: [trackWidth, 1, segmentDistance],
        key: `track-${i}-${j}`,
      })

      // Barriers - properly positioned outside track bounds
      const barrierOffset = trackWidth / 2 + 2.5 // Increased offset to prevent overlap
      const barrierHeight = 3

      const leftX = segmentX - Math.cos(angle) * barrierOffset
      const leftZ = segmentZ + Math.sin(angle) * barrierOffset
      const rightX = segmentX + Math.cos(angle) * barrierOffset
      const rightZ = segmentZ - Math.sin(angle) * barrierOffset

      barriers.push(
        {
          position: [leftX, segmentY + barrierHeight / 2, leftZ],
          rotation: [slope, angle, 0],
          size: [1.5, barrierHeight, segmentDistance],
          key: `barrier-left-${i}-${j}`,
        },
        {
          position: [rightX, segmentY + barrierHeight / 2, rightZ],
          rotation: [slope, angle, 0],
          size: [1.5, barrierHeight, segmentDistance],
          key: `barrier-right-${i}-${j}`,
        },
      )

      // Simplified guidance - only arrows every 4 segments
      if (j === 0 && i % 4 === 0) {
        guidanceElements.push({
          type: "arrow",
          position: [segmentX, segmentY + 1, segmentZ],
          rotation: [0, angle, 0],
          key: `arrow-${i}`,
        })
      }
    }
  }

  return { trackSegments, barriers, guidanceElements }
}

function MountainCircuit() {
  // Simplified, non-intersecting circuit
  const waypoints = [
    { x: 0, z: 0, y: 0 },
    { x: 0, z: -60, y: 0 },
    { x: 30, z: -120, y: 8 },
    { x: 80, z: -150, y: 20 },
    { x: 140, z: -140, y: 25 },
    { x: 180, z: -100, y: 25 },
    { x: 200, z: -40, y: 25 },
    { x: 180, z: 20, y: 20 },
    { x: 140, z: 60, y: 15 },
    { x: 80, z: 80, y: 8 },
    { x: 20, z: 70, y: 2 },
    { x: -20, z: 40, y: 0 },
    { x: -40, z: 0, y: 0 },
    { x: -40, z: -40, y: 2 },
    { x: -20, z: -80, y: 8 },
    { x: 20, z: -100, y: 15 },
    { x: 60, z: -90, y: 12 },
    { x: 80, z: -60, y: 8 },
    { x: 60, z: -30, y: 4 },
    { x: 20, z: -20, y: 0 },
  ]

  const { trackSegments, barriers, guidanceElements } = createSimpleTrack(waypoints, 16)

  return (
    <group>
      {/* Track surface - single RigidBody for all segments */}
      <RigidBody type="fixed" colliders="trimesh">
        <group>
          {trackSegments.map((segment) => (
            <mesh
              key={segment.key}
              receiveShadow
              position={segment.position as [number, number, number]}
              rotation={segment.rotation as [number, number, number]}
            >
              <boxGeometry args={segment.size as [number, number, number]} />
              <meshStandardMaterial color="#444" roughness={0.9} />
            </mesh>
          ))}
        </group>
      </RigidBody>

      {/* Track markings */}
      {trackSegments.map((segment) => (
        <group key={`markings-${segment.key}`}>
          {/* Center line */}
          <mesh
            receiveShadow
            position={[segment.position[0], segment.position[1] + 0.51, segment.position[2]]}
            rotation={segment.rotation as [number, number, number]}
          >
            <boxGeometry args={[0.5, 0.02, segment.size[2]]} />
            <meshStandardMaterial color="#ffff00" />
          </mesh>

          {/* Edge lines */}
          <mesh
            receiveShadow
            position={[
              segment.position[0] - Math.cos(segment.rotation[1]) * (segment.size[0] / 2 - 1),
              segment.position[1] + 0.51,
              segment.position[2] + Math.sin(segment.rotation[1]) * (segment.size[0] / 2 - 1),
            ]}
            rotation={segment.rotation as [number, number, number]}
          >
            <boxGeometry args={[0.4, 0.02, segment.size[2]]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh
            receiveShadow
            position={[
              segment.position[0] + Math.cos(segment.rotation[1]) * (segment.size[0] / 2 - 1),
              segment.position[1] + 0.51,
              segment.position[2] - Math.sin(segment.rotation[1]) * (segment.size[0] / 2 - 1),
            ]}
            rotation={segment.rotation as [number, number, number]}
          >
            <boxGeometry args={[0.4, 0.02, segment.size[2]]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Barriers - single RigidBody for all barriers */}
      <RigidBody type="fixed" colliders="trimesh">
        <group>
          {barriers.map((barrier) => (
            <mesh
              key={barrier.key}
              castShadow
              position={barrier.position as [number, number, number]}
              rotation={barrier.rotation as [number, number, number]}
            >
              <boxGeometry args={barrier.size as [number, number, number]} />
              <meshStandardMaterial color="#cc3333" />
            </mesh>
          ))}
        </group>
      </RigidBody>

      {/* Simplified guidance arrows */}
      {guidanceElements.map((element) => (
        <mesh
          key={element.key}
          position={element.position as [number, number, number]}
          rotation={element.rotation as [number, number, number]}
        >
          <coneGeometry args={[1.2, 2.5]} />
          <meshStandardMaterial color="#00dd00" />
        </mesh>
      ))}

      <StartFinishLine position={[0, 0.5, 5]} type="start" />
      <StartFinishLine position={[0, 0.5, -30]} type="finish" />
    </group>
  )
}

function DesertSpeedway() {
  // Simple oval for high-speed racing
  const waypoints = [
    { x: 0, z: 0, y: 0 },
    { x: 0, z: -100, y: 0 },
    { x: 40, z: -180, y: 3 },
    { x: 120, z: -220, y: 5 },
    { x: 200, z: -180, y: 3 },
    { x: 240, z: -100, y: 0 },
    { x: 240, z: 0, y: 0 },
    { x: 240, z: 100, y: 0 },
    { x: 200, z: 180, y: 3 },
    { x: 120, z: 220, y: 5 },
    { x: 40, z: 180, y: 3 },
    { x: 0, z: 100, y: 0 },
  ]

  const { trackSegments, barriers, guidanceElements } = createSimpleTrack(waypoints, 20)

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <group>
          {trackSegments.map((segment) => (
            <mesh
              key={segment.key}
              receiveShadow
              position={segment.position as [number, number, number]}
              rotation={segment.rotation as [number, number, number]}
            >
              <boxGeometry args={segment.size as [number, number, number]} />
              <meshStandardMaterial color="#444" roughness={0.9} />
            </mesh>
          ))}
        </group>
      </RigidBody>

      {trackSegments.map((segment) => (
        <mesh
          key={`line-${segment.key}`}
          receiveShadow
          position={[segment.position[0], segment.position[1] + 0.51, segment.position[2]]}
          rotation={segment.rotation as [number, number, number]}
        >
          <boxGeometry args={[0.5, 0.02, segment.size[2]]} />
          <meshStandardMaterial color="#ffff00" />
        </mesh>
      ))}

      <RigidBody type="fixed" colliders="trimesh">
        <group>
          {barriers.map((barrier) => (
            <mesh
              key={barrier.key}
              castShadow
              position={barrier.position as [number, number, number]}
              rotation={barrier.rotation as [number, number, number]}
            >
              <boxGeometry args={barrier.size as [number, number, number]} />
              <meshStandardMaterial color="#cc3333" />
            </mesh>
          ))}
        </group>
      </RigidBody>

      {guidanceElements.map((element) => (
        <mesh
          key={element.key}
          position={element.position as [number, number, number]}
          rotation={element.rotation as [number, number, number]}
        >
          <coneGeometry args={[1.2, 2.5]} />
          <meshStandardMaterial color="#00dd00" />
        </mesh>
      ))}

      <StartFinishLine position={[0, 0.5, 15]} type="start" />
      <StartFinishLine position={[0, 0.5, -50]} type="finish" />
    </group>
  )
}

function ForestRally() {
  // Technical but clear winding track
  const waypoints = [
    { x: 0, z: 0, y: 0 },
    { x: 20, z: -40, y: 3 },
    { x: 10, z: -80, y: 8 },
    { x: -20, z: -100, y: 12 },
    { x: -50, z: -90, y: 15 },
    { x: -70, z: -60, y: 12 },
    { x: -60, z: -20, y: 8 },
    { x: -30, z: 10, y: 3 },
    { x: 0, z: 20, y: 0 },
    { x: 25, z: 10, y: 0 },
  ]

  const { trackSegments, barriers, guidanceElements } = createSimpleTrack(waypoints, 14)

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <group>
          {trackSegments.map((segment) => (
            <mesh
              key={segment.key}
              receiveShadow
              position={segment.position as [number, number, number]}
              rotation={segment.rotation as [number, number, number]}
            >
              <boxGeometry args={segment.size as [number, number, number]} />
              <meshStandardMaterial color="#444" roughness={0.9} />
            </mesh>
          ))}
        </group>
      </RigidBody>

      {trackSegments.map((segment) => (
        <mesh
          key={`line-${segment.key}`}
          receiveShadow
          position={[segment.position[0], segment.position[1] + 0.51, segment.position[2]]}
          rotation={segment.rotation as [number, number, number]}
        >
          <boxGeometry args={[0.4, 0.02, segment.size[2]]} />
          <meshStandardMaterial color="#ffff00" />
        </mesh>
      ))}

      <RigidBody type="fixed" colliders="trimesh">
        <group>
          {barriers.map((barrier) => (
            <mesh
              key={barrier.key}
              castShadow
              position={barrier.position as [number, number, number]}
              rotation={barrier.rotation as [number, number, number]}
            >
              <boxGeometry args={barrier.size as [number, number, number]} />
              <meshStandardMaterial color="#cc3333" />
            </mesh>
          ))}
        </group>
      </RigidBody>

      {guidanceElements.map((element) => (
        <mesh
          key={element.key}
          position={element.position as [number, number, number]}
          rotation={element.rotation as [number, number, number]}
        >
          <coneGeometry args={[1, 2]} />
          <meshStandardMaterial color="#00dd00" />
        </mesh>
      ))}

      <StartFinishLine position={[0, 0.5, 10]} type="start" />
      <StartFinishLine position={[0, 0.5, -25]} type="finish" />
    </group>
  )
}

function StartFinishLine({ position, type }: { position: [number, number, number]; type: "start" | "finish" }) {
  return (
    <group position={position}>
      {type === "start" ? (
        <mesh receiveShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[25, 0.04, 1.5]} />
          <meshStandardMaterial color="#00ff00" />
        </mesh>
      ) : (
        <group>
          {Array.from({ length: 25 }, (_, i) => (
            <mesh key={i} receiveShadow position={[i * 2 - 24, 0.02, 0]}>
              <boxGeometry args={[1, 0.04, 1.5]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#000000" : "#ffffff"} />
            </mesh>
          ))}
        </group>
      )}

      {/* Simple posts */}
      <mesh castShadow position={[-15, 3, 0]}>
        <boxGeometry args={[0.5, 6, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh castShadow position={[15, 3, 0]}>
        <boxGeometry args={[0.5, 6, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}
