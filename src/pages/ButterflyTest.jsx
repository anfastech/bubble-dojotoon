import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Butterfly from '../components/Butterfly';

const COLOR_GROUPS = [
  { name: 'Red/Orange', index: 0 },
  { name: 'Yellow/Green', index: 2 },
  { name: 'Blue/Cyan', index: 4 },
  { name: 'Purple', index: 6 },
];

const ButterflyTest = () => {
  const [size, setSize] = useState(1);
  const [colorGroup, setColorGroup] = useState(2); // index in COLOR_GROUPS

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
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
        <div style={{ marginTop: 16 }}>
          Color Group:
          {COLOR_GROUPS.map((group, i) => (
            <button
              key={group.name}
              onClick={() => setColorGroup(i)}
              style={{
                marginLeft: 10,
                padding: '4px 12px',
                borderRadius: 6,
                border: colorGroup === i ? '2px solid #333' : '1px solid #aaa',
                background: colorGroup === i ? '#fff' : '#eee',
                fontWeight: colorGroup === i ? 'bold' : 'normal',
                cursor: 'pointer',
              }}
            >
              {group.name}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 8, fontWeight: 'bold' }}>
          Current: {COLOR_GROUPS[colorGroup].name} (Index: {COLOR_GROUPS[colorGroup].index})
        </div>
      </div>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.8} />
        <Butterfly 
          key={`butterfly-${colorGroup}`}
          index={COLOR_GROUPS[colorGroup].index} 
          size={size} 
          position={[0, 0, 0.2]} 
        />
      </Canvas>
    </div>
  );
};

export default ButterflyTest; 