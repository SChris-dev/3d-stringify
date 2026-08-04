import { useState, useEffect, useRef } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export function useMediaPipe(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeVision() {
      try {
        const visionWasm = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (!isMounted) return;

        let landmarker: HandLandmarker;
        try {
          landmarker = await HandLandmarker.createFromOptions(visionWasm, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 2
          });
        } catch {
          landmarker = await HandLandmarker.createFromOptions(visionWasm, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'CPU'
            },
            runningMode: 'VIDEO',
            numHands: 2
          });
        }

        if (!isMounted) return;
        landmarkerRef.current = landmarker;
        setIsInitialized(true);
      } catch (err: any) {
        console.error("MediaPipe initialization error:", err);
        if (isMounted) setInitError(err.message || 'Failed to initialize MediaPipe Vision');
      }
    }

    initializeVision();

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    let stream: MediaStream | null = null;
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            facingMode: 'user',
            frameRate: { ideal: 60 }
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setInitError("Webcam access denied. Please allow camera permissions to use AR features.");
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isInitialized, videoRef]);

  return {
    isInitialized,
    initError,
    setInitError,
    landmarker: landmarkerRef.current
  };
}
export type { HandLandmarker };
