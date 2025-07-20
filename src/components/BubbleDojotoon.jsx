
import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import GlassBubble from './GlassBubble';
import Butterfly from './Butterfly';
import CelebrationScreen from './CelebrationScreen';

const COLOR_GROUPS = [
  { name: 'Red/Orange', index: 0 },
  { name: 'Yellow/Green', index: 2 },
  { name: 'Blue/Cyan', index: 4 },
  { name: 'Purple', index: 6 },
];

// Standalone bubble component with individual state
function StandaloneBubble({ bubble, onPop }) {
  const [hasProducedButterfly, setHasProducedButterfly] = useState(false);

  const handleBubbleClick = () => {
    if (!hasProducedButterfly) {
      setHasProducedButterfly(true);
      onPop(bubble.id);
    }
  };

  return (
    <GlassBubble
      position={bubble.position}
      scale={bubble.scale}
      onClick={handleBubbleClick}
    >
      <Butterfly 
        key={`butterfly-${bubble.id}`}
        index={COLOR_GROUPS[bubble.colorGroup].index} 
        size={bubble.scale * 0.8} 
        position={[0, 0, 0.4]} 
      />
    </GlassBubble>
  );
}

const BubbleDojotoon = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [freedButterflies, setFreedButterflies] = useState(0);
  const [flyingButterflies, setFlyingButterflies] = useState([]);
  const [poppedBubbles, setPoppedBubbles] = useState(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);

  const TARGET_BUTTERFLIES = 5;
  const MAX_BUBBLES = 3;

  const generateRandomPosition = () => {
    return [
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
      0
    ];
  };

  const createBubble = () => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      position: generateRandomPosition(),
      scale: 0.8 + Math.random() * 0.4,
      colorGroup: Math.floor(Math.random() * COLOR_GROUPS.length), // Random color group
    };
  };

  const initializeBubbles = useCallback(() => {
    const newBubbles = [];
    for (let i = 0; i < MAX_BUBBLES; i++) {
      newBubbles.push(createBubble());
    }
    setBubbles(newBubbles);
    setPoppedBubbles(new Set());
  }, []);

  const handleBubblePop = useCallback((bubbleId) => {
    const poppedBubble = bubbles.find(b => b.id === bubbleId);
    if (!poppedBubble) return;

    setPoppedBubbles(prev => new Set([...prev, bubbleId]));
    
    // Add flying butterfly with individual characteristics
    const newFlyingButterfly = {
      id: Date.now() + Math.random(),
      index: poppedBubble.colorGroup,
      scale: poppedBubble.scale,
      position: poppedBubble.position,
      personality: Math.random(), // Each butterfly gets unique personality
    };
    
    setFlyingButterflies(prev => [...prev, newFlyingButterfly]);

    // Respawn bubble after delay
    setTimeout(() => {
      setPoppedBubbles(prev => {
        const newSet = new Set(prev);
        newSet.delete(bubbleId);
        return newSet;
      });
      
      // Replace with new bubble
      setBubbles(prev => {
        const filtered = prev.filter(b => b.id !== bubbleId);
        return [...filtered, createBubble()];
      });
    }, 2000); // 2 second delay before respawn

    setFreedButterflies(prev => prev + 1);
    setScore(prev => prev + 100);

    if (!isMuted) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmM=');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, [bubbles, isMuted]);

  const handleFlyComplete = useCallback((butterflyId) => {
    setFlyingButterflies(prev => prev.filter(b => b.id !== butterflyId));
  }, []);

  const startGame = () => {
    setGameStarted(true);
    initializeBubbles();
  };

  const resetGame = () => {
    setGameStarted(false);
    setBubbles([]);
    setFreedButterflies(0);
    setFlyingButterflies([]);
    setPoppedBubbles(new Set());
    setShowCelebration(false);
    setScore(0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    resetGame();
  };

  useEffect(() => {
    if (freedButterflies >= TARGET_BUTTERFLIES) {
      setShowCelebration(true);
    }
  }, [freedButterflies]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen sky-gradient flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-lg bg-card/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='rounded-lg p-6'
          >
            <h1 className="text-4xl font-bold text-primary mb-4">
              Bubble Dojotoon
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              You are dojo hero, could you help the butterflies to fly 🦋 from magical bubbles 🫧
            </p>
            <br />
            <br />
            <Button
              onClick={startGame}
              size="lg"
              className="w-full text-xl py-6"
            >
              Start Adventure
            </Button>
          </motion.div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen sky-gradient relative overflow-hidden">
      {/* Game UI */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 w-[90vw] max-w-xs sm:max-w-md">
        <Card className="p-2 sm:p-4 bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 sm:gap-4">
            <div className='flex flex-wrap items-center gap-2 sm:gap-4'>
              <div className="text-xs sm:text-sm font-medium">
                Score: <span className="text-primary font-bold">{score}</span>
              </div>
              <div className="text-xs sm:text-sm font-medium">
                Freed: <span className="text-success font-bold">{freedButterflies}/{TARGET_BUTTERFLIES}</span>
              </div>
            </div>
            {flyingButterflies.length > 0 && (
              <div className="text-xs sm:text-sm font-medium text-orange-500">
                🦋 Flying: {flyingButterflies.length}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className="bg-card/80 backdrop-blur-sm"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={resetGame}
          className="bg-card/80 backdrop-blur-sm"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* 3D Scene - Full screen canvas */}
      <div className="absolute inset-0 w-full h-full touch-none">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          style={{ width: '100vw', height: '100vh', touchAction: 'none' }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, 10]} intensity={0.4} />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={false}
            enabled={false}
          />
          
          {/* Render bubbles */}
          {bubbles.map((bubble) => (
            !poppedBubbles.has(bubble.id) && (
              <Float key={`bubble-${bubble.id}`} floatIntensity={1.5} speed={0.5}>
                <StandaloneBubble
                  key={`bubble-${bubble.id}`}
                  bubble={bubble}
                  onPop={handleBubblePop}
                />
              </Float>
            )
          ))}
          
          {/* Render flying butterflies */}
          {flyingButterflies.map((butterfly) => (
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

      {/* Celebration Screen */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationScreen
            score={score}
            onComplete={handleCelebrationComplete}
            butterflyImage={null}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BubbleDojotoon;
