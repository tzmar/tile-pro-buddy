import { Job, PaymentStatus } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Receipt } from 'lucide-react';

interface Props { job: Job; updateJob: (j: Job) => void; }

export default function CostingTab({ job, updateJob }: Props) {
  const totalSqm = job.rooms.reduce((s, r) => s + r.length * r.width, 0);
  const mat = job.materials;

  const tileSizeM = mat.tileSize / 100;
  const tileArea = tileSizeM * tileSizeM;
  const adhesiveBags = Math.ceil(totalSqm / 5);
  const groutBags = Math.ceil(totalSqm / 10);
  const sealerLiters = mat.needsSealer ? Math.ceil(totalSqm * 0.2) : 0;

  const materialsCost = (totalSqm * mat.tileCostPerSqm) + (adhesiveBags * mat.adhesiveCostPerBag) + (groutBags * mat.groutCostPerBag) + (sealerLiters * mat.sealerCostPerLiter);

  const workHours = job.timer.totalWorkSeconds / 3600;
  const laborCost = workHours * job.costing.hourlyRate;
  const subtotal = materialsCost + laborCost;
  const profitAmount = subtotal * (job.costing.profitMargin / 100);
  const quotePrice = subtotal + profitAmount;

  const updateCosting = (field: string, value: number | string) => {
    updateJob({ ...job, costing: { ...job.costing, [field]: value } });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Cost Breakdown */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Receipt className="h-4 w-4" /> Cost Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-secondary/50 p-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Materials</span><span>${materialsCost.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Labor ({workHours.toFixed(1)}h × ${job.costing.hourlyRate})</span><span>${laborCost.toFixed(2)}</span></div>
            <div className="flex justify-between font-medium pt-1 border-t border-border"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          </div>

          <div>
            <Label className="text-xs">Hourly Rate ($)</Label>
            <Input type="number" min={0} value={job.costing.hourlyRate || ''} onChange={e => updateCosting('hourlyRate', parseFloat(e.target.value) || 0)} />
          </div>

          <div>
            <Label className="text-xs">Profit Margin: {job.costing.profitMargin}%</Label>
            <Slider
              value={[job.costing.profitMargin]}
              onValueChange={([v]) => updateCosting('profitMargin', v)}
              min={20} max={50} step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>20%</span><span>50%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 text-center">
          <DollarSign className="h-8 w-8 mx-auto text-primary mb-1" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Quote Price to Client</p>
          <p className="text-4xl font-bold text-primary">${quotePrice.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Includes {job.costing.profitMargin}% profit (${profitAmount.toFixed(2)})</p>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Payment Status</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={job.costing.paymentStatus} onValueChange={(v: PaymentStatus) => updateCosting('paymentStatus', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="not-paid">Not Paid</SelectItem>
              <SelectItem value="deposit">Deposit Paid</SelectItem>
              <SelectItem value="fully-paid">Fully Paid</SelectItem>
            </SelectContent>
          </Select>
          {job.costing.paymentStatus !== 'not-paid' && (
            <div>
              <Label className="text-xs">Payment Date</Label>
              <Input type="date" value={job.costing.paymentDate} onChange={e => updateCosting('paymentDate', e.target.value)} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
