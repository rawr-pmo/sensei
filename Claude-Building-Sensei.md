Sensei — AI Accessibility Assistant (PWA)
1. Folder Structure
sensei/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── NavDrawer.jsx
│   │   ├── BigButton.jsx
│   │   └── Header.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── VisionAssistant.jsx
│   │   ├── OCRReader.jsx
│   │   ├── LiveCaptions.jsx
│   │   ├── NavigationAssistant.jsx
│   │   └── ARAssistant.jsx
│   ├── hooks/
│   │   ├── useCamera.jsx
│   │   ├── useTTS.jsx
│   │   └── useSTT.jsx
│   ├── services/
│   │   ├── geminiService.js
│   │   └── routingService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js

2. Source Code
package.json
json{
  "name": "sensei",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "@tensorflow/tfjs": "^4.20.0",
    "@tensorflow-models/coco-ssd": "^2.2.3",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "vite": "^5.3.4",
    "vite-plugin-pwa": "^0.20.0"
  }
}

vite.config.js
javascriptimport { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Sensei - AI Accessibility Assistant',
        short_name: 'Sensei',
        description: 'AI-powered accessibility assistant for visually and hearing impaired users',
        theme_color: '#6D28D9',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  server: { host: true, port: 5173 }
});

tailwind.config.js
javascript/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sensei: {
          purple: '#6D28D9',
          orange: '#F97316',
          teal: '#0D9488',
          pink: '#DB2777',
          blue: '#2563EB',
          green: '#16A34A',
          yellow: '#EAB308'
        }
      },
      fontSize: {
        'xxl': '1.75rem',
        'xxxl': '2.5rem'
      }
    }
  },
  plugins: []
};

postcss.config.js
javascriptexport default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

index.html
html<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#6D28D9" />
    <meta name="description" content="Sensei - AI Accessibility Assistant for visually and hearing impaired users" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <title>Sensei - AI Accessibility Assistant</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

src/index.css
css@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Visible focus ring for keyboard / screen reader users */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 4px solid #FACC15;
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes pulse-rec {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.recording-pulse {
  animation: pulse-rec 1.2s infinite;
}

src/main.jsx
jsximport React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

src/App.jsx
jsximport { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import VisionAssistant from './pages/VisionAssistant.jsx';
import OCRReader from './pages/OCRReader.jsx';
import LiveCaptions from './pages/LiveCaptions.jsx';
import NavigationAssistant from './pages/NavigationAssistant.jsx';
import ARAssistant from './pages/ARAssistant.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vision" element={<VisionAssistant />} />
          <Route path="/ocr" element={<OCRReader />} />
          <Route path="/captions" element={<LiveCaptions />} />
          <Route path="/navigation" element={<NavigationAssistant />} />
          <Route path="/ar" element={<ARAssistant />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

src/components/Header.jsx
jsxexport default function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 bg-sensei-purple text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="p-3 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 transition"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-extrabold tracking-wide">Sensei</h1>
        <div className="w-12" aria-hidden="true" />
      </div>
    </header>
  );
}

src/components/NavDrawer.jsx
jsximport { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/vision', label: 'Vision Assistant', icon: '👁️' },
  { to: '/ocr', label: 'OCR Reader', icon: '📖' },
  { to: '/captions', label: 'Live Captions', icon: '💬' },
  { to: '/navigation', label: 'Navigation Assistant', icon: '🧭' },
  { to: '/ar', label: 'AR Assistant', icon: '📷' }
];

export default function NavDrawer({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <nav
        aria-label="Main navigation"
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 bg-sensei-purple text-white">
          <span className="text-xl font-bold">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="p-3 space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={onClose}
                className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-semibold transition ${
                  location.pathname === link.to
                    ? 'bg-sensei-purple text-white'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
                aria-current={location.pathname === link.to ? 'page' : undefined}
              >
                <span className="text-2xl" aria-hidden="true">{link.icon}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

src/components/Layout.jsx
jsximport { useState } from 'react';
import Header from './Header.jsx';
import NavDrawer from './NavDrawer.jsx';

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onMenuClick={() => setDrawerOpen(true)} />
      <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 pb-10">
        {children}
      </main>
    </div>
  );
}

src/components/BigButton.jsx
jsximport { Link } from 'react-router-dom';

const colorMap = {
  purple: 'bg-sensei-purple',
  orange: 'bg-sensei-orange',
  teal: 'bg-sensei-teal',
  pink: 'bg-sensei-pink',
  blue: 'bg-sensei-blue',
  green: 'bg-sensei-green'
};

export default function BigButton({ to, icon, title, subtitle, color = 'purple', onClick }) {
  const classes = `flex items-center gap-5 w-full p-6 rounded-3xl text-white shadow-lg active:scale-[0.98] transition transform ${colorMap[color]}`;

  const content = (
    <>
      <span className="text-4xl shrink-0" aria-hidden="true">{icon}</span>
      <span className="text-left">
        <span className="block text-xxl font-bold leading-tight">{title}</span>
        {subtitle && <span className="block text-base opacity-90 mt-1">{subtitle}</span>}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

src/hooks/useTTS.jsx
jsximport { useCallback, useEffect, useRef, useState } from 'react';

export default function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const speak = useCallback((text, opts = {}) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = opts.rate ?? 1;
    utterance.pitch = opts.pitch ?? 1;
    utterance.lang = opts.lang ?? 'en-US';

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { speak, stop, speaking };
}

src/hooks/useSTT.jsx
jsximport { useCallback, useEffect, useRef, useState } from 'react';

export default function useSTT() {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += text + ' ';
        } else {
          interimText += text;
        }
      }
      if (finalText) setTranscript((prev) => prev + finalText);
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening((wasListening) => {
        if (wasListening) {
          try {
            recognition.start();
            return true;
          } catch {
            return false;
          }
        }
        return false;
      });
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const start = useCallback(() => {
    setError(null);
    if (recognitionRef.current && !listening) {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (e) {
        setError(e.message);
      }
    }
  }, [listening]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      setListening(false);
      recognitionRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return { transcript, interimTranscript, listening, supported, error, start, stop, reset };
}

src/hooks/useCamera.jsx
jsximport { useCallback, useEffect, useRef, useState } from 'react';

export default function useCamera(facingMode = 'environment') {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const start = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
      }
    } catch (e) {
      setError(e.message || 'Could not access camera');
    }
  }, [facingMode]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setReady(false);
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, start, stop, captureFrame, ready, error };
}

src/services/geminiService.js
javascriptconst GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

function dataUrlToBase64(dataUrl) {
  return dataUrl.split(',')[1];
}

async function callGemini(base64Image, mimeType, prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Please set it in your .env file.');
  }

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: base64Image } }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 512
    }
  };

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join(' ');
  if (!text) throw new Error('No response received from Gemini.');
  return text.trim();
}

const PROMPTS = {
  scene: 'Describe this scene in 2-3 clear, concise sentences for a visually impaired person. Focus on layout, people, objects, and any potential hazards.',
  groceries: 'Identify all grocery or food items visible in this image. List each item name clearly and briefly mention quantity or packaging if visible. Keep it short and spoken-friendly.',
  clothing: 'Describe the clothing items visible in this image, including type, color, and pattern. Mention if items appear to match or any notable details for someone who cannot see them.',
  ocr: 'Extract all readable text from this image exactly as it appears, preserving line breaks. If there is no text, respond with "No text detected."'
};

export async function analyzeImage(imageDataUrl, mode = 'scene') {
  const base64 = dataUrlToBase64(imageDataUrl);
  const mimeType = imageDataUrl.substring(imageDataUrl.indexOf(':') + 1, imageDataUrl.indexOf(';'));
  const prompt = PROMPTS[mode] || PROMPTS.scene;
  return callGemini(base64, mimeType, prompt);
}

export async function extractText(imageDataUrl) {
  const base64 = dataUrlToBase64(imageDataUrl);
  const mimeType = imageDataUrl.substring(imageDataUrl.indexOf(':') + 1, imageDataUrl.indexOf(';'));
  return callGemini(base64, mimeType, PROMPTS.ocr);
}

src/services/routingService.js
javascriptconst NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const OSRM_URL = 'https://router.project-osrm.org';

export async function geocodeAddress(query) {
  const url = `${NOMINATIM_URL}/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en' }
  });
  if (!res.ok) throw new Error('Geocoding failed.');
  const data = await res.json();
  if (!data.length) throw new Error('Destination not found.');
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name
  };
}

export async function getRoute(start, end) {
  const url = `${OSRM_URL}/route/v1/foot/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Routing service failed.');
  const data = await res.json();
  if (!data.routes?.length) throw new Error('No route found.');

  const route = data.routes[0];
  const steps = route.legs[0].steps.map((step) => ({
    instruction: buildInstruction(step),
    distance: step.distance,
    duration: step.duration
  }));

  return {
    coordinates: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    distance: route.distance,
    duration: route.duration,
    steps
  };
}

function buildInstruction(step) {
  const maneuver = step.maneuver?.type || 'continue';
  const modifier = step.maneuver?.modifier;
  const name = step.name ? ` onto ${step.name}` : '';

  switch (maneuver) {
    case 'depart':
      return `Head ${modifier || 'forward'}${name}.`;
    case 'arrive':
      return 'You have arrived at your destination.';
    case 'turn':
      return `Turn ${modifier}${name}.`;
    case 'new name':
      return `Continue${name}.`;
    case 'roundabout':
      return `Enter the roundabout and take the exit${name}.`;
    default:
      return `Continue ${modifier || 'straight'}${name}.`;
  }
}

src/pages/Home.jsx
jsximport BigButton from '../components/BigButton.jsx';

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h2 className="text-3xl font-extrabold text-gray-900">Welcome to Sensei</h2>
        <p className="text-lg text-gray-600 mt-2">Your AI accessibility assistant</p>
      </div>

      <div className="space-y-4" role="list" aria-label="Main features">
        <div role="listitem">
          <BigButton
            to="/vision"
            icon="👁️"
            title="Vision Assistant"
            subtitle="Describe scenes, groceries & clothing"
            color="purple"
          />
        </div>
        <div role="listitem">
          <BigButton
            to="/ocr"
            icon="📖"
            title="OCR Reader"
            subtitle="Capture and read text aloud"
            color="orange"
          />
        </div>
        <div role="listitem">
          <BigButton
            to="/captions"
            icon="💬"
            title="Live Captions"
            subtitle="Real-time speech to text"
            color="teal"
          />
        </div>
        <div role="listitem">
          <BigButton
            to="/navigation"
            icon="🧭"
            title="Navigation Assistant"
            subtitle="Voice-guided directions"
            color="blue"
          />
        </div>
        <div role="listitem">
          <BigButton
            to="/ar"
            icon="📷"
            title="AR Assistant"
            subtitle="Detect objects in real time"
            color="pink"
          />
        </div>
      </div>
    </div>
  );
}

src/pages/VisionAssistant.jsx
jsximport { useRef, useState } from 'react';
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

src/pages/OCRReader.jsx
jsximport { useRef, useState } from 'react';
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

src/pages/LiveCaptions.jsx
jsximport { useEffect, useRef } from 'react';
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

src/pages/NavigationAssistant.jsx
jsximport { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import useTTS from '../hooks/useTTS.jsx';
import { geocodeAddress, getRoute } from '../services/routingService.js';

import 'leaflet/dist/leaflet.css';

// Fix default marker icons for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

function MapUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40] });
  }, [bounds, map]);
  return null;
}

export default function NavigationAssistant() {
  const { speak, stop: stopSpeech, speaking } = useTTS();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported on this device.');
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationError('');
      },
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleFindRoute = async () => {
    if (!currentLocation) {
      setRouteError('Waiting for your current location.');
      return;
    }
    if (!destination.trim()) {
      setRouteError('Please enter a destination.');
      return;
    }

    setLoading(true);
    setRouteError('');
    setRoute(null);
    setStepIndex(0);

    try {
      const dest = await geocodeAddress(destination);
      const result = await getRoute(currentLocation, { lat: dest.lat, lon: dest.lon });
      setRoute(result);
      const distanceKm = (result.distance / 1000).toFixed(1);
      const minutes = Math.round(result.duration / 60);
      const summary = `Route found. Total distance ${distanceKm} kilometers, approximately ${minutes} minutes walking. ${result.steps[0]?.instruction || ''}`;
      speak(summary);
    } catch (e) {
      setRouteError(e.message);
      speak('Sorry, I could not find a route to that destination.');
    } finally {
      setLoading(false);
    }
  };

  const speakStep = (index) => {
    const step = route?.steps?.[index];
    if (step) speak(step.instruction);
  };

  const nextStep = () => {
    if (!route) return;
    const next = Math.min(stepIndex + 1, route.steps.length - 1);
    setStepIndex(next);
    speakStep(next);
  };

  const prevStep = () => {
    if (!route) return;
    const prev = Math.max(stepIndex - 1, 0);
    setStepIndex(prev);
    speakStep(prev);
  };

  const bounds = route ? L.latLngBounds(route.coordinates) : null;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-extrabold text-gray-900">Navigation Assistant</h2>
      <p className="text-base text-gray-600">
        Enter a destination to get a walking route with step-by-step voice guidance.
      </p>

      {locationError && (
        <div role="alert" className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-800 font-semibold">
          {locationError}
        </div>
      )}

      <div className="space-y-3">
        <label htmlFor="destination" className="block text-lg font-bold text-gray-800">
          Destination
        </label>
        <input
          id="destination"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. MG Road, Bengaluru"
          className="w-full p-4 text-xl rounded-2xl border-2 border-gray-300 focus:border-sensei-purple"
        />
        <button
          onClick={handleFindRoute}
          disabled={loading}
          className="w-full p-5 rounded-2xl bg-sensei-blue text-white text-xl font-extrabold shadow disabled:opacity-50 active:scale-95 transition"
        >
          {loading ? '⏳ Finding Route...' : '🧭 Get Directions'}
        </button>
      </div>

      {routeError && (
        <div role="alert" className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-800 font-semibold">
          {routeError}
        </div>
      )}

      {currentLocation && (
        <div className="rounded-3xl overflow-hidden h-72">
          <MapContainer center={[currentLocation.lat, currentLocation.lon]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[currentLocation.lat, currentLocation.lon]}>
              <Popup>You are here</Popup>
            </Marker>
            {route && (
              <>
                <Polyline positions={route.coordinates} color="#6D28D9" weight={6} />
                <Marker position={route.coordinates[route.coordinates.length - 1]}>
                  <Popup>Destination</Popup>
                </Marker>
                <MapUpdater bounds={bounds} />
              </>
            )}
          </MapContainer>
        </div>
      )}

      {route && (
        <div className="p-5 bg-white rounded-2xl shadow-lg space-y-4" role="region" aria-label="Turn by turn directions">
          <div className="flex justify-between text-base font-semibold text-gray-700">
            <span>📏 {(route.distance / 1000).toFixed(2)} km</span>
            <span>⏱️ {Math.round(route.duration / 60)} min walk</span>
          </div>

          <div className="p-4 bg-sensei-purple text-white rounded-2xl" aria-live="polite">
            <p className="text-sm font-semibold opacity-80">
              Step {stepIndex + 1} of {route.steps.length}
            </p>
            <p className="text-xl font-bold mt-1">{route.steps[stepIndex]?.instruction}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={prevStep}
              disabled={stepIndex === 0}
              className="p-4 rounded-2xl bg-gray-700 text-white text-lg font-bold shadow disabled:opacity-50 active:scale-95 transition"
            >
              ⬅️ Back
            </button>
            <button
              onClick={() => (speaking ? stopSpeech() : speakStep(stepIndex))}
              className="p-4 rounded-2xl bg-sensei-orange text-white text-lg font-bold shadow active:scale-95 transition"
            >
              {speaking ? '🔇 Stop' : '🔊 Repeat'}
            </button>
            <button
              onClick={nextStep}
              disabled={stepIndex === route.steps.length - 1}
              className="p-4 rounded-2xl bg-sensei-green text-white text-lg font-bold shadow disabled:opacity-50 active:scale-95 transition"
            >
              Next ➡️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

src/pages/ARAssistant.jsx
jsximport { useCallback, useEffect, useRef, useState } from 'react';
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

public/manifest.json
json{
  "name": "Sensei - AI Accessibility Assistant",
  "short_name": "Sensei",
  "description": "AI-powered accessibility assistant for visually and hearing impaired users",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6D28D9",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}

Note: vite-plugin-pwa auto-generates the service worker and manifest at build time using the config in vite.config.js. This public/manifest.json is provided as a fallback reference; the build output takes precedence. Place 192×192 and 512×512 PNG icons at public/icons/.


public/robots.txt
User-agent: *
Allow: /

.env.example
# Get a key from https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here

3. Installation Instructions
bash# 1. Create the project
npm create vite@latest sensei -- --template react
cd sensei

# 2. Install dependencies
npm install react-router-dom @tensorflow/tfjs @tensorflow-models/coco-ssd leaflet react-leaflet
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa

# 3. Replace generated files with the source above
#    (App.jsx, main.jsx, index.css, all components/pages/hooks/services,
#     plus vite.config.js, tailwind.config.js, postcss.config.js, index.html)

# 4. Add PWA icons
mkdir -p public/icons
# Place icon-192.png and icon-512.png inside public/icons/

# 5. Set up environment variables
cp .env.example .env
# Edit .env and add your VITE_GEMINI_API_KEY

# 6. Run locally
npm run dev
The dev server runs at http://localhost:5173. For camera/microphone/geolocation access on mobile, use HTTPS or localhost (browsers block these APIs on plain HTTP for non-localhost origins).

4. Environment Variable Setup
VariableDescriptionWhere to get itVITE_GEMINI_API_KEYAPI key for Google Gemini (used for vision/OCR analysis)https://aistudio.google.com/app/apikey

Add .env to .gitignore — never commit real API keys.
All Vite env vars exposed to the client must be prefixed with VITE_.
For production, set the same variable in your hosting provider's environment/secrets settings (it gets baked into the client bundle at build time — Gemini calls are made directly from the browser, so the key is visible to users; for production-grade security, proxy Gemini calls through a backend instead).


5. Deployment Instructions
Build
bashnpm run build
Outputs to dist/.
Vercel
bashnpm install -g vercel
vercel --prod

Framework preset: Vite
Add VITE_GEMINI_API_KEY under Project Settings → Environment Variables.

Netlify
bashnpm install -g netlify-cli
netlify deploy --prod --dir=dist

Build command: npm run build
Publish directory: dist
Add VITE_GEMINI_API_KEY under Site Settings → Environment Variables.

GitHub Pages

Set base: '/your-repo-name/' in vite.config.js.
npm run build
Deploy dist/ via gh-pages package or GitHub Actions.

PWA Install Verification
After deploying over HTTPS, open the site on a mobile browser → "Add to Home Screen" should appear. Verify via Chrome DevTools → Application → Manifest & Service Workers.

Notes & Caveats

Browser support: Live Captions uses the Web Speech API (SpeechRecognition), reliably supported in Chrome/Edge; Safari/Firefox support is limited.
Gemini key exposure: This client-only setup exposes the API key in the browser. For production, route requests through a backend/serverless proxy.
HTTPS required: Camera, microphone, and geolocation APIs require a secure context (HTTPS or localhost).
TensorFlow model size: COCO-SSD (lite_mobilenet_v2) downloads ~6MB on first AR Assistant use; cached afterward via browser cache/service worker.