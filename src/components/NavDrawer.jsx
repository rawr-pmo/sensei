import { Link, useLocation } from 'react-router-dom';

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
