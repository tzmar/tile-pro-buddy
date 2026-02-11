import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Job, Settings, ShoppingItem, DailyLog } from '@/types/job';
import { DEFAULT_SETTINGS } from '@/data/constants';

interface AppContextType {
  jobs: Job[];
  settings: Settings;
  shoppingList: ShoppingItem[];
  dailyLogs: DailyLog[];
  addJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  deleteJob: (id: string) => void;
  updateSettings: (s: Settings) => void;
  setShoppingList: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  addDailyLog: (log: DailyLog) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(() => load('tilepro-jobs', []));
  const [settings, setSettings] = useState<Settings>(() => load('tilepro-settings', DEFAULT_SETTINGS));
  const [shoppingList, setShoppingListState] = useState<ShoppingItem[]>(() => load('tilepro-shopping', []));
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => load('tilepro-dailylogs', []));

  const addJob = useCallback((job: Job) => {
    setJobs(prev => { const next = [...prev, job]; save('tilepro-jobs', next); return next; });
  }, []);

  const updateJob = useCallback((job: Job) => {
    setJobs(prev => { const next = prev.map(j => j.id === job.id ? job : j); save('tilepro-jobs', next); return next; });
  }, []);

  const deleteJob = useCallback((id: string) => {
    setJobs(prev => { const next = prev.filter(j => j.id !== id); save('tilepro-jobs', next); return next; });
  }, []);

  const updateSettings = useCallback((s: Settings) => {
    setSettings(s); save('tilepro-settings', s);
  }, []);

  const setShoppingList: React.Dispatch<React.SetStateAction<ShoppingItem[]>> = useCallback((action) => {
    setShoppingListState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      save('tilepro-shopping', next);
      return next;
    });
  }, []);

  const addDailyLog = useCallback((log: DailyLog) => {
    setDailyLogs(prev => { const next = [...prev, log]; save('tilepro-dailylogs', next); return next; });
  }, []);

  return (
    <AppContext.Provider value={{ jobs, settings, shoppingList, dailyLogs, addJob, updateJob, deleteJob, updateSettings, setShoppingList, addDailyLog }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
