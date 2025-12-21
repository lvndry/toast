"use client";

import * as THREE from "three";

import { memo, useEffect, useRef, useState } from "react";

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
        Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
      meshRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={meshRef} rotation={[0, -0.15, 0]}>
        <planeGeometry args={[3, 4, 32, 32]} />
        <MeshWobbleMaterial
          color="#f0f8ff"
          factor={0.08}
          speed={0.8}
          roughness={0.15}
          metalness={0.02}
        />
        {/* Abstract "Legal Text" lines */}
        <group position={[0, 0, 0.01]}>
          {[...Array(18)].map((_, i) => (
            <mesh key={i} position={[0, 1.4 - i * 0.15, 0]}>
              <planeGeometry args={[2.1 - (i % 3) * 0.3, 0.04]} />
              <meshBasicMaterial
                color="#0c4a6e" // Deep ocean blue for text
                opacity={0.15 + (i % 4) * 0.02}
                transparent
              />
            </mesh>
          ))}
        </group>
      </mesh>
    </Float>
  );
}

function OceanOrb({
  position,
  color,
  emissiveColor,
  size = 0.2,
  speed = 4,
}: {
  position: [number, number, number];
  color: string;
  emissiveColor: string;
  size?: number;
  speed?: number;
}) {
  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={1.5}>
      <mesh position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={1.5}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

function SceneContent() {
  const [isMounted, setIsMounted] = useState(false);

  // Wait for client-side mount to avoid hydration issues and Strict Mode problems
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="absolute inset-0 z-0 bg-transparent pointer-events-none" />
    );
  }

  return (
    <div className="absolute inset-0 z-0 bg-transparent pointer-events-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop="always"
        flat // Use flat mode for simpler color management
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "default",
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false, // Don't fail on low-end devices
        }}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />

        {/* Subtle ambient lighting */}
        <ambientLight intensity={0.4} color="#87CEEB" />

        {/* Main light - warm sunlight from above */}
        <pointLight position={[5, 10, 5]} intensity={0.8} color="#fff5e6" />

        {/* Secondary accent light - ocean teal */}
        <spotLight
          position={[-8, 5, 8]}
          angle={0.3}
          penumbra={1}
          intensity={0.6}
          color="#20B2AA"
        />

        {/* Subtle rim light */}
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#48D1CC" />

        <Environment preset="city" background={false} />

        {/* Legal Document */}
        <group position={[1.5, 0, 0]}>
          <LegalDocument />
        </group>

        {/* Floating "Bioluminescent" Orbs - Ocean themed */}
        {/* Main teal orb */}
        <OceanOrb
          position={[-2.2, 1.2, -1]}
          color="#20B2AA"
          emissiveColor="#20B2AA"
          size={0.22}
          speed={4}
        />

        {/* Seafoam accent */}
        <OceanOrb
          position={[-1.8, -1.3, 0.8]}
          color="#48D1CC"
          emissiveColor="#48D1CC"
          size={0.15}
          speed={5}
        />

        {/* Deep ocean blue */}
        <OceanOrb
          position={[3, 1.5, -0.5]}
          color="#0077B6"
          emissiveColor="#0077B6"
          size={0.12}
          speed={3.5}
        />

        {/* Coral accent (for contrast) */}
        <OceanOrb
          position={[-2.8, -0.5, 1.5]}
          color="#FF7F7F"
          emissiveColor="#FF6B6B"
          size={0.1}
          speed={6}
        />

        {/* Distant small orbs */}
        <OceanOrb
          position={[2.5, -1.8, -2]}
          color="#40E0D0"
          emissiveColor="#40E0D0"
          size={0.08}
          speed={4.5}
        />
      </Canvas>
    </div>
  );
}

// Memoize to prevent re-renders from parent causing canvas disposal
const Scene = memo(SceneContent);
Scene.displayName = "Scene";

export default Scene;
