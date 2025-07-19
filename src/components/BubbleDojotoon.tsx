import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Camera, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Bubble from './Bubble';
import CelebrationScreen from './CelebrationScreen';
import bird1 from '@/assets/bird-1.png';
import bird2 from '@/assets/bird-2.png';
import bird3 from '@/assets/bird-3.png';

interface Bird {
  id: string;
  type: number;
  image: string;
  x: number;
  y: number;
  isTarget: boolean;
}

interface BubbleData {
  id: string;
  x: number;
  y: number;
  color: string;
  bird: Bird;
  size: number;
}

const BIRD_IMAGES = [bird1, bird2, bird3];
const BUBBLE_COLORS = ['bubble', 'bubble-cyan', 'bubble-yellow', 'bubble-purple'];

const BubbleDojotoon: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [targetBirds, setTargetBirds] = useState<string[]>([]);
  const [freedBirds, setFreedBirds] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const { toast } = useToast();

  // Generate random position within safe bounds
  const getRandomPosition = () => ({
    x: Math.random() * (window.innerWidth - 200) + 100,
    y: Math.random() * (window.innerHeight - 300) + 150,
  });

  // Generate bubbles for the current level
  const generateBubbles = () => {
    const bubbleCount = Math.min(3 + level, 8); // Start with 3, max 8 bubbles
    const targetCount = Math.min(level, 3); // Max 3 targets per level
    const newBubbles: BubbleData[] = [];
    const newTargets: string[] = [];

    for (let i = 0; i < bubbleCount; i++) {
      const position = getRandomPosition();
      const birdType = Math.floor(Math.random() * BIRD_IMAGES.length);
      const bird: Bird = {
        id: `bird-${i}`,
        type: birdType,
        image: BIRD_IMAGES[birdType],
        x: position.x,
        y: position.y,
        isTarget: i < targetCount,
      };

      if (bird.isTarget) {
        newTargets.push(bird.id);
      }

      const bubble: BubbleData = {
        id: `bubble-${i}`,
        x: position.x,
        y: position.y,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        bird,
        size: Math.random() * 40 + 80, // Size between 80-120px
      };

      newBubbles.push(bubble);
    }

    setBubbles(newBubbles);
    setTargetBirds(newTargets);
    setFreedBirds([]);
  };

  // Handle bubble pop
  const handleBubblePop = (bubbleId: string) => {
    const bubble = bubbles.find(b => b.id === bubbleId);
    if (!bubble) return;

    const isTarget = targetBirds.includes(bubble.bird.id);
    
    if (isTarget) {
      // Correct bubble popped
      setFreedBirds(prev => [...prev, bubble.bird.id]);
      setScore(prev => prev + 10);
      
      if (!isMuted) {
        // Play success sound (placeholder for now)
        console.log('🎵 Success sound!');
      }
      
      toast({
        title: "Bird Freed! 🐦",
        description: "Great job, dojo hero!",
      });
    } else {
      // Wrong bubble popped - gentle feedback
      toast({
        title: "Try the colorful bird! 🌈",
        description: "Look for the birds that need help!",
      });
    }

    // Remove the popped bubble
    setBubbles(prev => prev.filter(b => b.id !== bubbleId));
  };

  // Check level completion
  useEffect(() => {
    if (freedBirds.length === targetBirds.length && targetBirds.length > 0) {
      setShowCelebration(true);
      if (!isMuted) {
        console.log('🎵 Level complete sound!');
      }
    }
  }, [freedBirds, targetBirds, isMuted]);

  // Handle celebration completion
  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setLevel(prev => prev + 1);
    generateBubbles();
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    generateBubbles();
  };

  // Reset game
  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setFreedBirds([]);
    setBubbles([]);
    setTargetBirds([]);
    setShowCelebration(false);
    setGameStarted(false);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen sky-gradient flex items-center justify-center p-4">
        <motion.div 
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-6xl font-bold text-primary mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Bubble Dojotoon
          </motion.h1>
          <p className="text-2xl text-foreground mb-8">
            Help the dojo heroes free the trapped birds! 🐦
          </p>
          <Button 
            onClick={startGame}
            size="lg"
            className="text-2xl px-8 py-6 h-auto animate-celebration-bounce"
          >
            Start Adventure! ✨
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sky-gradient relative overflow-hidden">
      {/* Game UI Header */}
      <div className="fixed top-4 left-4 right-4 z-20 flex justify-between items-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
          <div className="text-lg font-bold text-primary">Level {level}</div>
          <div className="text-sm text-muted-foreground">Score: {score}</div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="bg-white/90 backdrop-blur-sm"
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={resetGame}
            className="bg-white/90 backdrop-blur-sm"
          >
            <RotateCcw />
          </Button>
        </div>
      </div>

      {/* Target Birds Display */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg">
          <div className="text-center text-sm font-semibold text-primary mb-2">
            Free these birds:
          </div>
          <div className="flex gap-2">
            {targetBirds.map(birdId => {
              const bubble = bubbles.find(b => b.bird.id === birdId);
              if (!bubble) return null;
              
              const isFreed = freedBirds.includes(birdId);
              return (
                <div 
                  key={birdId}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                    ${isFreed ? 'bg-success' : 'bg-gray-200'}
                  `}
                >
                  <img 
                    src={bubble.bird.image} 
                    alt="Target bird"
                    className={`w-6 h-6 ${isFreed ? 'opacity-100' : 'opacity-60'}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bubbles */}
      <AnimatePresence>
        {bubbles.map(bubble => (
          <Bubble
            key={bubble.id}
            bubble={bubble}
            onPop={handleBubblePop}
            isTarget={targetBirds.includes(bubble.bird.id)}
          />
        ))}
      </AnimatePresence>

      {/* Celebration Screen */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationScreen
            level={level}
            score={score}
            onComplete={handleCelebrationComplete}
            isMuted={isMuted}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BubbleDojotoon;