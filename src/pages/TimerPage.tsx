import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Coffee, Clock } from 'lucide-react';

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TimerPage() {
  const { jobs, updateJob } = useApp();
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  const activeJob = jobs.find(j => j.status === 'active' && j.timer.isRunning) || jobs.find(j => j.status === 'active');

  useEffect(() => {
    if (!activeJob?.timer.isRunning) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [activeJob?.timer.isRunning]);

  if (!activeJob) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Clock className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="font-semibold text-lg">No Active Job</p>
        <p className="text-sm text-muted-foreground mt-1">Create a new job to start tracking time</p>
        <Button onClick={() => navigate('/new-job')} className="mt-4">New Job</Button>
      </div>
    );
  }

  const timer = activeJob.timer;
  const currentElapsed = timer.currentSessionStart
    ? Math.floor((Date.now() - new Date(timer.currentSessionStart).getTime()) / 1000)
    : 0;

  const displayWork = timer.onBreak ? timer.totalWorkSeconds : timer.totalWorkSeconds + (timer.isRunning ? currentElapsed : 0);
  const displayBreak = timer.onBreak ? timer.totalBreakSeconds + (timer.isRunning ? currentElapsed : 0) : timer.totalBreakSeconds;

  const handleStart = () => {
    updateJob({
      ...activeJob,
      timer: { ...timer, isRunning: true, currentSessionStart: new Date().toISOString(), onBreak: false },
    });
  };

  const handlePause = () => {
    const elapsed = currentElapsed;
    updateJob({
      ...activeJob,
      timer: {
        ...timer, isRunning: false, currentSessionStart: null,
        totalWorkSeconds: timer.onBreak ? timer.totalWorkSeconds : timer.totalWorkSeconds + elapsed,
        totalBreakSeconds: timer.onBreak ? timer.totalBreakSeconds + elapsed : timer.totalBreakSeconds,
      },
    });
  };

  const handleBreak = () => {
    const elapsed = currentElapsed;
    if (timer.onBreak) {
      updateJob({
        ...activeJob,
        timer: { ...timer, onBreak: false, currentSessionStart: new Date().toISOString(), totalBreakSeconds: timer.totalBreakSeconds + elapsed },
      });
    } else {
      updateJob({
        ...activeJob,
        timer: { ...timer, onBreak: true, currentSessionStart: new Date().toISOString(), totalWorkSeconds: timer.totalWorkSeconds + elapsed },
      });
    }
  };

  const handleStop = () => {
    const elapsed = currentElapsed;
    updateJob({
      ...activeJob,
      timer: {
        totalWorkSeconds: timer.onBreak ? timer.totalWorkSeconds : timer.totalWorkSeconds + elapsed,
        totalBreakSeconds: timer.onBreak ? timer.totalBreakSeconds + elapsed : timer.totalBreakSeconds,
        currentSessionStart: null, isRunning: false, onBreak: false,
      },
    });
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="cursor-pointer" onClick={() => navigate(`/job/${activeJob.id}`)}>
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{activeJob.clientName}</p>
            <p className="text-xs text-muted-foreground">{activeJob.address}</p>
          </div>
          <span className="text-xs text-primary">View Job →</span>
        </CardContent>
      </Card>

      <Card className={timer.onBreak ? 'border-accent/50 bg-accent/5' : timer.isRunning ? 'border-primary/50 bg-primary/5' : ''}>
        <CardContent className="p-8 text-center">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            {timer.onBreak ? '☕ On Break' : timer.isRunning ? '🔨 Working' : 'Job Timer'}
          </p>
          <p className="text-6xl font-mono font-bold tracking-tight text-foreground">
            {formatTime(timer.onBreak ? displayBreak : displayWork)}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {!timer.isRunning ? (
          <Button onClick={handleStart} className="h-16 text-lg gap-2 col-span-2" size="lg">
            <Play className="h-6 w-6" /> START
          </Button>
        ) : (
          <>
            <Button onClick={handlePause} variant="outline" className="h-16 text-base gap-2" size="lg">
              <Pause className="h-5 w-5" /> Pause
            </Button>
            <Button onClick={handleStop} variant="destructive" className="h-16 text-base gap-2" size="lg">
              <Square className="h-5 w-5" /> Stop
            </Button>
          </>
        )}
      </div>

      {timer.isRunning && (
        <Button onClick={handleBreak} variant={timer.onBreak ? 'default' : 'secondary'} className="w-full h-12 gap-2" size="lg">
          <Coffee className="h-5 w-5" />
          {timer.onBreak ? 'Resume Work' : 'Take a Break'}
        </Button>
      )}

      <Card>
        <CardContent className="p-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Work</p>
            <p className="text-lg font-mono font-bold">{formatTime(displayWork)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Break</p>
            <p className="text-lg font-mono font-bold">{formatTime(displayBreak)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
