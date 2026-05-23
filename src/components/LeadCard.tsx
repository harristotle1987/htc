import React from 'react';
import { Lead } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DollarSign, Clock, AlertTriangle, Zap, GripHorizontal } from 'lucide-react';

interface LeadCardProps {
  key?: React.Key;
  lead: Lead;
  onClick: (lead: Lead) => void;
}

export default function LeadCard({ lead, onClick }: LeadCardProps) {
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
      className="bg-card/80 backdrop-blur-md border border-border p-5 rounded-xl shadow-sm hover:border-primary/50 transition-all duration-300 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 relative overflow-hidden mb-3"
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
        <div 
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted p-1 hover:bg-muted/10 rounded cursor-grab active:cursor-grabbing touch-none"
        >
          <GripHorizontal className="w-4 h-4" />
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
    </div>
  );
}
