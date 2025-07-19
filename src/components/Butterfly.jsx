import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const ButterflySprite = ({ image }) => {
  const meshRef = useRef();
  
  // Load texture
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(image);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, [image]);

  useFrame((state) => {
    if (meshRef.current) {
      // Very gentle flutter animation inside bubble - stay centered
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
      meshRef.current.position.x = Math.cos(state.clock.elapsedTime * 1.2) * 0.02;
    }
  });

  return (
    <sprite ref={meshRef} scale={[0.8, 0.8, 0.8]} position={[0, 0, 0.1]}>
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

const FlyingButterfly = ({ image, position, onAnimationComplete }) => {
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
};

const Butterfly = ({ image, position, isFlying = false, onAnimationComplete }) => {
  if (isFlying) {
    return (
      <FlyingButterfly 
        image={image} 
        position={position} 
        onAnimationComplete={onAnimationComplete} 
      />
    );
  }

  return <ButterflySprite image={image} />;
};

export default Butterfly;