import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, AlertTriangle, HeartHandshake, Leaf } from 'lucide-react';
import { AnalysisMode } from '../types';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
  mode?: AnalysisMode;
}

export default function CameraCapture({ onCapture, onClose, mode = 'plant' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Stop camera tracks helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start camera helper
  const startCamera = async (deviceIndex: number) => {
    setLoading(true);
    setError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment', // Default to back camera for plants
        },
        audio: false,
      };

      // If we have device IDs, use the chosen device
      if (devices.length > 0 && devices[deviceIndex]) {
        constraints.video = {
          deviceId: { exact: devices[deviceIndex].deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(
        'कैमरा शुरू करने में समस्या आई। कृपया सुनिश्चित करें कि आपने कैमरा एक्सेस की अनुमति दी है।' +
        ' (Camera access denied or unsupported. Please use manual upload.)'
      );
      setLoading(false);
    }
  };

  // Enumerate video devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request initial permission to unlock device labels
        const initialStream = await navigator.mediaDevices.getUserMedia({ video: true });
        initialStream.getTracks().forEach((t) => t.stop());

        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter((device) => device.kind === 'videoinput');
        setDevices(videoDevices);

        // Find back camera if available
        const backCameraIndex = videoDevices.findIndex((d) =>
          d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment')
        );
        setActiveDeviceIndex(backCameraIndex !== -1 ? backCameraIndex : 0);
      } catch (err) {
        console.warn('Could not list multiple camera devices:', err);
      }
    };

    getDevices().then(() => {
      startCamera(activeDeviceIndex);
    });

    return () => {
      stopCamera();
    };
  }, []);

  // Handle device change
  const handleToggleCamera = () => {
    if (devices.length <= 1) return;
    const nextIndex = (activeDeviceIndex + 1) % devices.length;
    setActiveDeviceIndex(nextIndex);
    startCamera(nextIndex);
  };

  // Capture current frame from video to a base64 image
  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror the photo if it's a front camera (user-facing)
      const currentDevice = devices[activeDeviceIndex];
      const isFrontCamera = currentDevice
        ? currentDevice.label.toLowerCase().includes('front') || currentDevice.label.toLowerCase().includes('user')
        : false;

      if (isFrontCamera) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      stopCamera();
      onCapture(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4" id="camera-modal">
      <div className="relative w-full max-w-lg bg-slate-950 text-white rounded-2xl overflow-hidden shadow-2xl flex flex-col" id="camera-box">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800" id="camera-header">
          <div className="flex items-center gap-2">
            {mode === 'body' ? (
              <HeartHandshake className="w-5 h-5 text-indigo-400 animate-pulse" />
            ) : (
              <Leaf className="w-5 h-5 text-emerald-500 animate-pulse" />
            )}
            <span className="font-semibold text-slate-100 text-sm md:text-base">
              {mode === 'body' ? 'लक्षण कैमरा स्कैनर (Live Symptom Scanner)' : 'जड़ी-बूटी कैमरा स्कैनर (Live Plant Scanner)'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            id="camera-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video stream container */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden" id="camera-stream-wrapper">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10" id="camera-loading">
              <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-3 ${
                mode === 'body' ? 'border-indigo-500' : 'border-emerald-500'
              }`}></div>
              <p className="text-xs text-slate-400">कैमरा शुरू हो रहा है... (Starting Camera...)</p>
            </div>
          )}

          {error ? (
            <div className="p-6 text-center max-w-sm flex flex-col items-center gap-3" id="camera-error">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
              <p className="text-sm text-slate-300">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors"
              >
                मैन्युअल अपलोड पर जाएं (Go to Manual Upload)
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              id="camera-video"
            />
          )}
        </div>

        {/* Footer controls */}
        {!error && !loading && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between" id="camera-controls">
            <div className="text-xs text-slate-400 max-w-[60%] leading-relaxed" id="camera-tip">
              {mode === 'body' 
                ? 'त्वचा के प्रभावित अंग, चकत्ते या लक्षण को करीब लाएं और साफ फोकस करें।'
                : 'पत्ती या बीमारी वाले हिस्से को करीब लाएं और साफ फोकस करें।'
              }
            </div>
            <div className="flex items-center gap-3">
              {devices.length > 1 && (
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="p-3 bg-slate-800 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 transition-all shadow-md cursor-pointer"
                  title="कैमरा बदलें (Switch Camera)"
                  id="camera-toggle-btn"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleCapture}
                className={`p-4 rounded-full text-white transition-all shadow-lg font-semibold flex items-center justify-center cursor-pointer ${
                  mode === 'body'
                    ? 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-600/20'
                    : 'bg-emerald-500 hover:bg-emerald-400 hover:shadow-emerald-500/20'
                }`}
                id="camera-snap-btn"
                title="फोटो लें (Take Photo)"
              >
                <Camera className="w-6 h-6 text-slate-950" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
