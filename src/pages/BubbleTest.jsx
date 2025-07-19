import React, { useState } from 'react';
import { Canvas, extend } from '@react-three/fiber';
import { Environment, Shadow, OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';

function Bubble({ scale }) {
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
    </mesh>
  );
}

const BubbleTest = () => {
  const [size, setSize] = useState(1);
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#eef' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <label>
          Size:
          <input
            type="range"
            min={0.2}
            max={2}
            step={0.01}
            value={size}
            onChange={e => setSize(Number(e.target.value))}
            style={{ margin: '0 10px' }}
          />
          {size.toFixed(2)}
        </label>
      </div>
      <Canvas camera={{ position: [0, 0, 5], fov: 65 }}>
        <Float floatIntensity={1.5} speed={0.5}>
          <Bubble scale={size} />
        </Float>
        <Shadow scale={2} position={[0, -1.35, 0]} opacity={0.15} />
        <OrbitControls />
        <Environment preset="apartment" background blur={1} />
      </Canvas>
    </div>
  );
};

export default BubbleTest; 