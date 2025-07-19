
import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import GlassBubble from './GlassBubble';
import Butterfly from './Butterfly';
import CelebrationScreen from './CelebrationScreen';

import butterfly1 from '@/assets/butterfly-1.png';
import butterfly2 from '@/assets/butterfly-2.png';
import butterfly3 from '@/assets/butterfly-3.png';

const butterflies = [butterfly1, butterfly2, butterfly3];

const BubbleDojotoon = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [freedButterflies, setFreedButterflies] = useState(0);
  const [flyingButterflies, setFlyingButterflies] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);

  const TARGET_BUTTERFLIES = 5;
  const MAX_BUBBLES = 3;

  const generateRandomPosition = () => {
    return [
      (Math.random() - 0.5) * 6, // x: -3 to 3 (reduced range)
      (Math.random() - 0.5) * 4, // y: -2 to 2 (reduced range)
      0 // z: keep at 0
    ];
  };

  const createBubble = () => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      position: generateRandomPosition(),
      butterfly: butterflies[Math.floor(Math.random() * butterflies.length)],
      scale: 0.8 + Math.random() * 0.4, // 0.8 to 1.2 scale (smaller bubbles)
    };
  };

  const initializeBubbles = useCallback(() => {
    const newBubbles = [];
    for (let i = 0; i < MAX_BUBBLES; i++) {
      newBubbles.push(createBubble());
    }
    setBubbles(newBubbles);
  }, []);

  const handleBubblePop = useCallback((bubbleId) => {
    const poppedBubble = bubbles.find(b => b.id === bubbleId);
    if (!poppedBubble) return;

    // Calculate screen position more accurately
    const screenX = window.innerWidth / 2 + (poppedBubble.position[0] / 6) * (window.innerWidth / 2);
    const screenY = window.innerHeight / 2 - (poppedBubble.position[1] / 4) * (window.innerHeight / 2);

    // Add flying butterfly animation
    const flyingButterfly = {
      id: Math.random().toString(36).substr(2, 9),
      image: poppedBubble.butterfly,
      position: [screenX - 60, screenY - 60], // Center the butterfly
    };

    setFlyingButterflies(prev => [...prev, flyingButterfly]);

    // Remove the popped bubble and add a new one
    setBubbles(prev => {
      const filtered = prev.filter(b => b.id !== bubbleId);
      return [...filtered, createBubble()];
    });

    setFreedButterflies(prev => prev + 1);
    setScore(prev => prev + 100);

    // Play pop sound (if not muted)
    if (!isMuted) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmM=');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore autoplay restrictions
    }
  }, [bubbles, isMuted]);

  const handleButterflyAnimationComplete = useCallback((butterflyId) => {
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

  // Check for victory
  useEffect(() => {
    if (freedButterflies >= TARGET_BUTTERFLIES) {
      setShowCelebration(true);
    }
  }, [freedButterflies]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen sky-gradient flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md bg-card/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-primary mb-4">
              Bubble Dojotoon
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Free the butterflies from their bubble homes! 🦋
            </p>
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
      <div className="absolute top-4 left-4 z-10">
        <Card className="p-4 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              Score: <span className="text-primary font-bold">{score}</span>
            </div>
            <div className="text-sm font-medium">
              Freed: <span className="text-success font-bold">{freedButterflies}/{TARGET_BUTTERFLIES}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
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
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          style={{ width: '100%', height: '100%' }}
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
          
          {bubbles.map((bubble) => (
            <GlassBubble
              key={bubble.id}
              position={bubble.position}
              scale={bubble.scale}
              onClick={() => handleBubblePop(bubble.id)}
            >
              <Butterfly
                image={bubble.butterfly}
                position={[0, 0, 0]}
                isFlying={false}
              />
            </GlassBubble>
          ))}
        </Canvas>
      </div>

      {/* Flying Butterflies */}
      <AnimatePresence>
        {flyingButterflies.map((butterfly) => (
          <Butterfly
            key={butterfly.id}
            image={butterfly.image}
            position={butterfly.position}
            isFlying={true}
            onAnimationComplete={() => handleButterflyAnimationComplete(butterfly.id)}
          />
        ))}
      </AnimatePresence>

      {/* Celebration Screen */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationScreen
            score={score}
            onComplete={handleCelebrationComplete}
            butterflyImage={butterflies[0]}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BubbleDojotoon;
