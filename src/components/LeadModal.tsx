import React, { useState, useEffect } from 'react';
import { Lead, Task } from '../types';
import { X, Save, Trash2, Edit3, Target, Crosshair, Calendar, Mail, Loader2, CheckCircle2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import InfluenceMap from './InfluenceMap';
import RecentEmails from './RecentEmails';
import TaskList from './TaskList';
import { motion, AnimatePresence } from 'motion/react';
import { getAccessToken } from '../lib/firebase';

interface LeadModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => void;
  onDelete: (id: string) => void;
}

export default function LeadModal({ lead, onClose, onUpdate, onDelete }: LeadModalProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: lead.name || '',
    company: lead.company || '',
    dealSize: lead.dealSize || 0,
    stage: lead.stage || 'Discovery Scheduled',
    callType: lead.callType || '',
    bleedingNeck: lead.bleedingNeck || '',
    emotionalAnchor: lead.emotionalAnchor || '',
    coi: lead.coi || '',
    futureIdentity: lead.futureIdentity || '',
    budgetAnchor: lead.budgetAnchor || '',
    nextFollowUp: lead.nextFollowUp || '',
    notes: lead.notes || '',
    tasks: lead.tasks || [],
    email: lead.email || '',
    phone: lead.phone || '',
    closerId: lead.closerId || '',
    closerPercentage: lead.closerPercentage || 0,
    amountPaid: lead.amountPaid || 0,
    paymentConfirmed: lead.paymentConfirmed || false,
    talkToListenRatio: lead.talkToListenRatio || 0
  });

  const [calStatus, setCalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    onUpdate(lead.id, formData);
    onClose();
  };

  const handlePushToCalendar = async () => {
    try {
      setCalStatus('loading');
      const token = await getAccessToken();
      if (!token) {
        setCalStatus('error');
        alert("Workspace is not connected. Connect in settings.");
        setTimeout(() => setCalStatus('idle'), 2000);
        return;
      }
      
      const event = {
        summary: `Discovery Call: ${formData.name} (${formData.company})`,
        description: `Revenue Intelligence Intel:\n\nValue Anchor: ${formData.budgetAnchor}\nBleeding Neck: ${formData.bleedingNeck}\nEmotional Anchor: ${formData.emotionalAnchor}\nFuture Identity: ${formData.futureIdentity}`,
        start: {
          dateTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(new Date().getTime() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1h
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
      
      if (!res.ok) throw new Error('Failed to push to calendar');
      setCalStatus('success');
      setTimeout(() => setCalStatus('idle'), 3000);
    } catch (e) {
      console.error(e);
      setCalStatus('error');
      setTimeout(() => setCalStatus('idle'), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col relative"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -mr-48 -mt-48"></div>

        {/* Header */}
        <div className="flex justify-between items-start p-6 lg:p-8 border-b border-border bg-background/30 shrink-0 relative z-10">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-1 group">
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="text-2xl lg:text-3xl font-display font-bold bg-transparent border-b border-border hover:border-primary/50 focus:border-primary focus:outline-none transition-colors w-full p-0 py-1"
                placeholder="Enter Lead Name"
              />
              <Edit3 className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex items-center gap-2 group">
              <input 
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="text-muted font-normal text-sm bg-transparent border-b border-transparent focus:border-border focus:outline-none transition-colors w-full p-0 py-0.5"
                placeholder="Company"
              />
            </div>
            
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg font-bold shadow-inner">
                $
                <input 
                  type="number"
                  name="dealSize"
                  value={formData.dealSize}
                  onChange={handleChange}
                  className="bg-transparent border-none focus:outline-none w-24 no-spinners"
                />
              </div>
              <select 
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="bg-background/80 border border-border text-muted uppercase tracking-wider text-xs px-3 py-2 rounded-lg focus:outline-none font-semibold cursor-pointer appearance-none hover:border-border/80 transition-colors"
              >
                <option value="Discovery Scheduled">Discovery Scheduled</option>
                <option value="Post-Discovery">Post-Discovery</option>
                <option value="Pitch Complete">Pitch Complete</option>
                <option value="Active Negotiation">Active Negotiation</option>
                <option value="Pending Payment">Pending Payment</option>
                <option value="Closed-Won">Closed-Won</option>
                <option value="Nurture / Long-Term">Nurture / Long-Term</option>
              </select>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-muted hover:text-foreground transition-all rounded-full bg-card hover:bg-muted/10 border border-border hover:scale-105 active:scale-95 shrink-0 z-20">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden relative flex">
          <div className="p-6 lg:p-8 overflow-y-auto flex-1 custom-scrollbar space-y-10 relative z-10">
            
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <RecentEmails query={formData.name || ''} />
              <TaskList tasks={formData.tasks || []} onChange={(t) => setFormData(p => ({ ...p, tasks: t }))} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-blue/10 rounded-lg">
                    <Target className="w-5 h-5 text-primary-blue" />
                  </div>
                  <h3 className="text-sm font-bold tracking-widest text-muted uppercase">Sales Diagnosis</h3>
                </div>
                
                {formData.stage === 'Discovery Scheduled' && (
                  <button 
                    onClick={handlePushToCalendar}
                    disabled={calStatus === 'loading' || calStatus === 'success'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      calStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      calStatus === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                      calStatus === 'loading' ? 'bg-muted/10 border-border text-muted cursor-wait' :
                      'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {calStatus === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {calStatus === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {calStatus === 'idle' && <Calendar className="w-3.5 h-3.5" />}
                    {calStatus === 'error' && <Calendar className="w-3.5 h-3.5" />}
                    
                    {calStatus === 'success' ? 'Scheduled' : 'Sync Calendar'}
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5 group">
                        <label className="text-[10px] font-bold text-muted tracking-widest uppercase ml-1">Closer Percentage</label>
                        <input 
                          type="number"
                          name="closerPercentage"
                          value={formData.closerPercentage}
                          onChange={handleChange}
                          className="w-full bg-background/50 border border-border rounded-xl p-3.5 text-sm focus:outline-none focus:border-primary transition-colors shadow-inner"
                        />
                    </div>
                    <div className="space-y-2.5 group">
                        <label className="text-[10px] font-bold text-muted tracking-widest uppercase ml-1">Payment Amount</label>
                        <input 
                          type="number"
                          name="amountPaid"
                          value={formData.amountPaid}
                          onChange={handleChange}
                          className="w-full bg-background/50 border border-border rounded-xl p-3.5 text-sm focus:outline-none focus:border-primary transition-colors shadow-inner"
                        />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="paymentConfirmed"
                      checked={formData.paymentConfirmed}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentConfirmed: e.target.checked }))}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                    />
                    <label className="text-[10px] font-bold text-muted tracking-widest uppercase ml-1">Confirm Payment</label>
                  </div>

                  <div className="space-y-2.5 group">
                    <label className="text-[10px] font-bold text-muted tracking-widest uppercase ml-1">Talk to Listen Ratio (%)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range"
                        name="talkToListenRatio"
                        min="0"
                        max="100"
                        value={formData.talkToListenRatio}
                        onChange={(e) => setFormData(prev => ({ ...prev, talkToListenRatio: parseInt(e.target.value) }))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-sm font-bold text-primary min-w-[3rem] text-right">{formData.talkToListenRatio}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5 group">
                    <label className="text-[10px] font-bold text-muted tracking-widest uppercase ml-1">Script Pathway</label>
                    <select 
                      name="callType"
                      value={formData.callType}
                      onChange={handleChange}
                      className="w-full bg-background/50 border border-border group-hover:border-border/80 rounded-xl p-3.5 text-sm focus:outline-none focus:border-primary transition-colors appearance-none shadow-inner"
                    >
                      <option value="">Select Script Map...</option>
                      <option value="Inbound Warm">Inbound Warm</option>
                      <option value="Cold Outreach">Cold Outreach</option>
                      <option value="Hostile CEO">Hostile CEO</option>
                      <option value="Already Burned">Already Burned</option>
                      <option value="Enterprise Committee">Enterprise Committee</option>
                      <option value="Chronic Overthinker">Chronic Overthinker</option>
                      <option value="Window Shopper">Window Shopper</option>
                      <option value="High-Status Expert">High-Status Expert</option>
                      <option value="Skeptical Technician">Skeptical Technician</option>
                      <option value="Budget Constrained">Budget Constrained</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2.5 group">
                    <label className="text-[10px] font-bold text-muted tracking-widest uppercase ml-1">Budget Anchor</label>
                    <input 
                      type="text"
                      name="budgetAnchor"
                      value={formData.budgetAnchor}
                      onChange={handleChange}
                      placeholder="e.g. $10k-$15k range set"
                      className="w-full bg-background/50 border border-border group-hover:border-border/80 rounded-xl p-3.5 text-sm focus:outline-none focus:border-primary transition-colors shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 group">
                  <label className="text-[10px] font-bold text-red-500/80 tracking-widest uppercase flex items-center gap-2 ml-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> Bleeding Neck
                  </label>
                  <textarea 
                    name="bleedingNeck"
                    value={formData.bleedingNeck}
                    onChange={handleChange}
                    placeholder="What is their most urgent, painful problem right now?"
                    className="w-full bg-background/50 border border-red-500/20 group-hover:border-red-500/40 rounded-xl p-3.5 text-sm focus:outline-none focus:border-red-500 transition-colors min-h-[80px] shadow-inner"
                  />
                </div>
                
                <div className="space-y-2.5 group">
                  <label className="text-[10px] font-bold text-primary/80 tracking-widest uppercase ml-1">Emotional Anchor</label>
                  <textarea 
                    name="emotionalAnchor"
                    value={formData.emotionalAnchor}
                    onChange={handleChange}
                    placeholder="What is their deep 'Why'? (e.g. wants to protect $50M exit)"
                    className="w-full bg-background/50 border border-primary/10 group-hover:border-primary/30 rounded-xl p-3.5 text-sm focus:outline-none focus:border-primary transition-colors min-h-[80px] shadow-inner"
                  />
                </div>

                <div className="space-y-2.5 group">
                  <label className="text-[10px] font-bold text-primary-blue/80 tracking-widest uppercase ml-1">Future Identity</label>
                  <textarea 
                    name="futureIdentity"
                    value={formData.futureIdentity}
                    onChange={handleChange}
                    placeholder="Who do they desperately want to become?"
                    className="w-full bg-background/50 border border-primary-blue/10 group-hover:border-primary-blue/30 rounded-xl p-3.5 text-sm focus:outline-none focus:border-primary-blue transition-colors min-h-[80px] shadow-inner"
                  />
                </div>

                <div className="space-y-2.5 group">
                  <label className="text-[10px] font-bold text-muted tracking-widest uppercase ml-1">Cost of Inaction (COI)</label>
                  <textarea 
                    name="coi"
                    value={formData.coi}
                    onChange={handleChange}
                    placeholder="e.g., $20,000/mo - loss of market share, competitor takeover"
                    className="w-full bg-background/50 border border-border group-hover:border-border/80 rounded-xl p-3.5 text-sm focus:outline-none focus:border-primary transition-colors min-h-[80px] shadow-inner"
                  />
                </div>
                
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-muted tracking-widest uppercase ml-1 flex items-center gap-2">
                    <Crosshair className="w-3 h-3" /> 3-7-14 Cadence Tracker
                  </label>
                  <div className="p-4 bg-background/40 border border-border rounded-xl flex items-center gap-4 flex-wrap">
                    <input 
                      type="date"
                      name="nextFollowUp"
                      value={formData.nextFollowUp}
                      onChange={handleChange}
                      className="bg-card border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary transition-colors shadow-inner"
                    />
                    <div className="flex gap-2">
                      {[3, 7, 14].map(days => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + days);
                            setFormData(prev => ({ ...prev, nextFollowUp: date.toISOString().split('T')[0] }));
                          }}
                          className="text-[11px] uppercase font-bold bg-muted/10 hover:bg-primary/20 hover:text-primary border border-border hover:border-primary/30 px-3 py-2 rounded-lg transition-all"
                        >
                          +{days}d
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <InfluenceMap leadId={lead.id} />

        </div>

        {/* Scroll/Drag Navigation Handle UI */}
        <div className="w-12 bg-background/40 flex flex-col items-center justify-between py-8 shrink-0 border-l border-border relative group/scroll">
          <button 
            onClick={(e) => {
              const el = e.currentTarget.parentElement?.previousElementSibling;
              if (el) el.scrollBy({ top: -200, behavior: 'smooth' });
            }}
            className="p-2 rounded-lg bg-muted/10 hover:bg-primary/20 text-muted hover:text-primary transition-all rotate-0"
            title="Scroll Up"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col gap-1 opacity-20 group-hover/scroll:opacity-100 transition-opacity cursor-ns-resize h-40 items-center justify-center">
            <GripVertical className="w-5 h-5 text-primary" />
            <GripVertical className="w-5 h-5 text-primary" />
            <GripVertical className="w-5 h-5 text-primary" />
          </div>

          <button 
            onClick={(e) => {
              const el = e.currentTarget.parentElement?.previousElementSibling;
              if (el) el.scrollBy({ top: 200, behavior: 'smooth' });
            }}
            className="p-2 rounded-lg bg-muted/10 hover:bg-primary/20 text-muted hover:text-primary transition-all"
            title="Scroll Down"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
        <div className="p-6 lg:p-8 border-t border-border bg-background/50 backdrop-blur-md flex justify-between gap-3 shrink-0 relative z-20">
          <button 
            onClick={() => onDelete(lead.id)}
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 transition-all flex items-center gap-2 group"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" /> <span>Purge</span>
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border border-border hover:bg-muted/10 transition-all text-muted hover:text-foreground"
            >
              Close
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary text-primary-foreground hover:brightness-110 flex items-center gap-2 transition-all shadow-md"
            >
              <Save className="w-4 h-4" /> Save Intel
            </button>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
