import { useCallback, useEffect, useRef, useState } from 'react';

export default function useCamera(facingMode = 'environment') {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const start = useCallback(async () => {
    try {
      setError(null);
      setReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });
      streamRef.current = stream;

      // Poll until the video element is in the DOM, then attach
      const attach = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => setReady(true))
              .catch((e) => setError(e.message));
          };
        } else {
          requestAnimationFrame(attach);
        }
      };
      attach();
    } catch (e) {
      setError(e.message || 'Could not access camera');
    }
  }, [facingMode]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setReady(false);
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !ready) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, [ready]);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, start, stop, captureFrame, ready, error };
}
