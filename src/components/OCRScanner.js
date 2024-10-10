import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';

const OCRScanner = () => {
  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start the camera when the component mounts
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing the camera:', error);
    }
  };

  // Capture the image from the video stream
  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png');
    }
    return null;
  };

  // Perform OCR on the captured image using a Tesseract worker
  const scanImage = async () => {
    setLoading(true);
    const imageData = captureImage();

    if (imageData) {
      const worker = Tesseract.createWorker();
      try {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        const {
          data: { text },
        } = await worker.recognize(imageData);
        setOcrResult({ text });
      } catch (error) {
        console.error('OCR processing error:', error);
        alert('An error occurred during OCR processing.');
      } finally {
        await worker.terminate();
        setLoading(false);
      }
    } else {
      setLoading(false);
      alert('Failed to capture image. Please try again.');
    }
  };

  // Initialize the camera when the component mounts
  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div className='flex flex-col items-center p-4 bg-gray-100 min-h-screen'>
      <h1 className='text-2xl font-bold mb-4'>OCR Scanner</h1>

      <video
        ref={videoRef}
        autoPlay
        className='w-full max-w-md rounded-lg mb-4 border-2 border-gray-300'
      ></video>
      <canvas ref={canvasRef} className='hidden' />

      <button
        onClick={scanImage}
        className='bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none'
        disabled={loading}
      >
        {loading ? 'Scanning...' : 'Capture and Scan'}
      </button>

      {ocrResult && (
        <div className='bg-white shadow-lg p-4 mt-4 rounded-lg max-w-md w-full'>
          <h2 className='text-xl font-semibold mb-2'>Scanned Text:</h2>
          <pre className='text-gray-700'>
            {JSON.stringify(ocrResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default OCRScanner;
