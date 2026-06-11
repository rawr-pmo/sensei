import { useRef, useState } from 'react';
import useCamera from '../hooks/useCamera.jsx';
import useTTS from '../hooks/useTTS.jsx';
import { extractText } from '../services/geminiService.js';

export default function OCRReader() {
  const { videoRef, start, stop, captureFrame, ready, error: camError } = useCamera('environment');
  const { speak, stop: stopSpeech, speaking } = useTTS();
  const fileInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [apiError, setApiError] = useState('');

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
      setText('');
      setApiError('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setText('');
      setApiError('');
    };
    reader.readAsDataURL(file);
  };

  const handleExtract = async () => {
    if (!image) return;
    setLoading(true);
    setApiError('');
    setText('');
    try {
      const result = await extractText(image);
      setText(result);
      speak(result);
    } catch (e) {
      setApiError(e.message);
      speak('Sorry, I could not read the text in this image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-extrabold text-gray-900">OCR Reader</h2>
      <p className="text-base text-gray-600">
        Capture or upload a photo of text — Sensei will read it aloud and show it in large print.
      </p>

      <div className="bg-black rounded-3xl overflow-hidden aspect-[4/3] flex items-center justify-center">
        {cameraOn ? (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted aria-label="Camera preview" />
        ) : image ? (
          <img src={image} alt="Captured document or text" className="w-full h-full object-contain" />
        ) : (
          <span className="text-white text-lg">No image yet</span>
        )}
      </div>

      {camError && <p role="alert" className="text-red-600 font-semibold">{camError}</p>}

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

      <button
        onClick={handleExtract}
        disabled={!image || loading}
        className="w-full p-5 rounded-2xl bg-sensei-pink text-white text-xl font-extrabold shadow disabled:opacity-50 active:scale-95 transition"
      >
        {loading ? '⏳ Reading...' : '📖 Extract & Read Text'}
      </button>

      {apiError && (
        <div role="alert" className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-800 font-semibold">
          {apiError}
        </div>
      )}

      {text && (
        <div className="p-5 bg-white rounded-2xl shadow-lg space-y-3" role="status" aria-live="polite">
          <h3 className="text-lg font-bold text-gray-800">Extracted Text</h3>
          <p className="text-xxl leading-relaxed font-semibold text-gray-900 whitespace-pre-wrap">{text}</p>
          <button
            onClick={() => (speaking ? stopSpeech() : speak(text))}
            className="px-5 py-3 rounded-xl bg-sensei-blue text-white font-bold shadow active:scale-95 transition"
          >
            {speaking ? '🔇 Stop Reading' : '🔊 Read Aloud'}
          </button>
        </div>
      )}
    </div>
  );
}