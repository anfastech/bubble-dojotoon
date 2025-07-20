import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import dojoMascot from '@/assets/dojo-mascot.png';
import butterfly1 from '@/assets/butterfly-1.png';
import butterfly2 from '@/assets/butterfly-2.png';
import butterfly3 from '@/assets/butterfly-3.png';
import butterfly4 from '@/assets/butterfly-4.png';

// Arrange butterflies in a celebratory arc and corners
const defaultOverlays = [
  // Corners
  { src: butterfly1, x: 10, y: 10, width: 50, height: 50, rotate: -20 }, // top-left
  { src: butterfly2, x: 290, y: 10, width: 50, height: 50, rotate: 20 }, // top-right
  { src: butterfly3, x: 10, y: 202, width: 50, height: 50, rotate: 15 }, // bottom-left
  { src: butterfly4, x: 290, y: 202, width: 50, height: 50, rotate: -15 }, // bottom-right

  // Arc (top)
  { src: butterfly2, x: 80, y: 30, width: 40, height: 40, rotate: 0 },
  { src: butterfly3, x: 150, y: 15, width: 45, height: 45, rotate: 10 },
  { src: butterfly4, x: 220, y: 30, width: 40, height: 40, rotate: -10 },

  // Arc (bottom)
  { src: butterfly1, x: 80, y: 180, width: 40, height: 40, rotate: 5 },
  { src: butterfly2, x: 150, y: 195, width: 45, height: 45, rotate: -5 },
  { src: butterfly3, x: 220, y: 180, width: 40, height: 40, rotate: 8 },
];

const CelebrationScreen = ({ score, onComplete, butterflyImage, overlays, onSelfieCaptured }) => {
  const effectiveOverlays = overlays === undefined ? defaultOverlays : overlays;
  const [showSelfie, setShowSelfie] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [selfieImage, setSelfieImage] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 350, height: 262 }); // Default to 4:3 aspect
  const [retakeCount, setRetakeCount] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
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

  const setVideoRef = node => {
    if (node) {
      if (node.srcObject !== videoStream) {
        node.srcObject = videoStream;
        console.log('Assigned stream to video element (ref callback)');
      }
      videoRef.current = node;
    }
  };

  // Update dimensions when video is ready
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  // Camera access for selfie
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      setShowSelfie(true);
      console.log('Camera stream started', stream);
    } catch (error) {
      toast({
        title: "Camera not available",
        description: "Unable to access camera for selfie feature.",
        variant: "destructive",
      });
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setShowSelfie(false);
    setPhotoTaken(false);
    setSelfieImage(null);
  };

  const takeSelfie = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let loaded = 0;
    const finish = () => {
      const imageData = canvas.toDataURL('image/png');
      setSelfieImage(imageData);
      setPhotoTaken(true);
      if (onSelfieCaptured) onSelfieCaptured(imageData);
      toast({
        title: "Perfect! 📸",
        description: "Great selfie, butterfly hero!",
      });
      // Auto-download
      const link = document.createElement('a');
      link.download = 'dojoherohappy.png';
      link.href = imageData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    if (!effectiveOverlays.length) {
      finish();
      return;
    }
    effectiveOverlays.forEach(b => {
      const img = new window.Image();
      img.src = b.src;
      img.onload = () => {
        ctx.drawImage(
          img,
          b.x,
          b.y,
          b.width,
          b.height
        );
        loaded += 1;
        if (loaded === effectiveOverlays.length) {
          finish();
        }
      };
      img.onerror = () => {
        loaded += 1;
        if (loaded === effectiveOverlays.length) {
          finish();
        }
      };
    });
  };

  const containerStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: 350,
    aspectRatio: '350 / 262',
    margin: '0 auto',
    background: '#222',
    borderRadius: 16,
    overflow: 'hidden',
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

              {/* Camera view with overlays */}
              {!photoTaken && (
                <div
                  style={containerStyle}
                >
                  <video
                    key={showSelfie + '-' + (videoStream ? videoStream.id || 'stream' : 'nostream') + '-' + retakeCount}
                    ref={setVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                    className="rounded-xl"
                    onLoadedMetadata={handleLoadedMetadata}
                  />
                  {effectiveOverlays.map((b, i) => (
                    <img
                      key={i}
                      src={b.src}
                      alt={`overlay-${i}`}
                      style={{
                        position: 'absolute',
                        left: `${b.x}px`,
                        top: `${b.y}px`,
                        width: `${b.width}px`,
                        height: `${b.height}px`,
                        transform: `rotate(${b.rotate || 0}deg)`,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                    />
                  ))}
                </div>
              )}
              {/* Preview of captured image */}
              {photoTaken && selfieImage && (
                <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 10, width: '100%'  }}>
                  <div style={containerStyle}>
                    <img
                      src={selfieImage}
                      alt="Selfie Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                  <a className='underline' href={selfieImage} download="dojoherohappy.png" style={{ display: 'block', marginTop: 8 }}>
                    Download Photo
                  </a>
                  <Button onClick={() => {
                    setPhotoTaken(false);
                    setSelfieImage(null);
                    setRetakeCount(c => c + 1);
                  }} style={{ marginLeft: 8 }}>
                    Retake
                  </Button>
                </div>
              )}
              {/* Camera controls */}
              <div className="flex gap-2 sm:gap-4 mt-4">
                {!photoTaken ? (
                  <Button
                    onClick={takeSelfie}
                    size="lg"
                    className="flex-1 text-base sm:text-lg"
                    disabled={!videoStream}
                  >
                    📸 Snap!
                  </Button>
                ) : null}
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
      {showSelfie && (
        <>
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{ display: 'none' }}
          />
        </>
      )}
    </motion.div>
  );
};

export default CelebrationScreen;