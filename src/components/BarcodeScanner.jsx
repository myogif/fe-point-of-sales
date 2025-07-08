import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';

const BarcodeScanner = ({ onScan, onClose }) => {
  const readerRef = useRef(null);
  const qrCodeScannerRef = useRef(null);

  useEffect(() => {
    if (!readerRef.current) return;

    const qrCodeScanner = new Html5Qrcode(readerRef.current.id);
    qrCodeScannerRef.current = qrCodeScanner;

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      onScan(decodedText);
      onClose();
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (cameras && cameras.length) {
          qrCodeScanner.start(
            { facingMode: 'environment' },
            config,
            qrCodeSuccessCallback
          ).catch((err) => {
            console.error('Error starting scanner:', err);
            toast.error('Failed to start scanner. Please grant camera permissions.');
            onClose();
          });
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

    return () => {
      if (qrCodeScannerRef.current && qrCodeScannerRef.current.isScanning) {
        qrCodeScannerRef.current.stop()
          .catch((err) => console.error('Failed to stop scanner:', err));
      }
    };
  }, [onScan, onClose]);

  return <div id="barcode-reader" ref={readerRef} style={{ width: '100%' }} />;
};

export default BarcodeScanner;
