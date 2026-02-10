export type JobType = 'full-house' | 'bathroom' | 'kitchen' | 'single-room' | 'repair';
export type PaymentStatus = 'not-paid' | 'deposit' | 'fully-paid';
export type Priority = 'high' | 'medium' | 'low';

export interface Room {
  id: string;
  name: string;
  length: number;
  width: number;
}

export interface Materials {
  tileSize: number;
  tileCostPerSqm: number;
  adhesiveCostPerBag: number;
  groutCostPerBag: number;
  sealerCostPerLiter: number;
  needsSealer: boolean;
}

export interface TimerData {
  totalWorkSeconds: number;
  totalBreakSeconds: number;
  currentSessionStart: string | null;
  isRunning: boolean;
  onBreak: boolean;
}

export interface Costing {
  hourlyRate: number;
  profitMargin: number;
  paymentStatus: PaymentStatus;
  paymentDate: string;
}

export interface ToolItem {
  id: string;
  name: string;
  essential: boolean;
  owned: boolean;
  borrowed: boolean;
  borrowedFrom: string;
  custom?: boolean;
}

export interface TaskItem {
  id: string;
  label: string;
  completed: boolean;
  timeSpent: number;
  group: string;
  tip: string;
}

export interface Job {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  address: string;
  jobType: JobType;
  rooms: Room[];
  startDate: string;
  estimatedCompletion: string;
  notes: string;
  materials: Materials;
  tools: ToolItem[];
  tasks: TaskItem[];
  timer: TimerData;
  costing: Costing;
  endOfDayToolsChecked: Record<string, boolean>;
  status: 'active' | 'completed';
  createdAt: string;
  completedAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  estimatedPrice: number;
  priority: Priority;
  purchased: boolean;
}

export interface Settings {
  hourlyRate: number;
  defaultProfitMargin: number;
  commonTileSizes: number[];
  businessName: string;
  measurementUnit: 'meters' | 'feet';
}
