import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Shadow, OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import Butterfly from '../components/Butterfly';

function GlassBubble({ scale, butterflySize }) {
  // The butterfly will move randomly inside the bubble using useFrame in Butterfly
  return (
    <mesh scale={scale}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        distort={0.25}
        transmission={1.05}
        thickness={-0.5}
        roughness={0}
        iridescence={1}
        iridescenceIOR={1}
        iridescenceThicknessRange={[0, 1200]}
        clearcoat={1}
        clearcoatRoughness={0}
        envMapIntensity={1.5}
      />
      {/* Butterfly inside the bubble, at the center, animated by its own logic */}
      <Butterfly size={butterflySize} />
    </mesh>
  );
}

const GlassBubbleTest = () => {
  const [bubbleSize, setBubbleSize] = useState(1);
  const [butterflySize, setButterflySize] = useState(0.7);
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#eef' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <label>
          Bubble Size:
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.01}
            value={bubbleSize}
            onChange={e => setBubbleSize(Number(e.target.value))}
            style={{ margin: '0 10px' }}
          />
          {bubbleSize.toFixed(2)}
        </label>
        <label style={{ marginLeft: 20 }}>
          Butterfly Size:
          <input
            type="range"
            min={0.2}
            max={1.5}
            step={0.01}
            value={butterflySize}
            onChange={e => setButterflySize(Number(e.target.value))}
            style={{ margin: '0 10px' }}
          />
          {butterflySize.toFixed(2)}
        </label>
      </div>
      <Canvas camera={{ position: [0, 0, 5], fov: 65 }}>
        <Float floatIntensity={1.5} speed={0.5}>
          <GlassBubble scale={bubbleSize} butterflySize={butterflySize} />
        </Float>
        <Shadow scale={2} position={[0, -1.35, 0]} opacity={0.15} />
        <OrbitControls />
        <Environment preset="apartment" background blur={1} />
      </Canvas>
    </div>
  );
};

export default GlassBubbleTest; 