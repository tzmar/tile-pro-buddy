import { useState, useEffect } from 'react';
import { Job } from '@/types/job';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Coffee, Clock } from 'lucide-react';

interface Props { job: Job; updateJob: (j: Job) => void; }

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TimerTab({ job, updateJob }: Props) {
  const timer = job.timer;
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!timer.isRunning) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timer.isRunning]);

  const currentElapsed = timer.currentSessionStart
    ? Math.floor((Date.now() - new Date(timer.currentSessionStart).getTime()) / 1000)
    : 0;

  const displayWork = timer.onBreak ? timer.totalWorkSeconds : timer.totalWorkSeconds + (timer.isRunning ? currentElapsed : 0);
  const displayBreak = timer.onBreak ? timer.totalBreakSeconds + (timer.isRunning ? currentElapsed : 0) : timer.totalBreakSeconds;

  const handleStart = () => {
    updateJob({
      ...job,
      timer: { ...timer, isRunning: true, currentSessionStart: new Date().toISOString(), onBreak: false },
    });
  };

  const handlePause = () => {
    const elapsed = currentElapsed;
    updateJob({
      ...job,
      timer: {
        ...timer,
        isRunning: false,
        currentSessionStart: null,
        totalWorkSeconds: timer.onBreak ? timer.totalWorkSeconds : timer.totalWorkSeconds + elapsed,
        totalBreakSeconds: timer.onBreak ? timer.totalBreakSeconds + elapsed : timer.totalBreakSeconds,
      },
    });
  };

  const handleBreak = () => {
    const elapsed = currentElapsed;
    if (timer.onBreak) {
      // Resume work
      updateJob({
        ...job,
        timer: {
          ...timer,
          onBreak: false,
          currentSessionStart: new Date().toISOString(),
          totalBreakSeconds: timer.totalBreakSeconds + elapsed,
        },
      });
    } else {
      // Start break
      updateJob({
        ...job,
        timer: {
          ...timer,
          onBreak: true,
          currentSessionStart: new Date().toISOString(),
          totalWorkSeconds: timer.totalWorkSeconds + elapsed,
        },
      });
    }
  };

  const handleStop = () => {
    const elapsed = currentElapsed;
    updateJob({
      ...job,
      timer: {
        totalWorkSeconds: timer.onBreak ? timer.totalWorkSeconds : timer.totalWorkSeconds + elapsed,
        totalBreakSeconds: timer.onBreak ? timer.totalBreakSeconds + elapsed : timer.totalBreakSeconds,
        currentSessionStart: null,
        isRunning: false,
        onBreak: false,
      },
    });
  };

  const workHours = (displayWork / 3600).toFixed(1);

  return (
    <div className="p-4 space-y-4">
      {/* Main Timer Display */}
      <Card className={timer.onBreak ? 'border-accent/50 bg-accent/5' : timer.isRunning ? 'border-primary/50 bg-primary/5' : ''}>
        <CardContent className="p-6 text-center">
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
            {timer.onBreak ? '☕ On Break' : timer.isRunning ? '🔨 Working' : 'Job Timer'}
          </p>
          <p className="text-5xl font-mono font-bold tracking-tight text-foreground">
            {formatTime(timer.onBreak ? displayBreak : displayWork)}
          </p>
          {timer.isRunning && !timer.onBreak && (
            <p className="text-xs text-muted-foreground mt-2">Work time</p>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
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

      {/* Summary */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Summary</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Work time</span>
            <span className="font-mono font-medium">{formatTime(displayWork)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Break time</span>
            <span className="font-mono font-medium">{formatTime(displayBreak)}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-border font-bold">
            <span>Total work hours</span>
            <span className="text-primary">{workHours}h</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
