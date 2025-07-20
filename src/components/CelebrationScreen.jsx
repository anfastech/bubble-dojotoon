import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import dojoMascot from '@/assets/dojo-mascot.png';

const CelebrationScreen = ({ score, onComplete, butterflyImage }) => {
  const [showSelfie, setShowSelfie] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const { toast } = useToast();

  // Confetti particles
  const confettiColors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    x: Math.random() * 100,
    delay: Math.random() * 3,
  }));

  // Play celebration audio
  useEffect(() => {
    // Placeholder for celebration sound
    console.log('🎵 Congratulations! All butterflies freed!');
    
    // Text-to-speech congratulations (if available)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Congratulations! You freed all the butterflies!');
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Camera access for selfie
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      setShowSelfie(true);
    } catch (error) {
      toast({
        title: "Camera not available",
        description: "Unable to access camera for selfie feature.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setShowSelfie(false);
    setPhotoTaken(false);
  };

  const takeSelfie = () => {
    setPhotoTaken(true);
    toast({
      title: "Perfect! 📸",
      description: "Great selfie, butterfly hero!",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-success/90 to-primary/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-0 bg-black/50 overflow-y-auto"
      style={{background: "#ffffff93"}}
    >
      {/* Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black/50">
        {confettiParticles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-4 h-4 rounded-full"
            style={{ 
              backgroundColor: particle.color,
              left: `${particle.x}%`,
            }}
            initial={{ y: -50, rotate: 0, scale: 0 }}
            animate={{ 
              y: window.innerHeight + 50, 
              rotate: 360,
              scale: [0, 1, 0.8, 0]
            }}
            transition={{
              duration: 3,
              delay: particle.delay,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Main celebration content */}
      <div className="fixed inset-0 z-0" />
      <div className="relative z-10 w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!showSelfie ? (
            <motion.div
              key="celebration"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-center p-4 sm:p-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-md mx-2 sm:mx-4"
            >
              {/* Mascot */}
              <motion.img
                src={dojoMascot}
                alt="Dojo Hero Mascot"
                className="mx-auto mb-4 sm:mb-6 w-24 sm:w-32"
                animate={{ 
                  scale: [0.9, 1, 0.9],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Celebration text */}
              <motion.h1
                className="text-2xl sm:text-4xl font-bold text-primary mb-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🎉 All Butterflies Freed! 🎉
              </motion.h1>
              
              <p className="text-base sm:text-xl text-muted-foreground mb-4 sm:mb-6"
                style={{
                  ...(window.innerWidth < 640
                    ? {
                        width: "80%",
                        margin: "0 auto",
                      }
                    : {})
                }}
              >
                Amazing work! You freed all the butterflies! 🦋
              </p>
              <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
                Score: {score} points
              </p>

              {/* Action buttons */}
              <div className="sm:space-y-4" style={{
                ...(window.innerWidth > 640
                  ? {
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "50%",
                      margin: "0 auto",
                    }
                  : {})
              }}>
                <Button
                  onClick={startCamera}
                  size="xl"
                  className="lg:w-50 w-full text-xl sm:text-lg mr-2 celebration-glow"
                  style={{
                    ...(window.innerWidth < 640
                      ? {
                          marginBottom: "10px",
                        }
                      : {})
                  }}
                >
                  <Camera className="mr-2" />
                  Take Victory Selfie! 📸
                </Button>
                <Button
                  onClick={onComplete}
                  variant="secondary"
                  size="xl"
                  className="lg:w-50 w-full text-xl sm:text-lg"
                >
                  Play Again! ✨
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="selfie"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 w-full max-w-xs sm:max-w-md mx-2 sm:mx-4"
            >
              {/* Close button */}
              <Button
                onClick={stopCamera}
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10"
              >
                <X />
              </Button>

              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 text-center">
                Victory Selfie! 📸
              </h2>

              {/* Camera view */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-4">
                {videoStream ? (
                  <video
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-48 sm:h-64 object-cover"
                    ref={(video) => {
                      if (video && videoStream) {
                        video.srcObject = videoStream;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-48 sm:h-64 bg-gray-200 flex items-center justify-center">
                    <Camera className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Celebration overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <motion.div
                    className="text-3xl"
                    animate={{ rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🎉
                  </motion.div>
                  <motion.div
                    className="text-2xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🌟
                  </motion.div>
                </div>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <p className="text-white text-lg font-bold text-center bg-black/50 px-4 py-2 rounded-full">
                    Butterfly Hero! 🦋
                  </p>
                </div>
              </div>

              {/* Camera controls */}
              <div className="flex gap-2 sm:gap-4">
                {!photoTaken ? (
                  <Button
                    onClick={takeSelfie}
                    size="lg"
                    className="flex-1 text-base sm:text-lg"
                    disabled={!videoStream}
                  >
                    📸 Snap!
                  </Button>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-1 text-center py-2 sm:py-3 bg-success text-success-foreground rounded-lg font-semibold text-base sm:text-lg"
                  >
                    Perfect Shot! ⭐
                  </motion.div>
                )}
                
                <Button
                  onClick={() => {
                    stopCamera();
                    onComplete();
                  }}
                  variant="secondary"
                  size="lg"
                  className="flex-1 text-base sm:text-lg"
                >
                  Continue! ✨
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CelebrationScreen;