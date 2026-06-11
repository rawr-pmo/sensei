export default function Header({ onMenuClick }) {
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
