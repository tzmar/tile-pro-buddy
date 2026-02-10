import { useState } from 'react';
import { Job } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, ChevronDown, ChevronRight, ListChecks } from 'lucide-react';

interface Props { job: Job; updateJob: (j: Job) => void; }

export default function TasksTab({ job, updateJob }: Props) {
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const groups = Array.from(new Set(job.tasks.map(t => t.group)));
  const completedCount = job.tasks.filter(t => t.completed).length;
  const totalCount = job.tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleTask = (id: string) => {
    updateJob({
      ...job,
      tasks: job.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
    });
  };

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Progress</span>
            </div>
            <span className="text-sm font-bold text-primary">{completedCount}/{totalCount}</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% complete</p>
        </CardContent>
      </Card>

      {/* Task Groups */}
      {groups.map(group => {
        const groupTasks = job.tasks.filter(t => t.group === group);
        const groupDone = groupTasks.filter(t => t.completed).length;
        const isCollapsed = collapsedGroups.has(group);
        const allDone = groupDone === groupTasks.length;

        return (
          <Card key={group} className={allDone ? 'border-success/30' : ''}>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleGroup(group)}>
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className={allDone ? 'text-success' : ''}>{group}</span>
                </div>
                <span className={`text-xs ${allDone ? 'text-success' : 'text-muted-foreground'}`}>
                  {groupDone}/{groupTasks.length} {allDone && '✓'}
                </span>
              </CardTitle>
            </CardHeader>
            {!isCollapsed && (
              <CardContent className="space-y-1 pt-0">
                {groupTasks.map(task => (
                  <div key={task.id} className="space-y-1">
                    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                      <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-0.5" />
                      <span className={`text-sm flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.label}
                      </span>
                      <Button
                        variant="ghost" size="sm"
                        className={`h-6 w-6 p-0 shrink-0 ${expandedTip === task.id ? 'text-accent' : 'text-muted-foreground'}`}
                        onClick={() => setExpandedTip(expandedTip === task.id ? null : task.id)}
                      >
                        <Lightbulb className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {expandedTip === task.id && (
                      <div className="ml-8 p-2 rounded-lg bg-accent/10 text-xs text-accent-foreground">
                        💡 {task.tip}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
