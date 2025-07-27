import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';

const BarcodeScanner = ({ onScan, onClose }) => {
  const readerRef = useRef(null);
  const qrCodeScannerRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const startScanner = useCallback(async (cameraId) => {
    if (!qrCodeScannerRef.current || !cameraId) return;

    const scanner = qrCodeScannerRef.current;
    
    try {
      // Stop current scanning if active
      if (scanner.isScanning) {
        await scanner.stop();
        setIsScanning(false);
      }

      const successCallback = (decodedText, decodedResult) => {
        onScan(decodedText);
        scanner.stop().then(() => {
          setIsScanning(false);
          onClose();
        });
      };

      const errorCallback = (errorMessage) => {
        // ignore scanning errors
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await scanner.start(
        { deviceId: { exact: cameraId } },
        config,
        successCallback,
        errorCallback
      );
      
      setIsScanning(true);
    } catch (err) {
      console.error("Failed to start scanner:", err);
      toast.error("Failed to start scanner. Please try again.");
      setIsScanning(false);
    }
  }, [onScan, onClose]);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        const scanner = new Html5Qrcode("barcode-reader");
        qrCodeScannerRef.current = scanner;

        const availableCameras = await Html5Qrcode.getCameras();
        setCameras(availableCameras);
        
        if (availableCameras && availableCameras.length > 0) {
          // Try to find rear camera (environment facing) first, otherwise use camera 2 if available, then fallback to first camera
          let defaultCameraId;
          
          // Look for rear camera by label
          const rearCamera = availableCameras.find(camera =>
            camera.label && (
              camera.label.toLowerCase().includes('back') ||
              camera.label.toLowerCase().includes('rear') ||
              camera.label.toLowerCase().includes('environment')
            )
          );
          
          if (rearCamera) {
            defaultCameraId = rearCamera.id;
          } else if (availableCameras.length >= 2) {
            // If no rear camera found by label, use camera 2 (index 1)
            defaultCameraId = availableCameras[1].id;
          } else {
            // Fallback to first camera
            defaultCameraId = availableCameras[0].id;
          }
          
          setSelectedCameraId(defaultCameraId);
          await startScanner(defaultCameraId);
        } else {
          toast.error("No cameras found.");
        }
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
        toast.error("Failed to access camera. Please check permissions.");
      }
    };

    initializeScanner();

    return () => {
      if (qrCodeScannerRef.current && qrCodeScannerRef.current.isScanning) {
        qrCodeScannerRef.current.stop().catch(err =>
          console.error("Failed to stop scanner on cleanup:", err)
        );
      }
    };
  }, [startScanner]);

  const switchCamera = async () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCameraId = cameras[nextIndex].id;
      
      setSelectedCameraId(nextCameraId);
      await startScanner(nextCameraId);
    }
  };

  return (
    <div className="relative">
      <div id="barcode-reader" style={{ width: '100%' }} />
      
      {/* Camera Switch Button */}
      {cameras.length > 1 && (
        <button
          onClick={switchCamera}
          className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          title="Switch Camera"
        >
          <Camera className="w-5 h-5 text-gray-700" />
        </button>
      )}
      
      {/* Scanner Status */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
        {isScanning ? 'Scanning...' : 'Starting camera...'}
      </div>
      
      {/* Camera Info */}
      {cameras.length > 1 && selectedCameraId && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          Camera {cameras.findIndex(c => c.id === selectedCameraId) + 1}/{cameras.length}
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
