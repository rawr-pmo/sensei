import { useState } from 'react';
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