import { useEffect, useRef, useState } from 'react';
import useCamera from '../hooks/useCamera.jsx';
import { extractText } from '../services/geminiService.js';

const ANALYZE_INTERVAL_MS = 5000;

export default function OCRReader() {
  const { videoRef, start, stop, captureFrame, ready, error: camError } = useCamera('environment');

  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [apiError, setApiError] = useState('');
  const [snapshot, setSnapshot] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const intervalRef = useRef(null);
  const loadingRef = useRef(false);
  const pendingTextRef = useRef(null);
  const speakingRef = useRef(false);

  const speakText = (str) => {
    if (!str || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(str);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    utterance.onstart = () => { setSpeaking(true); speakingRef.current = true; };
    utterance.onend = () => {
      speakingRef.current = false;
      setSpeaking(false);
      if (pendingTextRef.current) {
        const next = pendingTextRef.current;
        pendingTextRef.current = null;
        speakText(next);
      }
    };
    utterance.onerror = () => { speakingRef.current = false; setSpeaking(false); };
    window.speechSynthesis.speak(utterance);
  };

  const queueSpeak = (str) => {
    if (speakingRef.current) {
      pendingTextRef.current = str;
    } else {
      speakText(str);
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
      const result = await extractText(frame);
      // Only update if text actually changed
      setText((prev) => {
        if (result !== prev) queueSpeak(result);
        return result;
      });
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
      <h2 className="text-2xl font-extrabold text-gray-900">OCR Reader</h2>
      <p className="text-base text-gray-600">
        Point at any text — Sensei reads it aloud every {ANALYZE_INTERVAL_MS / 1000} seconds.
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
            <span className="text-white text-sm font-bold">Reading…</span>
          </div>
        )}
        {!ready && !camError && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
            Starting camera…
          </div>
        )}
      </div>

      {camError && (
        <p role="alert" className="text-red-600 font-semibold">{camError}</p>
      )}

      {apiError && (
        <div role="alert" className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-800 font-semibold">
          {apiError}
        </div>
      )}

      {text && (
        <div className="p-5 bg-white rounded-2xl shadow-lg space-y-3" role="status" aria-live="polite">
          {snapshot && (
            <img src={snapshot} alt="Last analyzed frame" className="w-full rounded-2xl object-contain max-h-48" />
          )}
          <h3 className="text-lg font-bold text-gray-800">
            {loading ? '🔄 Updating…' : '✅ Extracted Text'}
          </h3>
          <p className="text-xxl leading-relaxed font-semibold text-gray-900 whitespace-pre-wrap">{text}</p>
        </div>
      )}
    </div>
  );
}
