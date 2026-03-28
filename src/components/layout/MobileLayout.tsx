import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, BarChart2, Settings } from 'lucide-react';

export default function MobileLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '투어' },
    { path: '/map', icon: MapIcon, label: '지도' },
    { path: '/compare', icon: BarChart2, label: '비교' },
    { path: '/settings', icon: Settings, label: '설정' },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 relative overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 hide-scrollbar">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full bg-slate-50/80 backdrop-blur-md border-t border-white/50 px-6 py-4 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                isActive ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-2 rounded-xl ${isActive ? 'clay-btn-active bg-rose-50' : ''}`}>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
