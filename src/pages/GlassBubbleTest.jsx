import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import Butterfly from '../components/Butterfly';
import GlassBubble from '../components/GlassBubble';

const COLOR_GROUPS = [
  { name: 'Red/Orange', index: 0 },
  { name: 'Yellow/Green', index: 2 },
  { name: 'Blue/Cyan', index: 4 },
  { name: 'Purple', index: 6 },
];

function GlassBubbleWithButterfly({ index, scale, onPop }) {
  const [isPopped, setIsPopped] = useState(false);
  const [isFlying, setIsFlying] = useState(false);

  const handleBubbleClick = () => {
    if (!isPopped) {
      setIsPopped(true);
      setIsFlying(true);
      if (onPop) onPop();
    }
  };

  const handleFlyComplete = () => {
    setIsFlying(false);
  };

  // Don't render the bubble if it's popped, but keep the flying butterfly
  if (isPopped) {
    return (
      <Butterfly 
        key={`flying-butterfly-${index}`}
        index={COLOR_GROUPS[index].index} 
        size={scale * 0.8} 
        position={[0, 0, 0.4]} 
        isFlying={isFlying}
        onFlyComplete={handleFlyComplete}
        debug={true}
      />
    );
  }

  return (
    <GlassBubble scale={scale} onClick={handleBubbleClick}>
      <Butterfly 
        key={`butterfly-${index}`}
        index={COLOR_GROUPS[index].index} 
        size={scale * 0.8} 
        position={[0, 0, 0.4]} 
        isFlying={isFlying}
        onFlyComplete={handleFlyComplete}
        debug={true}
      />
    </GlassBubble>
  );
}

const GlassBubbleTest = () => {
  const [bubbleSize, setBubbleSize] = useState(1);
  const [butterflySize, setButterflySize] = useState(1);
  const [colorGroup, setColorGroup] = useState(0);
  const [renderKey, setRenderKey] = useState(0);
  const [popCount, setPopCount] = useState(0);
  const [isPopped, setIsPopped] = useState(false);
  const [respawnKey, setRespawnKey] = useState(0);
  const [flyingButterfly, setFlyingButterfly] = useState(null);

  // Trigger initial re-render when page loads
  React.useEffect(() => {
    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      setRenderKey(prev => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePop = () => {
    setPopCount(prev => prev + 1);
    setIsPopped(true);
    
    // Set the flying butterfly (only one at a time)
    const newFlyingButterfly = {
      id: Date.now(),
      index: colorGroup,
      scale: bubbleSize,
      position: [0, 0, 0.4]
    };
    setFlyingButterfly(newFlyingButterfly);
    
    // Respawn after a short delay
    setTimeout(() => {
      setIsPopped(false);
      // Pick a random new color group
      const newColorGroup = Math.floor(Math.random() * COLOR_GROUPS.length);
      setColorGroup(newColorGroup);
      setRespawnKey(prev => prev + 1);
    }, 2000); // 2 second delay before respawn
  };

  const handleFlyComplete = () => {
    setFlyingButterfly(null); // Clear the flying butterfly
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#87CEEB' }}>
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
        <div style={{ marginBottom: 10 }}>
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
        <div style={{ marginTop: 8, color: '#ff6b6b' }}>
          💥 Pops: {popCount} - Click the bubble to pop it!
        </div>
        <div style={{ marginTop: 8, fontSize: '12px', opacity: 0.8 }}>
          🔴 Debug Points: Red (top-left), Green (top-right), Blue (bottom-left), Yellow (bottom-right), Purple (head), Orange (tail)
        </div>
        {isPopped && (
          <div style={{ marginTop: 8, color: '#4CAF50', fontWeight: 'bold' }}>
            🦋 Butterfly flew away! New bubble respawning...
          </div>
        )}
        {flyingButterfly && (
          <div style={{ marginTop: 8, color: '#FF9800', fontWeight: 'bold' }}>
            🦋 Butterfly is flying away...
          </div>
        )}
      </div>
      <Canvas camera={{ position: [0, 0, 5], fov: 65 }}>
        {!isPopped && (
          <Float floatIntensity={1.5} speed={0.5}>
            <GlassBubbleWithButterfly 
              key={`bubble-${colorGroup}-${renderKey}-${respawnKey}`}
              index={colorGroup} 
              scale={bubbleSize} 
              onPop={handlePop}
            />
          </Float>
        )}
        
        {/* Render single flying butterfly */}
        {flyingButterfly && (
          <Butterfly
            key={`flying-${flyingButterfly.id}`}
            index={COLOR_GROUPS[flyingButterfly.index].index}
            size={flyingButterfly.scale * 0.8}
            isFlying={true}
            onFlyComplete={handleFlyComplete}
            position={flyingButterfly.position}
            debug={true}
          />
        )}
        
        <Environment preset="apartment" background={false} blur={1} />
      </Canvas>
    </div>
  );
};

export default GlassBubbleTest; 