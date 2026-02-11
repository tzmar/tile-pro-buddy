import { useApp } from '@/context/AppContext';
import { Settings as SettingsType } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings2, Ruler, ShoppingCart, Download, Upload } from 'lucide-react';
import { APP_VERSION } from '@/data/constants';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

export default function SettingsPage() {
  const { settings, updateSettings, jobs, shoppingList, dailyLogs } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const importRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof SettingsType, value: unknown) => {
    updateSettings({ ...settings, [field]: value });
  };

  const handleExportAll = () => {
    const data = {
      version: APP_VERSION,
      exportDate: new Date().toISOString(),
      jobs: JSON.parse(localStorage.getItem('tilepro-jobs') || '[]'),
      settings: JSON.parse(localStorage.getItem('tilepro-settings') || '{}'),
      shopping: JSON.parse(localStorage.getItem('tilepro-shopping') || '[]'),
      dailyLogs: JSON.parse(localStorage.getItem('tilepro-dailylogs') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tilepro-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast({ title: '✓ Data exported', description: 'Check your downloads folder' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.jobs) localStorage.setItem('tilepro-jobs', JSON.stringify(data.jobs));
        if (data.settings) localStorage.setItem('tilepro-settings', JSON.stringify(data.settings));
        if (data.shopping) localStorage.setItem('tilepro-shopping', JSON.stringify(data.shopping));
        if (data.dailyLogs) localStorage.setItem('tilepro-dailylogs', JSON.stringify(data.dailyLogs));
        toast({ title: '✓ Data imported', description: 'Reload the app to see changes' });
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        toast({ title: 'Import failed', description: 'Invalid file format', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2"><Settings2 className="h-5 w-5" /> Settings</h2>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Business</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Your Name</Label>
            <Input value={settings.userName || ''} onChange={e => update('userName', e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <Label className="text-xs">Business Name</Label>
            <Input value={settings.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Your business name" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">💰 Pricing</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Hourly Labor Rate (P)</Label>
            <Input type="number" min={0} value={settings.hourlyRate || ''} onChange={e => update('hourlyRate', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs">Default Profit Margin (%)</Label>
            <Input type="number" min={0} max={100} value={settings.defaultProfitMargin || ''} onChange={e => update('defaultProfitMargin', parseFloat(e.target.value) || 0)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Ruler className="h-4 w-4" /> Measurements</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Measurement Unit</Label>
            <Select value={settings.measurementUnit} onValueChange={v => update('measurementUnit', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="meters">Meters</SelectItem>
                <SelectItem value="feet">Feet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Common Tile Sizes (cm)</Label>
            <div className="flex gap-2 flex-wrap mt-1">
              {settings.commonTileSizes.map((size, i) => (
                <Input key={i} type="number" className="w-20" value={size || ''} onChange={e => {
                  const sizes = [...settings.commonTileSizes];
                  sizes[i] = parseFloat(e.target.value) || 0;
                  update('commonTileSizes', sizes);
                }} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">📦 Data Backup</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full gap-2" onClick={handleExportAll}>
            <Download className="h-4 w-4" /> Export All Data
          </Button>
          <input type="file" accept=".json" className="hidden" ref={importRef} onChange={handleImport} />
          <Button variant="outline" className="w-full gap-2" onClick={() => importRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import Data
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full h-12 gap-2" onClick={() => navigate('/shopping')}>
        <ShoppingCart className="h-5 w-5" /> Shopping List
      </Button>

      <p className="text-center text-xs text-muted-foreground">TilePro Helper v{APP_VERSION}</p>
    </div>
  );
}
