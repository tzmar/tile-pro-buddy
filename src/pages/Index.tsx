import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, PlusCircle, ShoppingCart, TrendingUp, ChevronRight, CalendarDays, Clock, Hammer, Paintbrush, Cpu, Wrench as WrenchIcon, Car, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPula } from '@/lib/currency';

const SKILL_CATEGORIES = [
  { label: 'Tiling', icon: Hammer, colorClass: 'bg-skill-construction text-accent-foreground' },
  { label: 'Painting', icon: Paintbrush, colorClass: 'bg-skill-painting text-accent-foreground' },
  { label: 'Electronics', icon: Cpu, colorClass: 'bg-skill-electronics text-accent-foreground' },
  { label: 'Plumbing', icon: WrenchIcon, colorClass: 'bg-skill-plumbing text-accent-foreground' },
  { label: 'Mechanics', icon: Car, colorClass: 'bg-skill-mechanics text-accent-foreground' },
  { label: 'Electrical', icon: Zap, colorClass: 'bg-skill-ceiling text-accent-foreground' },
];

export default function Dashboard() {
  const { jobs, shoppingList, settings, dailyLogs } = useApp();
  const navigate = useNavigate();

  const activeJobs = jobs.filter(j => j.status === 'active');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const totalEarnings = completedJobs.reduce((sum, j) => {
    const matCost = j.rooms.reduce((s, r) => s + r.length * r.width, 0) * j.materials.tileCostPerSqm;
    const laborCost = j.costing.hourlyRate * (j.timer.totalWorkSeconds / 3600);
    const total = matCost + laborCost;
    return sum + total * (1 + j.costing.profitMargin / 100);
  }, 0);
  const unpurchased = shoppingList.filter(i => !i.purchased).length;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekHours = dailyLogs.filter(l => l.date >= weekStartStr).reduce((s, l) => s + l.hoursWorked, 0);

  const todayStr = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const userName = settings.userName || settings.businessName || '';

  return (
    <div className="p-4 space-y-5">
      {/* Welcome */}
      <div className="pt-1">
        <h2 className="text-xl font-bold tracking-tight">
          {userName ? `Hello, ${userName} 👋` : 'Welcome back 👋'}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">{todayStr}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="border-0 shadow-md">
          <CardContent className="p-3 flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold">{activeJobs.length}</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Active</span>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-3 flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <span className="text-lg font-bold">{completedJobs.length}</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Done</span>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-3 flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-accent" />
            </div>
            <span className="text-lg font-bold">{weekHours.toFixed(0)}h</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Week</span>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-3 flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
              <span className="text-xs font-bold text-primary">P</span>
            </div>
            <span className="text-lg font-bold">{formatPula(totalEarnings).replace('P', '')}</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Earned</span>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => navigate('/new-job')} className="h-14 text-sm gap-2 shadow-md" size="lg">
          <PlusCircle className="h-5 w-5" /> New Job
        </Button>
        <Button onClick={() => navigate('/daily-log')} variant="outline" className="h-14 text-sm gap-2 shadow-sm" size="lg">
          <CalendarDays className="h-5 w-5" /> Log Work
        </Button>
        <Button onClick={() => navigate('/shopping')} variant="outline" className="h-14 text-sm gap-2 relative shadow-sm" size="lg">
          <ShoppingCart className="h-5 w-5" /> Shopping
          {unpurchased > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{unpurchased}</span>
          )}
        </Button>
        <Button onClick={() => navigate('/timer')} variant="outline" className="h-14 text-sm gap-2 shadow-sm" size="lg">
          <Clock className="h-5 w-5" /> Timer
        </Button>
      </div>

      {/* Skill Categories */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Skill Categories</h3>
        <div className="grid grid-cols-3 gap-2">
          {SKILL_CATEGORIES.map(skill => (
            <button
              key={skill.label}
              onClick={() => navigate('/new-job')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <div className={`h-10 w-10 rounded-xl ${skill.colorClass} flex items-center justify-center shadow-sm`}>
                <skill.icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">{skill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Jobs</h3>
          <div className="space-y-2">
            {activeJobs.map((job, i) => {
              const sqm = job.rooms.reduce((s, r) => s + r.length * r.width, 0);
              const tasksDone = job.tasks.filter(t => t.completed).length;
              const tasksTotal = job.tasks.length;
              const progress = tasksTotal > 0 ? (tasksDone / tasksTotal) * 100 : 0;
              return (
                <Card
                  key={job.id}
                  className="cursor-pointer active:scale-[0.98] transition-all border-0 shadow-md animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => navigate(`/job/${job.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Hammer className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{job.clientName}</p>
                      <p className="text-xs text-muted-foreground truncate">{job.address}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium shrink-0">{tasksDone}/{tasksTotal}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeJobs.length === 0 && completedJobs.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold">No jobs yet</p>
            <p className="text-sm text-muted-foreground mt-1">Tap "New Job" to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
