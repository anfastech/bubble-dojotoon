import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Butterfly from './Butterfly';

const Bubble = ({ position = [0,0,0], scale = 1, butterflyProps = {}, onClick }) => {
  const meshRef = React.useRef();

  // Optional: gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.3) * 0.04;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} scale={[scale, scale, scale]} onClick={onClick}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        color={'#aaf'}
        transparent={true}
        opacity={0.25}
        roughness={0.05}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.1}
        transmission={0.8}
        thickness={0.2}
        ior={1.2}
        side={THREE.DoubleSide}
      />
      {/* Butterfly inside the bubble */}
      <Butterfly {...butterflyProps} />
    </mesh>
  );
};

export default Bubble;