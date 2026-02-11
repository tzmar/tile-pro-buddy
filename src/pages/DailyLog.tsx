import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { DailyLog as DailyLogType } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Save, Clock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { genId } from '@/data/constants';
import { formatPula } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

const MOODS = [
  { value: 'good' as const, label: '😊 Good day' },
  { value: 'okay' as const, label: '😐 Okay' },
  { value: 'tough' as const, label: '😓 Tough day' },
];

export default function DailyLogPage() {
  const { jobs, dailyLogs, addDailyLog } = useApp();
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [view, setView] = useState<'form' | 'history'>('form');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Form state
  const [jobId, setJobId] = useState('');
  const [timeStarted, setTimeStarted] = useState('08:00');
  const [timeFinished, setTimeFinished] = useState('17:00');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [problems, setProblems] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<'good' | 'okay' | 'tough'>('good');

  const activeJobs = jobs.filter(j => j.status === 'active');

  const calcHours = (start: string, end: string): number => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return Math.max(0, diff / 60);
  };

  const hoursWorked = calcHours(timeStarted, timeFinished);

  const handleSave = () => {
    const log: DailyLogType = {
      id: genId(),
      date: selectedDate,
      jobId,
      timeStarted,
      timeFinished,
      hoursWorked,
      materialsUsed,
      problems,
      notes,
      mood,
    };
    addDailyLog(log);
    toast({ title: '✓ Daily log saved' });
    // Reset form
    setMaterialsUsed('');
    setProblems('');
    setNotes('');
  };

  // Summaries
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const weekLogs = dailyLogs.filter(l => l.date >= weekStartStr);
  const monthLogs = dailyLogs.filter(l => l.date.startsWith(monthStr));
  const weekHours = weekLogs.reduce((s, l) => s + l.hoursWorked, 0);
  const monthHours = monthLogs.reduce((s, l) => s + l.hoursWorked, 0);
  const uniqueMonthJobs = new Set(monthLogs.map(l => l.jobId).filter(Boolean)).size;

  // Calendar view
  const [calYear, calMonth] = calendarMonth.split('-').map(Number);
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay();
  const logDates = new Set(dailyLogs.map(l => l.date));

  const prevMonth = () => {
    const d = new Date(calYear, calMonth - 2, 1);
    setCalendarMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const nextMonth = () => {
    const d = new Date(calYear, calMonth, 1);
    setCalendarMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const logsForDate = useMemo(() => {
    return dailyLogs.filter(l => l.date === selectedDate);
  }, [dailyLogs, selectedDate]);

  const exportLogs = () => {
    const text = dailyLogs
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(l => {
        const j = jobs.find(j => j.id === l.jobId);
        return `Date: ${l.date}\nJob: ${j?.clientName || 'N/A'}\nTime: ${l.timeStarted} - ${l.timeFinished} (${l.hoursWorked.toFixed(1)}h)\nMaterials: ${l.materialsUsed || 'N/A'}\nProblems: ${l.problems || 'None'}\nNotes: ${l.notes || 'N/A'}\nMood: ${MOODS.find(m => m.value === l.mood)?.label || l.mood}\n`;
      }).join('\n---\n\n');

    const blob = new Blob([`TilePro Helper - Daily Work Logs\n${'='.repeat(40)}\n\n${text}`], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `work-logs-${today}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast({ title: '✓ Logs exported' });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <CalendarDays className="h-5 w-5" /> Daily Work Diary
      </h2>

      {/* Summaries */}
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{weekHours.toFixed(1)}h</p>
            <p className="text-[10px] text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-success mb-1" />
            <p className="text-lg font-bold">{monthHours.toFixed(1)}h</p>
            <p className="text-[10px] text-muted-foreground">{uniqueMonthJobs} jobs this month</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button variant={view === 'form' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setView('form')}>
          Log Entry
        </Button>
        <Button variant={view === 'history' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setView('history')}>
          History
        </Button>
      </div>

      {view === 'form' ? (
        <>
          {/* Date */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <Label className="text-xs">Date</Label>
                <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
              </div>

              <div>
                <Label className="text-xs">Job / Client</Label>
                <Select value={jobId} onValueChange={setJobId}>
                  <SelectTrigger><SelectValue placeholder="Select job..." /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {activeJobs.map(j => (
                      <SelectItem key={j.id} value={j.id}>{j.clientName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Started</Label>
                  <Input type="time" value={timeStarted} onChange={e => setTimeStarted(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Finished</Label>
                  <Input type="time" value={timeFinished} onChange={e => setTimeFinished(e.target.value)} />
                </div>
              </div>

              <div className="rounded-lg bg-primary/10 p-2 text-center">
                <p className="text-xs text-muted-foreground">Hours Worked</p>
                <p className="text-xl font-bold text-primary">{hoursWorked.toFixed(1)}h</p>
              </div>

              <div>
                <Label className="text-xs">Materials Used</Label>
                <Input placeholder="e.g., 2 bags adhesive, 10 tiles..." value={materialsUsed} onChange={e => setMaterialsUsed(e.target.value)} />
              </div>

              <div>
                <Label className="text-xs">Problems Encountered</Label>
                <Textarea placeholder="Any issues today..." value={problems} onChange={e => setProblems(e.target.value)} rows={2} />
              </div>

              <div>
                <Label className="text-xs">Notes / Observations</Label>
                <Textarea placeholder="General notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
              </div>

              <div>
                <Label className="text-xs">How was your day?</Label>
                <div className="flex gap-2 mt-1">
                  {MOODS.map(m => (
                    <Button
                      key={m.value}
                      variant={mood === m.value ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setMood(m.value)}
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} className="w-full h-12 gap-2" size="lg">
                <Save className="h-5 w-5" /> Save Daily Log
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <CardTitle className="text-sm">
                  {new Date(calYear, calMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <span key={d} className="text-muted-foreground font-medium">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const hasLog = logDates.has(dateStr);
                  const isSelected = dateStr === selectedDate;
                  return (
                    <button
                      key={day}
                      onClick={() => { setSelectedDate(dateStr); }}
                      className={`aspect-square rounded-md text-xs flex items-center justify-center transition-colors
                        ${isSelected ? 'bg-primary text-primary-foreground' : hasLog ? 'bg-success/20 text-success font-bold' : 'hover:bg-secondary'}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Logs for selected date */}
          {logsForDate.length > 0 ? (
            logsForDate.map(log => {
              const j = jobs.find(j => j.id === log.jobId);
              return (
                <Card key={log.id}>
                  <CardContent className="p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold">{j?.clientName || 'No job selected'}</span>
                      <span>{MOODS.find(m => m.value === log.mood)?.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.timeStarted} – {log.timeFinished} ({log.hoursWorked.toFixed(1)}h)
                    </div>
                    {log.materialsUsed && <p className="text-xs"><span className="text-muted-foreground">Materials:</span> {log.materialsUsed}</p>}
                    {log.problems && <p className="text-xs"><span className="text-muted-foreground">Problems:</span> {log.problems}</p>}
                    {log.notes && <p className="text-xs"><span className="text-muted-foreground">Notes:</span> {log.notes}</p>}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No logs for {selectedDate}
              </CardContent>
            </Card>
          )}

          {/* Export */}
          {dailyLogs.length > 0 && (
            <Button variant="outline" className="w-full gap-2" onClick={exportLogs}>
              Export All Logs
            </Button>
          )}
        </>
      )}
    </div>
  );
}
