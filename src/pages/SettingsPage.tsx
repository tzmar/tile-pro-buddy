import { useApp } from '@/context/AppContext';
import { Settings as SettingsType } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings2, DollarSign, Ruler, ShoppingCart } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useApp();
  const navigate = useNavigate();

  const update = (field: keyof SettingsType, value: unknown) => {
    updateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2"><Settings2 className="h-5 w-5" /> Settings</h2>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Business</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Business Name</Label>
            <Input value={settings.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Your business name" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4" /> Pricing</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Hourly Labor Rate ($)</Label>
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

      <Button variant="outline" className="w-full h-12 gap-2" onClick={() => navigate('/shopping')}>
        <ShoppingCart className="h-5 w-5" /> Shopping List
      </Button>
    </div>
  );
}
