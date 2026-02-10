import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Job, JobType, Room } from '@/types/job';
import { JOB_TYPES, ESSENTIAL_TOOLS, TASK_WORKFLOW, genId } from '@/data/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, User, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

export default function NewJob() {
  const { addJob, settings } = useApp();
  const navigate = useNavigate();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [address, setAddress] = useState('');
  const [jobType, setJobType] = useState<JobType>('bathroom');
  const [rooms, setRooms] = useState<Room[]>([{ id: genId(), name: '', length: 0, width: 0 }]);
  const [startDate, setStartDate] = useState('');
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [notes, setNotes] = useState('');

  const totalSqm = rooms.reduce((s, r) => s + r.length * r.width, 0);

  const updateRoom = (id: string, field: keyof Room, value: string | number) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addRoom = () => setRooms(prev => [...prev, { id: genId(), name: '', length: 0, width: 0 }]);
  const removeRoom = (id: string) => setRooms(prev => prev.filter(r => r.id !== id));

  const handleSave = () => {
    if (!clientName.trim()) return;
    const job: Job = {
      id: genId(),
      clientName: clientName.trim(),
      clientPhone, clientEmail, address,
      jobType, rooms,
      startDate, estimatedCompletion, notes,
      materials: { tileSize: settings.commonTileSizes[0] || 30, tileCostPerSqm: 0, adhesiveCostPerBag: 0, groutCostPerBag: 0, sealerCostPerLiter: 0, needsSealer: false },
      tools: ESSENTIAL_TOOLS.map(t => ({ ...t, owned: false, borrowed: false, borrowedFrom: '' })),
      tasks: TASK_WORKFLOW.map(t => ({ ...t, completed: false, timeSpent: 0 })),
      timer: { totalWorkSeconds: 0, totalBreakSeconds: 0, currentSessionStart: null, isRunning: false, onBreak: false },
      costing: { hourlyRate: settings.hourlyRate, profitMargin: settings.defaultProfitMargin, paymentStatus: 'not-paid', paymentDate: '' },
      endOfDayToolsChecked: {},
      status: 'active',
      createdAt: new Date().toISOString(),
      completedAt: '',
    };
    addJob(job);
    navigate(`/job/${job.id}`);
  };

  const defaultRoomName = (type: JobType) => {
    switch (type) {
      case 'bathroom': return 'Bathroom';
      case 'kitchen': return 'Kitchen';
      case 'single-room': return 'Room';
      case 'repair': return 'Repair Area';
      default: return '';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">New Job Setup</h2>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Client Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Client name *" className="pl-9" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Phone number" className="pl-9" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Email" className="pl-9" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Job address" className="pl-9" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Job Type</CardTitle></CardHeader>
        <CardContent>
          <Select value={jobType} onValueChange={(v: JobType) => {
            setJobType(v);
            if (v !== 'full-house' && rooms.length <= 1) {
              setRooms([{ id: rooms[0]?.id || genId(), name: defaultRoomName(v), length: rooms[0]?.length || 0, width: rooms[0]?.width || 0 }]);
            }
          }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover">
              {JOB_TYPES.map(jt => <SelectItem key={jt.value} value={jt.value}>{jt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Rooms / Areas</CardTitle>
            {(jobType === 'full-house' || rooms.length > 0) && (
              <Button variant="ghost" size="sm" onClick={addRoom} className="h-8 text-xs gap-1">
                <PlusCircle className="h-3.5 w-3.5" /> Add Room
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rooms.map((room, i) => (
            <div key={room.id} className="p-3 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Room {i + 1}</Label>
                {rooms.length > 1 && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => removeRoom(room.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <Input placeholder="Room name" value={room.name} onChange={e => updateRoom(room.id, 'name', e.target.value)} className="text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Length (m)</Label>
                  <Input type="number" min={0} step={0.1} value={room.length || ''} onChange={e => updateRoom(room.id, 'length', parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Width (m)</Label>
                  <Input type="number" min={0} step={0.1} value={room.width || ''} onChange={e => updateRoom(room.id, 'width', parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Area: <span className="font-semibold text-foreground">{(room.length * room.width).toFixed(2)} m²</span></p>
            </div>
          ))}

          <div className="p-3 rounded-lg bg-primary/10 text-center">
            <p className="text-xs text-muted-foreground">Total Area</p>
            <p className="text-2xl font-bold text-primary">{totalSqm.toFixed(2)} m²</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Schedule</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Start Date</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Estimated Completion</Label>
            <Input type="date" value={estimatedCompletion} onChange={e => setEstimatedCompletion(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder="Special requirements, client preferences..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full h-14 text-base gap-2" size="lg" disabled={!clientName.trim()}>
        Create Job <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
