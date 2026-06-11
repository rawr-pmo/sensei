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

  const [running, setRunning] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [error, setError] = useState('');
  const [detections, setDetections] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const loadModel = useCallback(async () => {
    if (modelRef.current) return modelRef.current;
    setModelLoading(true);
    try {
      await tf.ready();
      modelRef.current = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      return modelRef.current;
    } catch (e) {
      setError('Failed to load object detection model.');
      throw e;
    } finally {
      setModelLoading(false);
    }
  }, []);

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
    if (!voiceEnabled || preds.length === 0) return;

    const now = Date.now();
    const labels = [...new Set(preds.map((p) => p.class))];
    const text = labels.length === 1
      ? `I see a ${labels[0]}.`
      : `I see ${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}.`;

    if (text === lastSpokenRef.current.text && now - lastSpokenRef.current.time < SPEAK_INTERVAL_MS) {
      return;
    }
    if (now - lastSpokenRef.current.time < SPEAK_INTERVAL_MS) {
      return;
    }

    lastSpokenRef.current = { text, time: now };
    speak(text);
  }, [voiceEnabled, speak]);

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
      // Skip frame on transient detection errors
    }
  }, [drawDetections, speakDetections]);

  const start = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      await loadModel();

      detectIntervalRef.current = setInterval(detectFrame, DETECTION_INTERVAL_MS);
      setRunning(true);
    } catch (e) {
      setError(e.message || 'Could not start AR Assistant.');
    }
  };

  const stop = () => {
    if (detectIntervalRef.current) {
      clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRunning(false);
    setDetections([]);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  useEffect(() => () => stop(), []);

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
        {!running && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
            Tap "Start Detection" to begin
          </div>
        )}
        {modelLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xl font-bold">
            Loading AI model…
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-800 font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={running ? stop : start}
          className={`p-5 rounded-2xl text-white text-xl font-extrabold shadow active:scale-95 transition ${
            running ? 'bg-red-500' : 'bg-sensei-green'
          }`}
        >
          {running ? '🛑 Stop Detection' : '▶️ Start Detection'}
        </button>
        <button
          onClick={() => setVoiceEnabled((v) => !v)}
          className={`p-5 rounded-2xl text-white text-xl font-extrabold shadow active:scale-95 transition ${
            voiceEnabled ? 'bg-sensei-purple' : 'bg-gray-500'
          }`}
          aria-pressed={voiceEnabled}
        >
          {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
        </button>
      </div>

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