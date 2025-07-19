import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlassBubble = ({ position, onClick, children, scale = 1 }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const bubbleColor = useMemo(() => {
    const colors = [
      new THREE.Color(0.4, 0.8, 1.0), // Blue
      new THREE.Color(0.8, 0.4, 1.0), // Purple
      new THREE.Color(0.4, 1.0, 0.8), // Green
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
          opacity={0.3}
          roughness={0}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          transmission={0.9}
          thickness={0.5}
          ior={1.33}
        />
      </mesh>
      {children}
    </group>
  );
};

export default GlassBubble;