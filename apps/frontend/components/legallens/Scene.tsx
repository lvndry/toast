"use client";

import * as THREE from "three";

import { useRef } from "react";

import {
  Environment,
  Float,
  MeshWobbleMaterial,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";

function LegalDocument() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} rotation={[0, -0.2, 0]}>
        <planeGeometry args={[3, 4, 32, 32]} />
        <MeshWobbleMaterial
          color="#ffffff"
          factor={0.1}
          speed={1}
          roughness={0.1}
          metalness={0.05}
        />
        {/* Abstract "Legal Text" lines */}
        <group position={[0, 0, 0.01]}>
          {[...Array(20)].map((_, i) => (
            <mesh key={i} position={[0, 1.5 - i * 0.15, 0]}>
              <planeGeometry args={[2.2, 0.05]} />
              <meshBasicMaterial color="#001F3F" opacity={0.15} transparent />
            </mesh>
          ))}
        </group>
      </mesh>
    </Float>
  );
}

export default function Scene() {
  return (
    <div className="absolute inset-0 z-0 bg-transparent">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight
          position={[-10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
        />
        <Environment preset="city" background={false} />

        <group position={[1.5, 0, 0]}>
          <LegalDocument />
        </group>

        {/* Floating AI "Analysis" Orbs */}
        <Float speed={5} rotationIntensity={2} floatIntensity={2}>
          <mesh position={[-2, 1, -1]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial
              color="#00BFFF"
              emissive="#00BFFF"
              emissiveIntensity={2}
            />
          </mesh>
        </Float>
        <Float speed={4} rotationIntensity={1.5} floatIntensity={1.5}>
          <mesh position={[-1.5, -1.2, 1]}>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={1}
            />
          </mesh>
        </Float>
      </Canvas>
    </div>
  );
}
