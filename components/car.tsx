"use client"

import { useRef } from "react"
import type * as THREE from "three"

interface CarProps {
  color?: string
  position?: [number, number, number]
}

export default function Car({ color = "#ff4444", position = [0, 0, 0] }: CarProps) {
  const carRef = useRef<THREE.Group>(null)

  return (
    <group ref={carRef} position={position}>
      {/* Streamlined car body for better performance */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.8, 4]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Simplified roof */}
      <mesh castShadow position={[0, 0.6, 0.4]}>
        <boxGeometry args={[1.6, 0.8, 2.4]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Optimized wheels */}
      <group>
        {[
          [-1.1, -0.5, -1.4],
          [1.1, -0.5, -1.4],
          [-1.1, -0.5, 1.4],
          [1.1, -0.5, 1.4],
        ].map((pos, i) => (
          <mesh key={i} castShadow position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.4]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        ))}
      </group>

      {/* Simple lights */}
      <mesh castShadow position={[-0.7, 0.2, -2.1]}>
        <sphereGeometry args={[0.18]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffffcc" emissiveIntensity={0.6} />
      </mesh>
      <mesh castShadow position={[0.7, 0.2, -2.1]}>
        <sphereGeometry args={[0.18]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffffcc" emissiveIntensity={0.6} />
      </mesh>

      {/* Rear lights */}
      <mesh castShadow position={[-0.7, 0.2, 2.1]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      <mesh castShadow position={[0.7, 0.2, 2.1]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}
