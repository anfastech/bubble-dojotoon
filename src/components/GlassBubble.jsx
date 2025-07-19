
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlassBubble = ({ position, onClick, children, scale = 1 }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Physics-based movement that responds to internal butterfly motion
      const butterflyInfluence = {
        x: Math.cos(state.clock.elapsedTime * 1.2) * 0.02,
        y: Math.sin(state.clock.elapsedTime * 1.5) * 0.02
      };
      
      // Gentle floating with butterfly-influenced movement
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.08 + butterflyInfluence.y;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.3) * 0.04 + butterflyInfluence.x;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      
      // Subtle bubble wobble from butterfly movement
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  const bubbleColor = useMemo(() => {
    const colors = [
      new THREE.Color(0.4, 0.8, 1.0), // Blue
      new THREE.Color(0.8, 0.4, 1.0), // Purple
      new THREE.Color(0.4, 1.0, 0.8), // Green
      new THREE.Color(1.0, 0.8, 0.4), // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={[scale, scale, scale]}
        onClick={onClick}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={bubbleColor}
          transparent
          opacity={0.1}
          roughness={0.1}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.95}
          thickness={0.1}
          ior={1.2}
          side={THREE.DoubleSide}
        />
        {/* Butterfly inside the bubble mesh */}
        <group position={[0, 0, 0]}>
          {children}
        </group>
      </mesh>
    </group>
  );
};

export default GlassBubble;
