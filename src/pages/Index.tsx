import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, PlusCircle, ShoppingCart, TrendingUp, Ruler, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { jobs, shoppingList } = useApp();
  const navigate = useNavigate();

  const activeJobs = jobs.filter(j => j.status === 'active');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const totalEarnings = completedJobs.reduce((sum, j) => {
    const matCost = j.rooms.reduce((s, r) => s + r.length * r.width, 0) * j.materials.tileCostPerSqm;
    const laborCost = j.costing.hourlyRate * (j.timer.totalWorkSeconds / 3600);
    const total = matCost + laborCost;
    return sum + total * (1 + j.costing.profitMargin / 100);
  }, 0);
  const totalSqm = completedJobs.reduce((sum, j) => sum + j.rooms.reduce((s, r) => s + r.length * r.width, 0), 0);
  const unpurchased = shoppingList.filter(i => !i.purchased).length;

  return (
    <div className="p-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4 flex flex-col items-center">
            <Briefcase className="h-6 w-6 mb-1" />
            <span className="text-2xl font-bold">{activeJobs.length}</span>
            <span className="text-xs opacity-90">Active Jobs</span>
          </CardContent>
        </Card>
        <Card className="bg-success text-success-foreground">
          <CardContent className="p-4 flex flex-col items-center">
            <TrendingUp className="h-6 w-6 mb-1" />
            <span className="text-2xl font-bold">{completedJobs.length}</span>
            <span className="text-xs opacity-90">Completed</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">Total Earned</span>
            <span className="text-xl font-bold text-foreground">${totalEarnings.toFixed(0)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <Ruler className="h-5 w-5 text-muted-foreground mb-1" />
            <span className="text-xl font-bold text-foreground">{totalSqm.toFixed(0)}m²</span>
            <span className="text-xs text-muted-foreground">Tiled</span>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => navigate('/new-job')} className="h-14 text-sm gap-2" size="lg">
          <PlusCircle className="h-5 w-5" /> New Job
        </Button>
        <Button onClick={() => navigate('/shopping')} variant="outline" className="h-14 text-sm gap-2 relative" size="lg">
          <ShoppingCart className="h-5 w-5" /> Shopping List
          {unpurchased > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{unpurchased}</span>
          )}
        </Button>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Active Jobs</h2>
          <div className="space-y-2">
            {activeJobs.map(job => {
              const sqm = job.rooms.reduce((s, r) => s + r.length * r.width, 0);
              const tasksDone = job.tasks.filter(t => t.completed).length;
              const tasksTotal = job.tasks.length;
              return (
                <Card key={job.id} className="cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate(`/job/${job.id}`)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{job.clientName}</p>
                      <p className="text-xs text-muted-foreground truncate">{job.address}</p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{sqm.toFixed(1)}m²</span>
                        <span>{tasksDone}/{tasksTotal} tasks</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeJobs.length === 0 && completedJobs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold">No jobs yet</p>
            <p className="text-sm text-muted-foreground mt-1">Tap "New Job" to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
