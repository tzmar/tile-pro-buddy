import { Job } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calculator, Package } from 'lucide-react';
import { formatPula } from '@/lib/currency';

interface Props { job: Job; updateJob: (j: Job) => void; }

export default function OverviewTab({ job, updateJob }: Props) {
  const totalSqm = job.rooms.reduce((s, r) => s + r.length * r.width, 0);
  const mat = job.materials;

  const tileSizeCm = mat.tileSize;
  const tileSizeM = tileSizeCm / 100;
  const tileArea = tileSizeM * tileSizeM;
  const tilesNeeded = tileArea > 0 ? Math.ceil((totalSqm / tileArea) * 1.1) : 0;
  const adhesiveBags = Math.ceil(totalSqm / 5);
  const groutBags = Math.ceil(totalSqm / 10);
  const sealerLiters = mat.needsSealer ? Math.ceil(totalSqm * 0.2) : 0;

  const tileCost = totalSqm * mat.tileCostPerSqm;
  const adhesiveCost = adhesiveBags * mat.adhesiveCostPerBag;
  const groutCost = groutBags * mat.groutCostPerBag;
  const sealerCost = sealerLiters * mat.sealerCostPerLiter;
  const totalMatCost = tileCost + adhesiveCost + groutCost + sealerCost;

  const updateMat = (field: string, value: number | boolean) => {
    updateJob({ ...job, materials: { ...job.materials, [field]: value } });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Rooms Summary */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4" /> Rooms</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            {job.rooms.map(r => (
              <div key={r.id} className="flex justify-between text-sm">
                <span>{r.name || 'Unnamed'}</span>
                <span className="font-medium">{(r.length * r.width).toFixed(1)} m²</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-border flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">{totalSqm.toFixed(1)} m²</span>
          </div>
        </CardContent>
      </Card>

      {/* Materials Calculator */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Calculator className="h-4 w-4" /> Materials Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Tile Size (cm)</Label>
            <Input type="number" min={1} value={mat.tileSize || ''} onChange={e => updateMat('tileSize', parseFloat(e.target.value) || 0)} />
          </div>

          <div className="rounded-lg bg-secondary/50 p-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Tiles needed (incl. 10% waste)</span><span className="font-bold">{tilesNeeded}</span></div>
            <div className="flex justify-between"><span>Adhesive bags (1 per 5m²)</span><span className="font-bold">{adhesiveBags}</span></div>
            <div className="flex justify-between"><span>Grout bags (1 per 10m²)</span><span className="font-bold">{groutBags}</span></div>
            <div className="flex items-center justify-between">
              <span>Sealer needed?</span>
              <Switch checked={mat.needsSealer} onCheckedChange={v => updateMat('needsSealer', v)} />
            </div>
            {mat.needsSealer && <div className="flex justify-between"><span>Sealer (liters)</span><span className="font-bold">{sealerLiters}</span></div>}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Material Costs</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Tile cost/m²</Label>
                <Input type="number" min={0} step={0.01} value={mat.tileCostPerSqm || ''} onChange={e => updateMat('tileCostPerSqm', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Adhesive/bag</Label>
                <Input type="number" min={0} step={0.01} value={mat.adhesiveCostPerBag || ''} onChange={e => updateMat('adhesiveCostPerBag', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Grout/bag</Label>
                <Input type="number" min={0} step={0.01} value={mat.groutCostPerBag || ''} onChange={e => updateMat('groutCostPerBag', parseFloat(e.target.value) || 0)} />
              </div>
              {mat.needsSealer && (
                <div>
                  <Label className="text-xs text-muted-foreground">Sealer/liter</Label>
                  <Input type="number" min={0} step={0.01} value={mat.sealerCostPerLiter || ''} onChange={e => updateMat('sealerCostPerLiter', parseFloat(e.target.value) || 0)} />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-primary/10 p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Material Cost</p>
            <p className="text-2xl font-bold text-primary">{formatPula(totalMatCost)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Job Info */}
      <Card>
        <CardContent className="p-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="capitalize">{job.jobType.replace('-', ' ')}</span></div>
          {job.startDate && <div className="flex justify-between"><span className="text-muted-foreground">Start</span><span>{job.startDate}</span></div>}
          {job.estimatedCompletion && <div className="flex justify-between"><span className="text-muted-foreground">Est. Complete</span><span>{job.estimatedCompletion}</span></div>}
          {job.notes && <div className="pt-2 border-t border-border"><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm">{job.notes}</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
