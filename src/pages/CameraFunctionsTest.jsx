import React, { useRef, useEffect, useState } from 'react';
import butterfly1 from '@/assets/butterfly-1.png';
import butterfly2 from '@/assets/butterfly-2.png';

const butterflies = [
  { src: butterfly1, x: 50, y: 50, width: 80, height: 80 },
  { src: butterfly2, x: 200, y: 100, width: 60, height: 60 },
];

const CameraWithOverlayPreview = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [captured, setCaptured] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  useEffect(() => {
    let stream;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        alert('Camera error: ' + err.message);
      });
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Update dimensions when video is ready
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let loaded = 0;
    if (!butterflies.length) {
      setCaptured(true);
      return;
    }
    butterflies.forEach(b => {
      const img = new window.Image();
      img.src = b.src;
      img.onload = () => {
        ctx.drawImage(img, b.x, b.y, b.width, b.height);
        loaded += 1;
        if (loaded === butterflies.length) {
          setCaptured(true);
        }
      };
      img.onerror = () => {
        loaded += 1;
        if (loaded === butterflies.length) {
          setCaptured(true);
        }
      };
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'selfie.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div>
      <h2>Camera with Overlay Preview</h2>
      {/* Live camera with overlays */}
      {!captured && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 400, // or any max width you want
            aspectRatio: `${dimensions.width} / ${dimensions.height}`,
            margin: '0 auto',
            background: '#222',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'cover',
            }}
            onLoadedMetadata={handleLoadedMetadata}
          />
          {butterflies.map((b, i) => (
            <img
              key={i}
              src={b.src}
              alt={`overlay-${i}`}
              style={{
                position: 'absolute',
                left: `${(b.x / dimensions.width) * 100}%`,
                top: `${(b.y / dimensions.height) * 100}%`,
                width: `${(b.width / dimensions.width) * 100}%`,
                height: `${(b.height / dimensions.height) * 100}%`,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          ))}
        </div>
      )}
      <br />
      {!captured && <button onClick={handleCapture}>Capture</button>}
      {/* Preview of captured image */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          display: captured ? 'block' : 'none',
          margin: '0 auto',
          background: '#222',
          maxWidth: 400,
          width: '100%',
          height: 'auto',
        }}
      />
      {captured && (
        <div>
          <button onClick={handleDownload}>Download Photo</button>
          <button onClick={() => setCaptured(false)} style={{ marginLeft: 8 }}>
            Retake
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraWithOverlayPreview; 