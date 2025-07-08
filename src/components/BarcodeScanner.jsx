import React from 'react';
import { Html5Qrcode } from 'html5-qrcode';

class BarcodeScanner extends React.Component {
  constructor(props) {
    super(props);
    this.html5QrCode = null;
  }

  componentDidMount() {
    this.html5QrCode = new Html5Qrcode('reader');
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      this.props.onScan(decodedText);
      this.html5QrCode.stop().catch(err => console.error("Failed to stop the scanner.", err));
    };
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    Html5Qrcode.getCameras()
      .then(cameras => {
        if (cameras && cameras.length) {
          const cameraId = cameras[0].id;
          this.html5QrCode.start(
            cameraId,
            config,
            qrCodeSuccessCallback,
            (errorMessage) => {
              // console.error(errorMessage);
            }
          ).catch(err => {
            console.error("Unable to start scanning.", err);
          });
        }
      })
      .catch(err => {
        console.error("Error getting cameras.", err);
      });
  }

  componentWillUnmount() {
    if (this.html5QrCode && this.html5QrCode.isScanning) {
      this.html5QrCode.stop().catch(err => {
        console.error("Failed to stop the scanner.", err);
      });
    }
  }

  render() {
    return <div id="reader" style={{ width: '100%' }}></div>;
  }
}

export default BarcodeScanner;
