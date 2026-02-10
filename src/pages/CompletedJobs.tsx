import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronRight, Search, ClipboardCheck, Ruler, DollarSign } from 'lucide-react';

export default function CompletedJobs() {
  const { jobs } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const completed = jobs
    .filter(j => j.status === 'completed')
    .filter(j => !search || j.clientName.toLowerCase().includes(search.toLowerCase()) || j.address.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  const totalEarnings = completed.reduce((sum, j) => {
    const sqm = j.rooms.reduce((s, r) => s + r.length * r.width, 0);
    const matCost = sqm * j.materials.tileCostPerSqm + Math.ceil(sqm / 5) * j.materials.adhesiveCostPerBag + Math.ceil(sqm / 10) * j.materials.groutCostPerBag;
    const laborCost = (j.timer.totalWorkSeconds / 3600) * j.costing.hourlyRate;
    return sum + (matCost + laborCost) * (1 + j.costing.profitMargin / 100);
  }, 0);

  const totalSqm = completed.reduce((sum, j) => sum + j.rooms.reduce((s, r) => s + r.length * r.width, 0), 0);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Completed Jobs</h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <ClipboardCheck className="h-4 w-4 mx-auto text-success mb-1" />
            <p className="text-lg font-bold">{completed.length}</p>
            <p className="text-[10px] text-muted-foreground">Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">${totalEarnings.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Ruler className="h-4 w-4 mx-auto text-accent mb-1" />
            <p className="text-lg font-bold">{totalSqm.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">m² Tiled</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Job List */}
      <div className="space-y-2">
        {completed.map(job => {
          const sqm = job.rooms.reduce((s, r) => s + r.length * r.width, 0);
          return (
            <Card key={job.id} className="cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate(`/job/${job.id}`)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{job.clientName}</p>
                  <p className="text-xs text-muted-foreground truncate">{job.address}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{sqm.toFixed(1)}m²</span>
                    <span>{new Date(job.completedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          );
        })}
        {completed.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No completed jobs yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
