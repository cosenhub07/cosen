import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  BarChart2, 
  FileText, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  // Unread counts
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Poll unread DM count every 30s
  useEffect(() => {
    if (!user) return;
    const fetchDMs = async () => {
      try {
        const { data } = await api.get('/conversations/unread-count');
        setUnreadMessages(data.count || 0);
      } catch { /* ignore */ }
    };
    fetchDMs();
    const id = setInterval(fetchDMs, 30000);
    return () => clearInterval(id);
  }, [user]);

  // Poll notification count every 30s
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const { data } = await api.get('/notifications/count');
        setUnreadNotifs(data.unread || 0);
      } catch { /* ignore */ }
    };
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30000);
    return () => clearInterval(id);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Checklist', path: '/browse', icon: CheckSquare }, 
    { name: 'Calendar', path: '/orders', icon: Calendar },    
    { name: 'Messages', path: '/messages', icon: MessageSquare, badge: unreadMessages > 0 ? unreadMessages : null },
    { name: 'Data analytics', path: '/profile', icon: BarChart2 },
    { name: 'Alerts', path: '/notifications', icon: FileText, badge: unreadNotifs > 0 ? unreadNotifs : null }, // Changed to Alerts for notifications
  ];

  const sidebarContent = (
    <div className={`flex flex-col h-full overflow-y-auto ${darkMode ? 'bg-[#3b3559] text-white' : 'bg-white text-slate-800'}`}>
      
      {/* Profile Section */}
      <div className="flex flex-col items-center pt-10 pb-6">
        <div className="relative">
          <img 
            src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} 
            alt="Profile" 
            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
          />
          {/* Decorative dots from the design */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-red-400 rounded-full"></div>
          <div className="absolute bottom-1 left-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
        </div>
        <h2 className="mt-4 font-bold text-lg">{user?.name || 'Kunal Goyal'}</h2>
        {darkMode && <p className="text-xs text-slate-300 mb-2">{user?.email || 'kunal@example.com'}</p>}
        <div className={`mt-1 text-[10px] font-bold px-3 py-1 rounded-full ${darkMode ? 'bg-white/10 text-slate-300' : 'bg-purple-50 text-purple-600'}`}>
          Prime User
        </div>
      </div>

      {darkMode && <div className="border-t border-white/10 mx-6 mb-6"></div>}

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        {navLinks.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                isActive 
                  ? (darkMode ? 'bg-[#4b446a] text-purple-300' : 'bg-purple-50 text-purple-700 font-bold')
                  : (darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50 font-medium')
              }`}
            >
              <div className="flex items-center gap-4">
                <link.icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : ''}`} />
                <span>{link.name}</span>
              </div>
              
              {link.badge && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-400 text-white text-[10px] font-bold">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-6 mt-auto">
        {!darkMode && <div className="border-t border-slate-100 mb-4 mx-2"></div>}
        {darkMode && <div className="border-t border-white/10 mb-4 mx-2"></div>}
        
        <Link 
          to="/profile" 
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50 font-medium'}`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-red-400 hover:bg-red-50 font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>

        {/* Dark Mode Toggle */}
        <div className={`mt-6 flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer ${darkMode ? 'bg-[#4b446a]' : 'bg-slate-50'}`} onClick={() => setDarkMode(!darkMode)}>
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-purple-300" /> : <Sun className="w-5 h-5 text-slate-400" />}
            <span className={`font-medium ${darkMode ? 'text-purple-300' : 'text-slate-500'}`}>Dark mode</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-purple-500/50' : 'bg-slate-200'}`}>
            <div className={`w-4 h-4 rounded-full transition-transform ${darkMode ? 'translate-x-4 bg-purple-300' : 'bg-white shadow-sm'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block w-[280px] h-screen sticky top-0 border-r ${darkMode ? 'border-[#3b3559]' : 'border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Header & Hamburger */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 border-b ${darkMode ? 'bg-[#3b3559] border-white/10' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">C</div>
          <span className={`font-display font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Cosen</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className={`p-2 rounded-lg ${darkMode ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-50'}`}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className={`relative w-[280px] max-w-[80vw] h-full shadow-2xl transition-transform ${darkMode ? 'bg-[#3b3559]' : 'bg-white'}`}>
            <button 
              onClick={() => setMobileOpen(false)} 
              className={`absolute top-4 right-4 p-2 rounded-lg ${darkMode ? 'text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
