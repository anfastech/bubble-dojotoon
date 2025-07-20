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

function GlassBubbleWithButterfly({ index, scale, position, isPopped, onPop, bubbleId }) {
  const [hasProducedButterfly, setHasProducedButterfly] = useState(false);

  const handleBubbleClick = () => {
    if (!isPopped && !hasProducedButterfly) {
      setHasProducedButterfly(true);
      onPop(bubbleId);
    }
  };

  // Don't render the bubble if it's popped
  if (isPopped) {
    return null;
  }

  return (
    <GlassBubble scale={scale} position={position} onClick={handleBubbleClick}>
      <Butterfly 
        key={`butterfly-${index}-${bubbleId}`}
        index={COLOR_GROUPS[index].index} 
        size={scale * 0.8} 
        position={[0, 0, 0.4]} 
      />
    </GlassBubble>
  );
}

const ManyBubblesTest = () => {
  const [bubbleSize, setBubbleSize] = useState(1);
  const [renderKey, setRenderKey] = useState(0);
  const [poppedBubbles, setPoppedBubbles] = useState(new Set());
  const [flyingButterflies, setFlyingButterflies] = useState([]);
  const [bubbleColors, setBubbleColors] = useState([0, 2, 1]); // Initial colors for the 3 bubbles


  // Trigger initial re-render when page loads
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setRenderKey(prev => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBubblePop = (bubbleId) => {
    const bubbleIndex = parseInt(bubbleId);
    
    setPoppedBubbles(prev => new Set([...prev, bubbleIndex]));
    
    // Add flying butterfly to the list (multiple can fly)
    const newFlyingButterfly = {
      id: Date.now() + bubbleIndex, // Unique ID for each butterfly
      index: bubbleColors[bubbleIndex],
      scale: bubbleSize,
      position: bubbles[bubbleIndex].position
    };
    setFlyingButterflies(prev => [...prev, newFlyingButterfly]);
    
    // Respawn after a short delay
    setTimeout(() => {
      setPoppedBubbles(prev => {
        const newSet = new Set(prev);
        newSet.delete(bubbleIndex);
        return newSet;
      });
      
      // Pick a random new color for this bubble
      const newColorGroup = Math.floor(Math.random() * COLOR_GROUPS.length);
      setBubbleColors(prev => {
        const newColors = [...prev];
        newColors[bubbleIndex] = newColorGroup;
        return newColors;
      });
    }, 2000); // 2 second delay before respawn
  };

  const handleFlyComplete = (butterflyId) => {
    setFlyingButterflies(prev => prev.filter(butterfly => butterfly.id !== butterflyId));
  };

  // Define multiple bubbles with different colors and positions
  const bubbles = [
    { colorGroup: bubbleColors[0], position: [-2, 0, 0], scale: 1.2 }, // Red/Orange, left
    { colorGroup: bubbleColors[1], position: [0, 0, 0], scale: 1.0 },   // Blue/Cyan, center
    { colorGroup: bubbleColors[2], position: [2, 0, 0], scale: 0.8 },   // Yellow/Green, right
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
            <li>Left: {COLOR_GROUPS[bubbleColors[0]].name} Butterfly (Click to pop!)</li>
            <li>Center: {COLOR_GROUPS[bubbleColors[1]].name} Butterfly (Click to pop!)</li>
            <li>Right: {COLOR_GROUPS[bubbleColors[2]].name} Butterfly (Click to pop!)</li>
          </ul>
          <p style={{ fontSize: '12px', opacity: 0.8 }}>
            Click any bubble to pop it and watch the butterfly fly away! New bubbles respawn with random colors.
          </p>
          {flyingButterflies.length > 0 && (
            <p style={{ fontSize: '12px', color: '#FF9800', marginTop: 8 }}>
              🦋 Flying butterflies: {flyingButterflies.map(bf => COLOR_GROUPS[bf.index].name).join(', ')}
            </p>
          )}
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
              onPop={handleBubblePop}
              bubbleId={i.toString()}
            />
          </Float>
        ))}
        
        {/* Render flying butterflies */}
        {flyingButterflies.map(butterfly => (
          <Butterfly
            key={`flying-${butterfly.id}`}
            index={COLOR_GROUPS[butterfly.index].index}
            size={butterfly.scale * 0.8}
            isFlying={true}
            onFlyComplete={() => handleFlyComplete(butterfly.id)}
            position={butterfly.position}
          />
        ))}
        
        <Environment preset="apartment" background={false} blur={1} />
      </Canvas>
    </div>
  );
};

export default ManyBubblesTest; 