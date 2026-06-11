import React, { useMemo, useState, useRef } from 'react';
import { Lead, Stage } from '../types';
import LeadCard from './LeadCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  TouchSensor,
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragEndEvent, 
  DragOverEvent 
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'motion/react';

export const STAGES: Stage[] = [
  'Discovery Scheduled',
  'Post-Discovery',
  'Pitch Complete',
  'Active Negotiation',
  'Pending Payment',
  'Closed-Won',
  'Nurture / Long-Term'
];

interface BoardProps {
  leads: Lead[];
  onDragEnd: (leadId: string, newStage: Stage) => void;
  onLeadClick: (lead: Lead) => void;
  isReadOnly?: boolean;
}

function Column({ stage, leads, onLeadClick, onMove }: { key?: React.Key; stage: Stage, leads: Lead[], onLeadClick: (lead: Lead) => void, onMove: (leadId: string, newStage: Stage) => void }) {
  const { setNodeRef, isOver } = useSortable({
    id: stage,
    data: {
      type: 'Column',
      stage,
    }
  });
  
  const leadIds = useMemo(() => leads.map(l => l.id), [leads]);

  return (
    <div 
      ref={setNodeRef}
      className={`flex-shrink-0 w-full min-h-[500px] bg-card rounded-xl flex flex-col border overflow-hidden shadow-sm transition-all duration-300 ${isOver ? 'border-primary ring-1 ring-primary/20 z-10' : 'border-border/80'}`}
    >
      <div className="px-4 py-3 border-b border-border bg-card flex justify-between items-center z-10 shrink-0">
        <h3 className="font-bold text-[13px] uppercase tracking-[0.05em] text-foreground">{stage}</h3>
        <span className="font-bold text-[13px] text-foreground">
          {leads.length}
        </span>
      </div>
      
      <div className="flex-1 p-3 bg-background flex flex-col min-h-[400px] relative">
        <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} onMove={onMove} />
          ))}
        </SortableContext>
        
        {/* The dashed placeholder when empty or when dragging over */}
        <div className={`mt-2 flex-1 min-h-[50px] max-h-[80px] w-full flex items-center justify-center text-muted-foreground/60 text-[11px] font-medium border border-dashed border-border rounded-lg transition-colors duration-300 ${
          leads.length === 0 ? 'opacity-100' : (isOver ? 'opacity-100 border-primary bg-primary/5' : 'opacity-0 hidden')
        }`}>
          Drop leads here
        </div>
      </div>
    </div>
  );
}

export default function Board({ leads, onDragEnd, onLeadClick, isReadOnly }: BoardProps) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const activeSensors = isReadOnly ? [] : sensors;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340 + 16; // column width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find(l => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: add visual treatments on drag over
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) return;

    // Is it dropping over a column?
    const isOverColumn = over.data.current?.type === 'Column';
    const isOverLead = over.data.current?.type === 'Lead';

    let newStage: Stage | undefined;

    if (isOverColumn) {
      newStage = over.data.current?.stage as Stage;
    } else if (isOverLead) {
      newStage = over.data.current?.lead.stage as Stage;
    }

    if (newStage) {
      onDragEnd(activeId, newStage);
    }
  };

  return (
    <div className="flex flex-col relative group/board">
      {/* Scroll controls and status descriptor */}
      <div className="flex items-center justify-between gap-4 mb-3 px-1">
        <span className="text-xs text-muted flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          {isReadOnly ? 'Read-only mode. Upgrade plan to enable dragging.' : 'Drag cards to advance stage | Scroll horizontally to view sections'}
        </span>
        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={() => scroll('left')}
            className="p-2 rounded-lg bg-card/80 border border-border mt-auto relative z-10 text-muted hover:text-primary hover:bg-primary/5 hover:border-primary/30 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
            title="Scroll Left"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            type="button"
            onClick={() => scroll('right')}
            className="p-2 rounded-lg bg-card/80 border border-border mt-auto relative z-10 text-muted hover:text-primary hover:bg-primary/5 hover:border-primary/30 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
            title="Scroll Right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <DndContext 
        sensors={activeSensors} 
        collisionDetection={closestCorners} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div 
          ref={scrollContainerRef}
          className="flex flex-col md:flex-row gap-4 md:overflow-x-auto pb-8 transition-all duration-300 md:horizontal-scrollbar"
        >
          {STAGES.map(stage => {
            const columnLeads = leads.filter(l => l.stage === stage);
            return (
              <div 
                key={stage} 
                className="w-full md:shrink-0 md:w-[320px] lg:w-[340px]"
              >
                <Column 
                  stage={stage} 
                  leads={columnLeads} 
                  onLeadClick={onLeadClick} 
                  onMove={onDragEnd}
                />
              </div>
            );
          })}
        </div>
        <DragOverlay>
          {activeLead ? (
            <div className="rotate-3 scale-105 opacity-95 shadow-2xl cursor-grabbing rounded-xl overflow-hidden pointer-events-none ring-2 ring-primary/50">
              <LeadCard lead={activeLead} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
