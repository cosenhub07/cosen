import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // We can add logic to hide the mobile header padding on specific routes if needed,
  // but generally, we want to pad the top so the mobile header doesn't obscure content.
  const isMobileHeaderRoute = true;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar handles both Desktop (fixed side) and Mobile (slide-over) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto ${isMobileHeaderRoute ? 'pt-16 lg:pt-0' : ''}`}>
        {/* We add pb-20 on mobile just in case we still want some bottom padding, but we removed the bottom nav */}
        <div className="w-full max-w-7xl mx-auto min-h-full pb-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
