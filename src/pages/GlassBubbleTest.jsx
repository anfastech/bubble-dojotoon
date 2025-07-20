import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Float } from '@react-three/drei';
import Butterfly from '../components/Butterfly';
import GlassBubble from '../components/GlassBubble';

function GlassBubbleWithButterfly({ index, scale }) {
  return (
    <GlassBubble scale={scale}>
      <Butterfly index={index} size={scale * 0.8} position={[0, 0, 0.4]} />
    </GlassBubble>
  );
}

const GlassBubbleTest = () => {
  const [bubbleSize, setBubbleSize] = useState(1);
  const [butterflySize, setButterflySize] = useState(1);
  const [colorGroup, setColorGroup] = useState(0);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1e3a8a' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, color: 'white' }}>
        <div style={{ marginBottom: 10 }}>
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
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            Butterfly Size:
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={butterflySize}
              onChange={e => setButterflySize(Number(e.target.value))}
              style={{ margin: '0 10px' }}
            />
            {butterflySize.toFixed(2)}
          </label>
        </div>
        <div>
          <label>
            Color Group:
            <select
              value={colorGroup}
              onChange={e => setColorGroup(Number(e.target.value))}
              style={{ margin: '0 10px' }}
            >
              <option value={0}>Red/Orange</option>
              <option value={1}>Yellow/Green</option>
              <option value={2}>Blue/Cyan</option>
              <option value={3}>Purple</option>
            </select>
          </label>
        </div>
      </div>
      <Canvas camera={{ position: [0, 0, 5], fov: 65 }}>
        <Float floatIntensity={1.5} speed={0.5}>
          <GlassBubbleWithButterfly 
            index={colorGroup} 
            scale={bubbleSize} 
          />
        </Float>
        <Environment preset="apartment" background={false} blur={1} />
      </Canvas>
    </div>
  );
};

export default GlassBubbleTest; 