import { useEffect, useRef, useState } from 'react';
import useCamera from '../hooks/useCamera.jsx';
import { analyzeImage } from '../services/geminiService.js';

const MODES = [
  { key: 'scene', label: 'Describe Scene', icon: '🌆', color: 'bg-sensei-purple' },
  { key: 'groceries', label: 'Identify Groceries', icon: '🛒', color: 'bg-sensei-green' },
  { key: 'clothing', label: 'Identify Clothing', icon: '👕', color: 'bg-sensei-blue' }
];

const ANALYZE_INTERVAL_MS = 10000;

export default function VisionAssistant() {
  const { videoRef, start, stop, captureFrame, ready, error: camError } = useCamera('environment');

  const [mode, setMode] = useState('scene');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [apiError, setApiError] = useState('');
  const [snapshot, setSnapshot] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const intervalRef = useRef(null);
  const loadingRef = useRef(false);
  const modeRef = useRef(mode);
  const pendingTextRef = useRef(null); // holds latest result waiting to be spoken
  const speakingRef = useRef(false);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  const speakText = (text) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setSpeaking(true);
      speakingRef.current = true;
    };

    utterance.onend = () => {
      speakingRef.current = false;
      setSpeaking(false);
      // If a newer result came in while we were speaking, speak it now
      if (pendingTextRef.current) {
        const next = pendingTextRef.current;
        pendingTextRef.current = null;
        speakText(next);
      }
    };

    utterance.onerror = () => {
      speakingRef.current = false;
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const queueSpeak = (text) => {
    if (speakingRef.current) {
      // Don't interrupt — just store latest for after current speech ends
      pendingTextRef.current = text;
    } else {
      speakText(text);
    }
  };

  const analyze = async () => {
    if (loadingRef.current) return;
    const frame = captureFrame();
    if (!frame) return;

    loadingRef.current = true;
    setLoading(true);
    setSnapshot(frame);
    setApiError('');

    try {
      const text = await analyzeImage(frame, modeRef.current);
      setResult(text);
      queueSpeak(text);
    } catch (e) {
      setApiError(e.message);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    start();
    return () => {
      stop();
      window.speechSynthesis?.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    analyze();
    intervalRef.current = setInterval(analyze, ANALYZE_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [ready]);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-extrabold text-gray-900">Vision Assistant</h2>
      <p className="text-base text-gray-600">
        Sensei analyzes and narrates what the camera sees every {ANALYZE_INTERVAL_MS / 1000} seconds.
      </p>

      <div className="bg-black rounded-3xl overflow-hidden aspect-[4/3] relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          aria-label="Live camera preview"
        />
        {/* Live indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1">
          <span className={`w-3 h-3 rounded-full ${ready ? 'bg-red-500 recording-pulse' : 'bg-gray-400'}`} />
          <span className="text-white text-sm font-bold">{ready ? 'Live' : 'Starting…'}</span>
        </div>
        {/* Speaking indicator */}
        {speaking && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-black/60 rounded-full px-4 py-2">
            <span className="text-yellow-400 text-lg">🔊</span>
            <span className="text-white text-sm font-bold recording-pulse">Speaking…</span>
          </div>
        )}
        {loading && !speaking && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center bg-black/40 rounded-full px-4 py-2">
            <span className="text-white text-sm font-bold">Analyzing…</span>
          </div>
        )}
      </div>

      {camError && (
        <p role="alert" className="text-red-600 font-semibold">{camError}</p>
      )}

      {/* Mode selector */}
      <fieldset className="space-y-3">
        <legend className="text-lg font-bold text-gray-800">What should Sensei look for?</legend>
        <div className="grid grid-cols-1 gap-3">
          {MODES.map((m) => (
            <label
              key={m.key}
              className={`flex items-center gap-4 p-4 rounded-2xl text-white font-bold text-lg cursor-pointer transition ${m.color} ${
                mode === m.key ? 'ring-4 ring-yellow-400' : 'opacity-80'
              }`}
            >
              <input
                type="radio"
                name="vision-mode"
                value={m.key}
                checked={mode === m.key}
                onChange={() => setMode(m.key)}
                className="w-5 h-5"
              />
              <span className="text-2xl" aria-hidden="true">{m.icon}</span>
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>

      {apiError && (
        <div role="alert" className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-800 font-semibold">
          {apiError}
        </div>
      )}

      {result && (
        <div className="p-5 bg-white rounded-2xl shadow-lg space-y-3" role="status" aria-live="polite">
          {snapshot && (
            <img src={snapshot} alt="Last analyzed frame" className="w-full rounded-2xl object-contain max-h-48" />
          )}
          <h3 className="text-lg font-bold text-gray-800">
            {loading ? '🔄 Updating…' : '✅ Latest Result'}
          </h3>
          <p className="text-xl leading-relaxed text-gray-900">{result}</p>
        </div>
      )}
    </div>
  );
}
