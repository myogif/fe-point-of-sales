import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';

const BarcodeScanner = ({ onScan, onClose }) => {
  const readerRef = useRef(null);
  const qrCodeScannerRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');

  const startScanner = useCallback(() => {
    if (!readerRef.current || !selectedCameraId) return;

    const qrCodeScanner = new Html5Qrcode(readerRef.current.id);
    qrCodeScannerRef.current = qrCodeScanner;

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      onScan(decodedText);
      onClose();
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

    qrCodeScanner.start(
      selectedCameraId,
      config,
      qrCodeSuccessCallback
    ).catch((err) => {
      console.error('Error starting scanner:', err);
      toast.error('Failed to start scanner. Please grant camera permissions.');
      onClose();
    });
  }, [selectedCameraId, onScan, onClose]);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((cameraDevices) => {
        if (cameraDevices && cameraDevices.length) {
          setCameras(cameraDevices);
          setSelectedCameraId(cameraDevices[0].id);
        } else {
          toast.error('No cameras found.');
          onClose();
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        toast.error('Could not access camera. Please grant permissions.');
        onClose();
      });
  }, [onClose]);

  useEffect(() => {
    if (selectedCameraId) {
      if (qrCodeScannerRef.current && qrCodeScannerRef.current.isScanning) {
        qrCodeScannerRef.current.stop().then(() => {
          startScanner();
        });
      } else {
        startScanner();
      }
    }
    return () => {
      if (qrCodeScannerRef.current && qrCodeScannerRef.current.isScanning) {
        qrCodeScannerRef.current.stop()
          .catch((err) => console.error('Failed to stop scanner:', err));
      }
    };
  }, [selectedCameraId, startScanner]);

  const switchCamera = () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(c => c.id === selectedCameraId);
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
