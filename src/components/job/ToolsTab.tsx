import { useState } from 'react';
import { Job, ToolItem } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, PlusCircle, Wrench, Eye, EyeOff } from 'lucide-react';
import { genId } from '@/data/constants';

interface Props { job: Job; updateJob: (j: Job) => void; }

export default function ToolsTab({ job, updateJob }: Props) {
  const [newTool, setNewTool] = useState('');
  const [mode, setMode] = useState<'pre' | 'end'>('pre');

  const tools = job.tools;
  const ownedTools = tools.filter(t => t.owned && !t.borrowed);
  const borrowedTools = tools.filter(t => t.borrowed);
  const missingEssential = tools.filter(t => t.essential && !t.owned && !t.borrowed);

  const updateTool = (id: string, changes: Partial<ToolItem>) => {
    updateJob({ ...job, tools: tools.map(t => t.id === id ? { ...t, ...changes } : t) });
  };

  const addCustomTool = () => {
    if (!newTool.trim()) return;
    const tool: ToolItem = { id: genId(), name: newTool.trim(), essential: false, owned: false, borrowed: false, borrowedFrom: '', custom: true };
    updateJob({ ...job, tools: [...tools, tool] });
    setNewTool('');
  };

  const toggleEndOfDay = (id: string) => {
    updateJob({ ...job, endOfDayToolsChecked: { ...job.endOfDayToolsChecked, [id]: !job.endOfDayToolsChecked[id] } });
  };

  const allEndOfDayChecked = tools.filter(t => t.owned || t.borrowed).every(t => job.endOfDayToolsChecked[t.id]);

  return (
    <div className="p-4 space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button variant={mode === 'pre' ? 'default' : 'outline'} size="sm" className="flex-1 text-xs" onClick={() => setMode('pre')}>
          <Eye className="h-3.5 w-3.5 mr-1" /> Before Starting
        </Button>
        <Button variant={mode === 'end' ? 'default' : 'outline'} size="sm" className="flex-1 text-xs" onClick={() => setMode('end')}>
          <EyeOff className="h-3.5 w-3.5 mr-1" /> Before Leaving
        </Button>
      </div>

      {mode === 'pre' ? (
        <>
          {/* Missing Essential Warning */}
          {missingEssential.length > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-3 flex gap-2 items-start">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Missing {missingEssential.length} essential tools</p>
                  <p className="text-xs text-muted-foreground">Consider buying or borrowing these tools</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tools List */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wrench className="h-4 w-4" /> Tools Check - Before Starting</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {tools.map(tool => (
                <div key={tool.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                  <Checkbox checked={tool.owned || tool.borrowed} onCheckedChange={v => updateTool(tool.id, { owned: !!v, borrowed: false })} />
                  <span className={`text-sm flex-1 ${!tool.owned && !tool.borrowed && tool.essential ? 'text-warning font-medium' : ''}`}>
                    {tool.name}
                    {tool.essential && !tool.owned && !tool.borrowed && <AlertTriangle className="inline h-3 w-3 ml-1 text-warning" />}
                  </span>
                  {tool.borrowed && <Badge variant="destructive" className="text-[10px] h-5">BORROWED</Badge>}
                  <Button
                    variant={tool.borrowed ? 'destructive' : 'ghost'}
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => updateTool(tool.id, { borrowed: !tool.borrowed, owned: !tool.borrowed })}
                  >
                    {tool.borrowed ? 'Own' : 'Borrow'}
                  </Button>
                </div>
              ))}

              {/* Add Custom Tool */}
              <div className="flex gap-2 pt-2">
                <Input placeholder="Add custom tool..." value={newTool} onChange={e => setNewTool(e.target.value)} className="text-sm"
                  onKeyDown={e => e.key === 'Enter' && addCustomTool()} />
                <Button size="sm" onClick={addCustomTool} disabled={!newTool.trim()}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Borrowed Tools with Owner */}
          {borrowedTools.length > 0 && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-destructive">Borrowed Tools</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {borrowedTools.map(tool => (
                  <div key={tool.id} className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs shrink-0">{tool.name}</Badge>
                    <Input placeholder="Borrowed from..." value={tool.borrowedFrom} className="text-sm h-8"
                      onChange={e => updateTool(tool.id, { borrowedFrom: e.target.value })} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* My Tools Summary */}
          {ownedTools.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-success">My Tools ({ownedTools.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {ownedTools.map(t => <Badge key={t.id} variant="secondary" className="text-xs">{t.name}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* End of Day Check */
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tools Check - Before Leaving Job Site</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tools.filter(t => t.owned || t.borrowed).map(tool => (
              <div key={tool.id} className={`flex items-center gap-2 p-2 rounded-lg ${tool.borrowed ? 'bg-destructive/10' : 'bg-secondary/30'}`}>
                <Checkbox checked={!!job.endOfDayToolsChecked[tool.id]} onCheckedChange={() => toggleEndOfDay(tool.id)} />
                <span className="text-sm flex-1">{tool.name}</span>
                {tool.borrowed && <Badge variant="destructive" className="text-[10px] h-5">BORROWED</Badge>}
                {!job.endOfDayToolsChecked[tool.id] && (
                  <span className="text-xs text-warning font-medium">⚠️ Missing</span>
                )}
              </div>
            ))}
            {allEndOfDayChecked && tools.filter(t => t.owned || t.borrowed).length > 0 && (
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <p className="text-sm font-semibold text-success">✓ All tools accounted for</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
