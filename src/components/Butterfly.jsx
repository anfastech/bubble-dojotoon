import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const Butterfly = ({ image, position, isFlying = false, onAnimationComplete }) => {
  const meshRef = useRef();
  
  // Load texture only when needed
  const texture = useMemo(() => {
    if (isFlying) return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(image);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, [image, isFlying]);

  useFrame((state) => {
    if (meshRef.current && !isFlying) {
      // Gentle flutter animation inside bubble
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  if (isFlying) {
    return (
      <motion.div
        className="fixed z-50 pointer-events-none"
        style={{
          left: position[0],
          top: position[1],
          width: '120px',
          height: '120px',
        }}
        initial={{ scale: 1, x: 0, y: 0, rotate: 0 }}
        animate={{
          scale: [1, 1.5, 0.8],
          x: [0, 200, 400, 600],
          y: [0, -100, -200, -400],
          rotate: [0, 15, -10, 25],
        }}
        transition={{
          duration: 3,
          ease: "easeOut",
          times: [0, 0.3, 0.7, 1],
        }}
        onAnimationComplete={onAnimationComplete}
      >
        <motion.img
          src={image}
          alt="Flying butterfly"
          className="w-full h-full object-contain"
          animate={{
            rotateY: [0, 10, -10, 5, 0],
            scale: [1, 1.1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    );
  }

  return (
    <sprite ref={meshRef} scale={[1.2, 1.2, 1.2]} position={[0, 0, 0.2]}>
      <spriteMaterial 
        map={texture}
        transparent 
        opacity={1.0}
        alphaTest={0.1}
        side={THREE.DoubleSide}
      />
    </sprite>
  );
};

export default Butterfly;