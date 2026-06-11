import BigButton from '../components/BigButton.jsx';

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