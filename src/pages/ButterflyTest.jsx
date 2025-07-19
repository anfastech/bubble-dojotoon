import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Butterfly from '../components/Butterfly';

const ButterflyTest = () => {
  const [size, setSize] = useState(1);
  const [index, setIndex] = useState(0);

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
        <label style={{ marginLeft: 20 }}>
          Index:
          <input
            type="number"
            min={0}
            max={5}
            value={index}
            onChange={e => setIndex(Number(e.target.value))}
            style={{ width: 40, marginLeft: 5 }}
          />
        </label>
      </div>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.8} />
        <Butterfly index={index} size={size} position={[0, 0, 0.2]} />
      </Canvas>
    </div>
  );
};

export default ButterflyTest; 