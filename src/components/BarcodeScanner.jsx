import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';

const BarcodeScanner = ({ onScan, onClose }) => {
  const readerRef = useRef(null);
  const qrCodeScannerRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');

  useEffect(() => {
    const scanner = new Html5Qrcode(readerRef.current.id);
    qrCodeScannerRef.current = scanner;

    const successCallback = (decodedText, decodedResult) => {
      onScan(decodedText);
      scanner.stop();
      onClose();
    };

    const errorCallback = (errorMessage) => {
      // ignore
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    Html5Qrcode.getCameras().then(cameras => {
      setCameras(cameras);
      if (cameras && cameras.length) {
        const camId = selectedCameraId || cameras[0].id;
        setSelectedCameraId(camId);
        scanner.start({ deviceId: { exact: camId } }, config, successCallback, errorCallback)
          .catch(err => {
            toast.error("Failed to start scanner.");
          });
      }
    }).catch(err => {
      toast.error("No cameras found.");
    });

    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(err => console.error("failed to stop scanner", err));
      }
    };
  }, [onClose, onScan, selectedCameraId]);

  const switchCamera = () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      setSelectedCameraId(cameras[nextIndex].id);
    }
  };

  return (
    <div className="relative">
      <div id="barcode-reader" ref={readerRef} style={{ width: '100%' }} />
      {cameras.length > 1 && (
        <button
          onClick={switchCamera}
          className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md"
        >
          <Camera className="w-6 h-6 text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default BarcodeScanner;
