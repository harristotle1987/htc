export type Stage = 
  | 'Discovery Scheduled'
  | 'Post-Discovery'
  | 'Pitch Complete'
  | 'Active Negotiation'
  | 'Pending Payment'
  | 'Closed-Won'
  | 'Nurture / Long-Term';

export type Quadrant = 
  | 'Manage Closely'
  | 'Keep Satisfied'
  | 'Keep Informed'
  | 'Monitor';

export type Status = 'Champion' | 'Saboteur' | 'Neutral';

export interface MetricData {
  id?: string;
  totalCalls?: string;
  shows?: string;
  closes?: string;
  totalRevenue?: string;
  refunds?: string;
  setToCloseRatio?: string;
  pipelineVelocity?: string;
  talkToListenRatio?: string;
  showToCloseRate?: string;
  averageDealSize?: string;
  cashCollected?: string;
}

export interface Stakeholder {
  id: string;
  leadId: string;
  name: string;
  role: string;
  quadrant: Quadrant;
  status: Status;
  primaryFear?: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  completed: boolean;
  dueDate?: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  dealSize: number;
  stage: Stage;
  callType?: string;
  bleedingNeck?: string;
  emotionalAnchor: string;
  coi: string;
  futureIdentity?: string;
  budgetAnchor?: string;
  nextFollowUp: string;
  notes?: string;
  email?: string;
  phone?: string;
  closerId?: string;
  closerPercentage?: number;
  amountPaid?: number;
  paymentConfirmed?: boolean;
  talkToListenRatio?: number;
  stakeholders?: Stakeholder[];
  tasks?: Task[];
}

export interface Payment {
  id: string | number;
  amount: number;
  reference: string;
  tier: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscription: string;
  subscriptionExpiresAt?: string | null;
  isAdmin: boolean;
  avatarUrl?: string;
  lastPage?: string;
}
