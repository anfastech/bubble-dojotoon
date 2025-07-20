import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlassBubble = ({ children, position = [0,0,0], scale = 1, onClick }) => {
  const meshRef = useRef();

  // Simplified bubble animation to prevent conflicts
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Very gentle floating - reduced intensity to prevent conflicts
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.2) * 0.02;
      // Remove rotation to prevent z-fighting with butterfly
      meshRef.current.rotation.set(0, 0, 0);
    }
  });

  return (
    <group ref={meshRef} scale={[scale, scale, scale]} onClick={onClick}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={'#ffffff'}
          transparent={true}
          opacity={0.3}
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.9}
          thickness={0.3}
          ior={1.2}
          side={THREE.DoubleSide}
          depthWrite={false}
          depthTest={true}
        />
      </mesh>
      {children}
    </group>
  );
};

export default GlassBubble;
