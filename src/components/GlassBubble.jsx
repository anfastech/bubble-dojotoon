import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlassBubble = ({ children, position = [0,0,0], scale = 1, onClick }) => {
  const meshRef = useRef();

  // Bubble floating animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.3) * 0.04;
      // Remove all rotation to prevent visibility issues
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
          opacity={0.2}
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.9}
          thickness={0.3}
          ior={1.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {children}
    </group>
  );
};

export default GlassBubble;
