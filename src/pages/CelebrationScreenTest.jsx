import React, { useState } from 'react';
import CelebrationScreen from '../components/CelebrationScreen';
import butterfly1 from '@/assets/butterfly-1.png';
import butterfly2 from '@/assets/butterfly-2.png';
import butterfly3 from '@/assets/butterfly-3.png';
import butterfly4 from '@/assets/butterfly-4.png';

// Example overlays for testing
const butterflies = [
  // Top left, rotated -20deg
  { src: butterfly1, x: 20, y: 20, width: 60, height: 60, rotate: -20 },
  // Top right, rotated 25deg
  { src: butterfly2, x: 250, y: 30, width: 60, height: 60, rotate: 25 },
  // Bottom left, rotated 15deg
  { src: butterfly3, x: 40, y: 180, width: 70, height: 70, rotate: 15 },
  // Bottom right, rotated -30deg
  { src: butterfly4, x: 230, y: 190, width: 70, height: 70, rotate: -30 },
  // Center arc, upright
  { src: butterfly2, x: 130, y: 70, width: 80, height: 80, rotate: 0 },
  // Extra festive duplicates
  { src: butterfly1, x: 90, y: 40, width: 50, height: 50, rotate: 10 },
  { src: butterfly3, x: 200, y: 120, width: 50, height: 50, rotate: -15 },
  { src: butterfly4, x: 120, y: 180, width: 60, height: 60, rotate: 20 },
];

const CelebrationScreenTest = () => {
  const [show, setShow] = useState(true);
  const [lastSelfie, setLastSelfie] = useState(null);

  return (
    <div>
      {show && (
        <CelebrationScreen
          score={123}
          onComplete={() => {
            setShow(false);
            setTimeout(() => setShow(true), 1000); // Reset after 1s for repeated testing
            console.log('CelebrationScreen onComplete called');
          }}
          butterflyImage={null}
          // Pass overlays and a callback to get the captured image
          overlays={butterflies}
          onSelfieCaptured={img => setLastSelfie(img)}
        />
      )}
      {!show && <div style={{textAlign: 'center', marginTop: 40}}>CelebrationScreen hidden. Will reappear in 1s.</div>}
      {lastSelfie && (
        <div style={{marginTop: 24, textAlign: 'center'}}>
          <h3>Last Captured Selfie Preview:</h3>
          <img src={lastSelfie} alt="Selfie Preview" style={{maxWidth: 300, borderRadius: 16, border: '2px solid #ccc'}} />
          <a href={lastSelfie} download="selfie.png" style={{display: 'block', marginTop: 8}}>Download Again</a>
        </div>
      )}
    </div>
  );
};

export default CelebrationScreenTest;