import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import OverviewTab from '@/components/job/OverviewTab';
import ToolsTab from '@/components/job/ToolsTab';
import TasksTab from '@/components/job/TasksTab';
import TimerTab from '@/components/job/TimerTab';
import CostingTab from '@/components/job/CostingTab';
import PhotosTab from '@/components/job/PhotosTab';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { jobs, updateJob } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const job = jobs.find(j => j.id === id);
  if (!job) return <div className="p-4 text-center text-muted-foreground">Job not found</div>;

  const handleComplete = () => {
    updateJob({ ...job, status: 'completed', completedAt: new Date().toISOString() });
    navigate('/completed');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{job.clientName}</p>
            <p className="text-xs text-muted-foreground truncate">{job.address}</p>
          </div>
        </div>
        {job.status === 'active' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs gap-1 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" /> Complete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Complete this job?</AlertDialogTitle>
                <AlertDialogDescription>This will move the job to your completed jobs list.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleComplete}>Complete Job</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none h-10 bg-card border-b border-border shrink-0">
          <TabsTrigger value="overview" className="text-xs flex-1">Overview</TabsTrigger>
          <TabsTrigger value="tools" className="text-xs flex-1">Tools</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs flex-1">Tasks</TabsTrigger>
          <TabsTrigger value="photos" className="text-xs flex-1">📸</TabsTrigger>
          <TabsTrigger value="timer" className="text-xs flex-1">Timer</TabsTrigger>
          <TabsTrigger value="costing" className="text-xs flex-1">Cost</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-auto">
          <TabsContent value="overview" className="m-0"><OverviewTab job={job} updateJob={updateJob} /></TabsContent>
          <TabsContent value="tools" className="m-0"><ToolsTab job={job} updateJob={updateJob} /></TabsContent>
          <TabsContent value="tasks" className="m-0"><TasksTab job={job} updateJob={updateJob} /></TabsContent>
          <TabsContent value="photos" className="m-0"><PhotosTab job={job} updateJob={updateJob} /></TabsContent>
          <TabsContent value="timer" className="m-0"><TimerTab job={job} updateJob={updateJob} /></TabsContent>
          <TabsContent value="costing" className="m-0"><CostingTab job={job} updateJob={updateJob} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
