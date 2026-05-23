import { MetricData, Lead } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import AnalyticsChart from './AnalyticsChart';

interface DashboardProps {
  metrics: MetricData | null;
  leads?: Lead[];
  loading?: boolean;
  tier?: string | null;
}

export default function Dashboard({ metrics, leads = [], loading = false, tier = 'free' }: DashboardProps) {
  const isBlur = tier === 'free';
  // Fallback state logic always renders this panel now
  // Compute metrics dynamically if leads are provided
  let computedAverageDealSize = metrics?.averageDealSize || '$0';
  let computedCashCollected = metrics?.cashCollected || '$0';
  let showToClose = metrics?.showToCloseRate || '0%';
  let talkToListen = metrics?.talkToListenRatio || '32% / 68%';
  
  if (leads.length > 0) {
    const dealsWithSize = leads.filter(l => l.dealSize && l.dealSize > 0);
    if (dealsWithSize.length > 0) {
      const sum = dealsWithSize.reduce((acc, curr) => acc + (curr.dealSize || 0), 0);
      const avg = Math.round(sum / dealsWithSize.length);
      computedAverageDealSize = '$' + avg.toLocaleString();
    }
    
    const wonLeads = leads.filter(l => l.stage === 'Closed-Won');
    const cash = wonLeads.reduce((acc, curr) => acc + (curr.dealSize || 0), 0);
    computedCashCollected = '$' + cash.toLocaleString();
  }

  // Parse Talk to Listen KPI to check if ratio drops under 35 (the conversational boundary)
  let isUnder35 = false;
  const match = talkToListen.match(/(\d+)%/); // e.g., "32% / 68%" -> 32
  if (match) {
    if (parseInt(match[1], 10) < 35) {
      isUnder35 = true;
    }
  } else if (!isNaN(parseFloat(talkToListen)) && parseFloat(talkToListen) < 35) {
    isUnder35 = true;
  }

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="w-full shrink-0 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 w-full border-b bg-background border-border transition-colors duration-300">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border/50 shadow-sm p-5 rounded-lg flex flex-col justify-center animate-pulse transition-colors duration-300">
              <div className="h-3 w-1/2 bg-muted rounded mb-3"></div>
              <div className="h-6 w-3/4 bg-muted/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Show-to-Close Rate', value: showToClose },
    { label: 'Average Deal Size', value: isBlur ? '***' : computedAverageDealSize },
    { label: 'Cash Collected', value: computedCashCollected },
    { 
      label: 'Talk : Listen Ratio', 
      value: isBlur ? '**% / **%' : talkToListen,
      // The premium mini-indicator light component for the gold pulse boundary marker
      indicator: !isBlur && isUnder35 ? (
        <span className="relative flex h-2.5 w-2.5 ml-2 top-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-400"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
        </span>
      ) : null
    }
  ];

  return (
    <div className="w-full shrink-0 z-10 flex flex-col">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 w-full border-b bg-background border-border transition-colors duration-300">
        <AnimatePresence mode="popLayout">
          {cards.map((card, i) => (
            <motion.div 
              key={`${card.label}-${card.value}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-card border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 p-4 md:p-5 flex flex-col rounded-xl relative overflow-hidden group transition-all duration-300"
            >
            {/* Label Group */}
            <div className="flex items-center mb-2">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                {card.label}
              </p>
              {card.indicator}
            </div>
            
            {/* Values using high-contrast typography exactly as specified */}
            <div className="mt-auto flex items-baseline z-10 relative">
              <p className="text-foreground text-xl md:text-2xl font-bold tracking-tight font-mono">
                {card.value}
              </p>
            </div>
            
            {/* Subtle flare effect */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-[30px] group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
      <AnalyticsChart />
    </div>
  );
}
