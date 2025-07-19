import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

const BubbleMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.4, 0.8, 1.0),
    opacity: 0.3,
  },
  // Vertex shader
  `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
      // Create bubble-like fresnel effect
      float fresnel = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
      fresnel = pow(1.0 - fresnel, 2.0);
      
      // Add some shimmer animation
      float shimmer = sin(vUv.x * 10.0 + time * 3.0) * 0.1 + 0.9;
      
      // Create rainbow reflection effect
      vec3 rainbow = vec3(
        sin(vUv.x * 6.28 + time) * 0.5 + 0.5,
        sin(vUv.x * 6.28 + time + 2.09) * 0.5 + 0.5,
        sin(vUv.x * 6.28 + time + 4.18) * 0.5 + 0.5
      ) * 0.3;
      
      vec3 finalColor = color + rainbow * fresnel + vec3(shimmer * 0.2);
      
      gl_FragColor = vec4(finalColor, opacity + fresnel * 0.4);
    }
  `
);

extend({ BubbleMaterial });

const GlassBubble = ({ position, onClick, children, scale = 1 }) => {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
    }
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
        <bubbleMaterial
          ref={materialRef}
          color={bubbleColor}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      {children}
    </group>
  );
};

export default GlassBubble;