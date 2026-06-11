import React from 'react';
import { Lead, Stage } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DollarSign, Clock, AlertTriangle, Zap, GripHorizontal, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { STAGES } from './Board';

interface LeadCardProps {
  key?: React.Key;
  lead: Lead;
  onClick: (lead: Lead) => void;
  onMove?: (leadId: string, newStage: Stage) => void;
}

export default function LeadCard({ lead, onClick, onMove }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: {
      type: 'Lead',
      lead,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getHeatBorderClasses = (nextFollowUp: string | undefined): string => {
    if (!nextFollowUp) return 'border border-border';
    const followUpDate = new Date(nextFollowUp);
    const today = new Date();
    
    // Set to midnight for proper day comparison
    today.setHours(0, 0, 0, 0);
    followUpDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - followUpDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 3) return 'border-2 border-red-500';
    if (diffDays > 0) return 'border-2 border-orange-400';
    return 'border border-border';
  };

  const heatClasses = getHeatBorderClasses(lead.nextFollowUp);

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style}
        className="bg-card/30 border-2 border-primary/50 opacity-40 p-4 rounded-xl shadow-md min-h-[120px] backdrop-blur-sm mb-3"
      />
    );
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-card/80 backdrop-blur-md ${heatClasses} p-5 rounded-xl shadow-sm hover:border-primary/50 transition-all duration-300 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 relative overflow-hidden mb-3`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[30px] pointer-events-none -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500"></div>

      <div className="flex justify-between items-start mb-4 gap-2 relative z-10">
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onClick(lead)}
        >
          <h4 className="font-display font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{lead.name}</h4>
          <p className="text-xs text-muted font-medium line-clamp-1 mt-0.5">{lead.company}</p>
        </div>
        <div className="flex gap-1 items-center">
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="p-1.5 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
              aria-label="Email"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="w-3.5 h-3.5 text-primary" />
            </a>
          )}
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="p-1.5 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
              aria-label="Phone"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
            </a>
          )}
          <div 
            {...attributes}
            {...listeners}
            className="transition-opacity text-muted p-1.5 hover:bg-muted/10 rounded cursor-grab active:cursor-grabbing touch-none"
          >
            <GripHorizontal className="w-4 h-4" />
          </div>
        </div>
      </div>
      
      <div 
        className="flex flex-wrap items-center gap-2 mb-3 relative z-10 cursor-pointer"
        onClick={() => onClick(lead)}
      >
        <span className="flex items-center gap-1 text-[10px] font-bold text-primary-foreground bg-primary px-2 py-1 rounded-md shadow-sm">
          <DollarSign className="w-3 h-3 text-primary-foreground opacity-70" />
          {lead.dealSize.toLocaleString()}
        </span>
        {lead.callType && (
          <span className="text-[9px] uppercase tracking-wider font-bold text-primary-blue bg-primary-blue/10 border border-primary-blue/20 px-2 py-1 rounded-md shadow-inner">
            {lead.callType}
          </span>
        )}
        {lead.priority && (
          <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-md shadow-inner border ${
            lead.priority === 'High' ? 'text-red-400 bg-red-400/10 border-red-400/20' : 
            lead.priority === 'Medium' ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' : 
            'text-green-400 bg-green-400/10 border-green-400/20'
          }`}>
            {lead.priority}
          </span>
        )}
      </div>

      {(lead.bleedingNeck || lead.emotionalAnchor || lead.nextFollowUp) && (
        <div 
          className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-border relative z-10 cursor-pointer"
          onClick={() => onClick(lead)}
        >
          {lead.bleedingNeck && (
            <div className="text-[10px] text-muted bg-red-500/5 border border-red-500/10 p-2 rounded-md line-clamp-1 group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-colors">
              <span className="font-bold text-red-500 mr-1 flex items-center gap-1 inline-flex">
                <AlertTriangle className="w-3 h-3" /> Pain:
              </span>
              {lead.bleedingNeck}
            </div>
          )}
          {lead.emotionalAnchor && !lead.bleedingNeck && (
            <div className="text-[10px] text-muted bg-background/50 border border-border p-2 rounded-md line-clamp-1">
              <span className="font-bold text-foreground mr-1 flex items-center gap-1 inline-flex">
                <Zap className="w-3 h-3 text-primary" /> Tension:
              </span>
              {lead.emotionalAnchor}
            </div>
          )}
          {lead.nextFollowUp && (
            <div className="flex items-center gap-1 text-[10px] text-muted font-medium mt-1">
              <Clock className="w-3 h-3 opacity-60" /> Follow up: {lead.nextFollowUp}
            </div>
          )}
        </div>
      )}

      {onMove && (
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50 relative z-10 transition-opacity opacity-100">
          <button 
            className="p-1 hover:bg-muted/50 rounded text-muted transition-colors disabled:opacity-30"
            disabled={STAGES.indexOf(lead.stage as Stage) === 0}
            onClick={(e) => { e.stopPropagation(); onMove(lead.id, STAGES[STAGES.indexOf(lead.stage as Stage) - 1]); }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Move</span>
          <button 
            className="p-1 hover:bg-muted/50 rounded text-muted transition-colors disabled:opacity-30"
            disabled={STAGES.indexOf(lead.stage as Stage) === STAGES.length - 1}
            onClick={(e) => { e.stopPropagation(); onMove(lead.id, STAGES[STAGES.indexOf(lead.stage as Stage) + 1]); }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
