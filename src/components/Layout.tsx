import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Timer, ClipboardCheck, Settings, CalendarDays } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/new-job', icon: PlusCircle, label: 'New' },
  { path: '/daily-log', icon: CalendarDays, label: 'Diary' },
  { path: '/timer', icon: Timer, label: 'Timer' },
  { path: '/completed', icon: ClipboardCheck, label: 'Jobs' },
  { path: '/settings', icon: Settings, label: 'More' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground px-4 py-3.5 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shadow-sm">
            <span className="text-accent-foreground text-sm font-black">JT</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none">Job Tasker</h1>
            <p className="text-[10px] opacity-75 font-medium">Manage your trades</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-0.5 w-14 h-full transition-all duration-200 relative ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
                )}
                <item.icon className={`h-5 w-5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
