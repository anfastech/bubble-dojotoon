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

function GlassBubbleWithButterfly({ index, scale, position, isPopped, onPop, onFlyComplete }) {
  const [isFlying, setIsFlying] = useState(false);

  const handleBubbleClick = () => {
    if (!isPopped && !isFlying) {
      onPop();
      setIsFlying(true);
    }
  };

  const handleFlyComplete = () => {
    setIsFlying(false);
    if (onFlyComplete) {
      onFlyComplete();
    }
  };

  return (
    <>
      {/* Render bubble only if not popped */}
      {!isPopped && (
        <GlassBubble scale={scale} position={position} onClick={handleBubbleClick}>
          <Butterfly 
            key={`butterfly-${index}`}
            index={COLOR_GROUPS[index].index} 
            size={scale * 0.8} 
            position={[0, 0, 0.4]} 
          />
        </GlassBubble>
      )}
      
      {/* Render flying butterfly if popped */}
      {isPopped && isFlying && (
        <Butterfly 
          key={`flying-butterfly-${index}`}
          index={COLOR_GROUPS[index].index} 
          size={scale * 0.8} 
          isFlying={true}
          onFlyComplete={handleFlyComplete}
          position={position}
        />
      )}
    </>
  );
}

const ManyBubblesTest = () => {
  const [bubbleSize, setBubbleSize] = useState(1);
  const [renderKey, setRenderKey] = useState(0);
  const [poppedBubbles, setPoppedBubbles] = useState(new Set());

  // Trigger initial re-render when page loads
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setRenderKey(prev => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBubblePop = (bubbleIndex) => {
    setPoppedBubbles(prev => new Set([...prev, bubbleIndex]));
  };

  const handleFlyComplete = (bubbleIndex) => {
    // Optional: Reset the bubble after butterfly flies away
    // setPoppedBubbles(prev => {
    //   const newSet = new Set(prev);
    //   newSet.delete(bubbleIndex);
    //   return newSet;
    // });
  };

  // Define multiple bubbles with different colors and positions
  const bubbles = [
    { colorGroup: 0, position: [-2, 0, 0], scale: 1.2 }, // Red/Orange, left
    { colorGroup: 2, position: [0, 0, 0], scale: 1.0 },   // Blue/Cyan, center
    { colorGroup: 1, position: [2, 0, 0], scale: 0.8 },   // Yellow/Green, right
  ];

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
          <h3>Multiple Bubbles:</h3>
          <ul style={{ marginLeft: 20 }}>
            <li>Left: Red/Orange Butterfly (Click to pop!)</li>
            <li>Center: Blue/Cyan Butterfly (Click to pop!)</li>
            <li>Right: Yellow/Green Butterfly (Click to pop!)</li>
          </ul>
          <p style={{ fontSize: '12px', opacity: 0.8 }}>
            Click any bubble to pop it and watch the butterfly fly away!
          </p>
        </div>
      </div>
      <Canvas camera={{ position: [0, 0, 8], fov: 65 }}>
        {bubbles.map((bubble, i) => (
          <Float key={`bubble-${i}-${renderKey}`} floatIntensity={1.5} speed={0.5 + i * 0.2}>
            <GlassBubbleWithButterfly 
              key={`bubble-${i}-${bubble.colorGroup}-${renderKey}`}
              index={bubble.colorGroup} 
              scale={bubble.scale * bubbleSize} 
              position={bubble.position}
              isPopped={poppedBubbles.has(i)}
              onPop={() => handleBubblePop(i)}
              onFlyComplete={() => handleFlyComplete(i)}
            />
          </Float>
        ))}
        <Environment preset="apartment" background={false} blur={1} />
      </Canvas>
    </div>
  );
};

export default ManyBubblesTest; 