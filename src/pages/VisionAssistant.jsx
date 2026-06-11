import { useRef, useState } from 'react';
import useCamera from '../hooks/useCamera.jsx';
import useTTS from '../hooks/useTTS.jsx';
import { analyzeImage } from '../services/geminiService.js';

const MODES = [
  { key: 'scene', label: 'Describe Scene', icon: '🌆', color: 'bg-sensei-purple' },
  { key: 'groceries', label: 'Identify Groceries', icon: '🛒', color: 'bg-sensei-green' },
  { key: 'clothing', label: 'Identify Clothing', icon: '👕', color: 'bg-sensei-blue' }
];

export default function VisionAssistant() {
  const { videoRef, start, stop, captureFrame, ready, error: camError } = useCamera('environment');
  const { speak, stop: stopSpeech, speaking } = useTTS();
  const fileInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [mode, setMode] = useState('scene');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [apiError, setApiError] = useState('');
  const [cameraOn, setCameraOn] = useState(false);

  const toggleCamera = async () => {
    if (cameraOn) {
      stop();
      setCameraOn(false);
    } else {
      await start();
      setCameraOn(true);
    }
  };

  const handleCapture = () => {
    const frame = captureFrame();
    if (frame) {
      setImage(frame);
      setResult('');
      setApiError('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setResult('');
      setApiError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setApiError('');
    setResult('');
    try {
      const text = await analyzeImage(image, mode);
      setResult(text);
      speak(text);
    } catch (e) {
      setApiError(e.message);
      speak('Sorry, something went wrong while analyzing the image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-extrabold text-gray-900">Vision Assistant</h2>
      <p className="text-base text-gray-600">
        Capture or upload a photo, then choose what you'd like Sensei to describe.
      </p>

      <div className="bg-black rounded-3xl overflow-hidden aspect-[4/3] flex items-center justify-center relative">
        {cameraOn ? (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted aria-label="Camera preview" />
        ) : image ? (
          <img src={image} alt="Captured preview for analysis" className="w-full h-full object-contain" />
        ) : (
          <span className="text-white text-lg">No image yet</span>
        )}
      </div>

      {camError && (
        <p role="alert" className="text-red-600 font-semibold">{camError}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={toggleCamera}
          className="p-4 rounded-2xl bg-sensei-teal text-white text-lg font-bold shadow active:scale-95 transition"
        >
          {cameraOn ? '🛑 Stop Camera' : '📷 Open Camera'}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-4 rounded-2xl bg-sensei-orange text-white text-lg font-bold shadow active:scale-95 transition"
        >
          🖼️ Upload Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload image file"
        />
      </div>

      {cameraOn && ready && (
        <button
          onClick={handleCapture}
          className="w-full p-4 rounded-2xl bg-sensei-purple text-white text-xl font-bold shadow active:scale-95 transition"
        >
          📸 Capture Photo
        </button>
      )}

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

      <button
        onClick={handleAnalyze}
        disabled={!image || loading}
        className="w-full p-5 rounded-2xl bg-sensei-pink text-white text-xl font-extrabold shadow disabled:opacity-50 active:scale-95 transition"
      >
        {loading ? '⏳ Analyzing...' : '✨ Analyze Image'}
      </button>

      {apiError && (
        <div role="alert" className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-800 font-semibold">
          {apiError}
        </div>
      )}

      {result && (
        <div className="p-5 bg-white rounded-2xl shadow-lg space-y-3" role="status" aria-live="polite">
          <h3 className="text-lg font-bold text-gray-800">Result</h3>
          <p className="text-xl leading-relaxed text-gray-900">{result}</p>
          <button
            onClick={() => (speaking ? stopSpeech() : speak(result))}
            className="px-5 py-3 rounded-xl bg-sensei-blue text-white font-bold shadow active:scale-95 transition"
          >
            {speaking ? '🔇 Stop Reading' : '🔊 Read Aloud'}
          </button>
        </div>
      )}
    </div>
  );
}