import { useCallback, useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import useTTS from '../hooks/useTTS.jsx';

const SPEAK_INTERVAL_MS = 4000;
const DETECTION_INTERVAL_MS = 600;
const SCORE_THRESHOLD = 0.55;

export default function ARAssistant() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const modelRef = useRef(null);
  const detectIntervalRef = useRef(null);
  const lastSpokenRef = useRef({ text: '', time: 0 });

  const { speak } = useTTS();

  const [modelLoading, setModelLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  const [detections, setDetections] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const voiceEnabledRef = useRef(true);

  // Keep voiceEnabledRef in sync
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);

  const drawDetections = useCallback((preds) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    preds.forEach((pred) => {
      const [x, y, width, height] = pred.bbox;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      const label = `${pred.class} ${(pred.score * 100).toFixed(0)}%`;
      ctx.font = 'bold 20px sans-serif';
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x, Math.max(y - 28, 0), textWidth + 12, 28);
      ctx.fillStyle = '#000000';
      ctx.fillText(label, x + 6, Math.max(y - 8, 18));
    });
  }, []);

  const speakDetections = useCallback((preds) => {
    if (!voiceEnabledRef.current || preds.length === 0) return;
    const now = Date.now();
    const labels = [...new Set(preds.map((p) => p.class))];
    const text = labels.length === 1
      ? `I see a ${labels[0]}.`
      : `I see ${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}.`;
    if (text === lastSpokenRef.current.text && now - lastSpokenRef.current.time < SPEAK_INTERVAL_MS) return;
    if (now - lastSpokenRef.current.time < SPEAK_INTERVAL_MS) return;
    lastSpokenRef.current = { text, time: now };
    speak(text);
  }, [speak]);

  const detectFrame = useCallback(async () => {
    const video = videoRef.current;
    const model = modelRef.current;
    if (!video || !model || video.readyState < 2) return;
    try {
      const preds = await model.detect(video);
      const filtered = preds.filter((p) => p.score >= SCORE_THRESHOLD);
      setDetections(filtered);
      drawDetections(filtered);
      speakDetections(filtered);
    } catch {
      // skip frame
    }
  }, [drawDetections, speakDetections]);

  // Auto-start camera and detection on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        streamRef.current = stream;

        const attach = () => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = async () => {
              await videoRef.current.play();
              setCameraReady(true);
            };
          } else {
            requestAnimationFrame(attach);
          }
        };
        attach();

        // Load model
        setModelLoading(true);
        await tf.ready();
        modelRef.current = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        setModelLoading(false);

      } catch (e) {
        setError(e.message || 'Could not start AR Assistant.');
        setModelLoading(false);
      }
    };

    init();

    return () => {
      if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Start detection once both camera and model are ready
  useEffect(() => {
    if (!cameraReady || !modelRef.current || modelLoading) return;
    detectIntervalRef.current = setInterval(detectFrame, DETECTION_INTERVAL_MS);
    return () => clearInterval(detectIntervalRef.current);
  }, [cameraReady, modelLoading, detectFrame]);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-extrabold text-gray-900">AR Assistant</h2>
      <p className="text-base text-gray-600">
        Sensei detects objects in real time and announces them aloud.
      </p>

      <div className="relative bg-black rounded-3xl overflow-hidden aspect-[4/3]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          aria-hidden="true"
        />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1">
          <span className={`w-3 h-3 rounded-full ${cameraReady && !modelLoading ? 'bg-red-500 recording-pulse' : 'bg-gray-400'}`} />
          <span className="text-white text-sm font-bold">
            {!cameraReady ? 'Starting…' : modelLoading ? 'Loading model…' : 'Live'}
          </span>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-800 font-semibold">
          {error}
        </div>
      )}

      <button
        onClick={() => setVoiceEnabled((v) => !v)}
        className={`w-full p-5 rounded-2xl text-white text-xl font-extrabold shadow active:scale-95 transition ${
          voiceEnabled ? 'bg-sensei-purple' : 'bg-gray-500'
        }`}
        aria-pressed={voiceEnabled}
      >
        {voiceEnabled ? '🔊 Voice Announcements On' : '🔇 Voice Announcements Off'}
      </button>

      {detections.length > 0 && (
        <div className="p-5 bg-white rounded-2xl shadow-lg" role="status" aria-live="polite">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Detected Objects</h3>
          <ul className="flex flex-wrap gap-2">
            {detections.map((d, i) => (
              <li key={i} className="px-4 py-2 bg-sensei-green text-white rounded-xl font-bold text-base">
                {d.class} ({(d.score * 100).toFixed(0)}%)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
