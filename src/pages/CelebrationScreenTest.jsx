import React, { useState } from 'react';
import CelebrationScreen from '../components/CelebrationScreen';
import butterfly1 from '@/assets/butterfly-1.png';
import butterfly2 from '@/assets/butterfly-2.png';

// Example overlays for testing
const butterflies = [
  { src: butterfly1, x: 50, y: 50, width: 80, height: 80 },
  { src: butterfly2, x: 200, y: 100, width: 60, height: 60 },
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