import React from 'react';
import { motion } from 'framer-motion';

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

interface BubbleProps {
  bubble: BubbleData;
  onPop: (bubbleId: string) => void;
  isTarget: boolean;
}

const Bubble: React.FC<BubbleProps> = ({ bubble, onPop, isTarget }) => {
  // Random animation duration for natural movement
  const animationDuration = Math.random() * 2 + 4; // 4-6 seconds
  const floatDistance = Math.random() * 30 + 20; // 20-50px
  
  return (
    <motion.div
      initial={{ 
        x: bubble.x, 
        y: bubble.y, 
        scale: 0,
        opacity: 0 
      }}
      animate={{ 
        x: bubble.x + Math.sin(Date.now() * 0.001) * 30,
        y: bubble.y + Math.cos(Date.now() * 0.001) * 20,
        scale: 1,
        opacity: 1 
      }}
      exit={{ 
        scale: 0,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      whileHover={{ 
        scale: 1.1,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.9 }}
      className="fixed cursor-pointer select-none z-10"
      style={{
        width: bubble.size,
        height: bubble.size,
      }}
      onClick={() => onPop(bubble.id)}
    >
      {/* Bubble Shell */}
      <motion.div
        className={`bubble ${bubble.color} w-full h-full relative flex items-center justify-center`}
        animate={{
          y: [0, -floatDistance, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: animationDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Target Ring for accessibility */}
        {isTarget && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-success border-dashed"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        
        {/* Bird inside bubble */}
        <motion.img
          src={bubble.bird.image}
          alt="Trapped bird"
          className="w-3/5 h-3/5 object-contain z-10"
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Bubble highlight effect */}
        <div className="absolute top-2 left-2 w-1/4 h-1/4 bg-white/40 rounded-full blur-sm" />
        
        {/* Shimmer effect for target bubbles */}
        {isTarget && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: [-100, 100],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default Bubble;