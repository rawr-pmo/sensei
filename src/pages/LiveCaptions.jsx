import { useEffect, useRef } from 'react';
import useSTT from '../hooks/useSTT.jsx';

export default function LiveCaptions() {
  const { transcript, interimTranscript, listening, supported, error, start, stop, reset } = useSTT();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  if (!supported) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-gray-900">Live Captions</h2>
        <div role="alert" className="p-5 bg-red-100 border-2 border-red-400 rounded-2xl text-red-800 font-semibold text-lg">
          Speech recognition is not supported in this browser. Please try Chrome or Edge.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-extrabold text-gray-900">Live Captions</h2>
      <p className="text-base text-gray-600">
        Tap Start and Sensei will display speech as text in real time.
      </p>

      <div className="flex items-center gap-3">
        <span
          className={`inline-block w-4 h-4 rounded-full ${listening ? 'bg-red-500 recording-pulse' : 'bg-gray-300'}`}
          aria-hidden="true"
        />
        <span className="text-lg font-bold text-gray-800">
          {listening ? 'Listening…' : 'Not listening'}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="bg-black text-white rounded-3xl p-6 h-72 overflow-y-auto"
        role="log"
        aria-live="polite"
        aria-label="Live caption transcript"
      >
        <p className="text-3xl leading-relaxed font-bold">
          {transcript}
          <span className="text-yellow-400">{interimTranscript}</span>
          {!transcript && !interimTranscript && (
            <span className="text-gray-400 text-xl font-normal">Captions will appear here…</span>
          )}
        </p>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-800 font-semibold">
          Microphone error: {error}. Please check microphone permissions.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={start}
          disabled={listening}
          className="p-5 rounded-2xl bg-sensei-green text-white text-xl font-extrabold shadow disabled:opacity-50 active:scale-95 transition"
        >
          ▶️ Start
        </button>
        <button
          onClick={stop}
          disabled={!listening}
          className="p-5 rounded-2xl bg-red-500 text-white text-xl font-extrabold shadow disabled:opacity-50 active:scale-95 transition"
        >
          ⏹️ Stop
        </button>
      </div>

      <button
        onClick={reset}
        className="w-full p-4 rounded-2xl bg-gray-700 text-white text-lg font-bold shadow active:scale-95 transition"
      >
        🗑️ Clear Transcript
      </button>
    </div>
  );
}