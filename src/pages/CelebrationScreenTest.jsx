import React, { useRef, useEffect, useState } from 'react';

const butterflies = [
  // Example: { src: '/path/to/butterfly.png', x: 100, y: 50, width: 50, height: 50 }
  // Add your butterfly overlays here
];

const CameraWithDesign = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [captured, setCaptured] = useState(false);

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

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (!butterflies.length) {
      setCaptured(true);
      handleDownload();
      return;
    }

    let loaded = 0;
    butterflies.forEach(b => {
      const img = new window.Image();
      img.src = b.src;
      img.onload = () => {
        ctx.drawImage(img, b.x, b.y, b.width, b.height);
        loaded += 1;
        if (loaded === butterflies.length) {
          setCaptured(true);
          handleDownload();
        }
      };
      img.onerror = () => {
        loaded += 1;
        if (loaded === butterflies.length) {
          setCaptured(true);
          handleDownload();
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
      <h2>Camera with Design</h2>
      <video ref={videoRef} autoPlay playsInline style={{ width: 400, height: 300, background: '#222' }} />
      <br />
      <button onClick={handleCapture}>Capture</button>
      <br />
      <canvas ref={canvasRef} style={{ display: captured ? 'block' : 'none', width: 400, height: 300, marginTop: 10 }} />
      {captured && (
        <div>
          <button onClick={handleDownload}>Download Photo</button>
        </div>
      )}
    </div>
  );
};

export default CameraWithDesign; 