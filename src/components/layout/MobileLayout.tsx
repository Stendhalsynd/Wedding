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
    <div className="min-h-app-screen relative mx-auto flex w-full max-w-md flex-col bg-slate-50">
      {/* Main Content Area */}
      <main className="hide-scrollbar flex-1 overflow-y-auto pb-safe-nav">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-safe-bottom">
        <nav className="pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between rounded-t-3xl border-t border-white/50 bg-slate-50/80 px-5 py-3 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 transition-all duration-200 ${
                  isActive ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`rounded-xl p-1.5 ${isActive ? 'clay-btn-active bg-rose-50' : ''}`}>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
