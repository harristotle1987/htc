import React, { useState, useEffect } from 'react';
import { Stakeholder, Quadrant, Status } from '../types';
import { Plus, Trash2 } from 'lucide-react';

const QUADRANTS: Quadrant[] = ['Manage Closely', 'Keep Satisfied', 'Keep Informed', 'Monitor'];
const STATUSES: Status[] = ['Champion', 'Saboteur', 'Neutral'];

export default function InfluenceMap({ leadId }: { leadId: string }) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/influence?leadId=${leadId}`)
      .then(res => res.text())
      .then(text => {
        try {
          const data = JSON.parse(text);
          if (data.stakeholders) setStakeholders(data.stakeholders);
        } catch (e) {
          console.error("Influence JSON parse error:", text);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [leadId]);

  const addStakeholder = async () => {
    const tempId = Date.now().toString();
    const newStakeholder: Stakeholder = {
      id: tempId,
      leadId,
      name: '',
      role: '',
      quadrant: 'Monitor',
      status: 'Neutral'
    };
    
    // Optimistic UI update
    setStakeholders(prev => [...prev, newStakeholder]);

    try {
      const res = await fetch('/api/influence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStakeholder)
      });
      const data = await res.json();
      if (data.id && data.id !== tempId) {
        setStakeholders(prev => prev.map(s => s.id === tempId ? { ...s, id: data.id } : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const syncStakeholder = async (id: string, updates: Partial<Stakeholder>) => {
    try {
      await fetch(`/api/influence/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const updateStakeholder = (id: string, field: keyof Stakeholder, value: string) => {
    setStakeholders(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    
    // For dropdowns, sync immediately
    if (field === 'quadrant' || field === 'status') {
      syncStakeholder(id, { [field]: value });
    }
  };

  const handleBlur = (id: string, field: keyof Stakeholder, value: string) => {
    syncStakeholder(id, { [field]: value });
  };

  const removeStakeholder = async (id: string) => {
    // Optimistic UI update
    setStakeholders(prev => prev.filter(s => s.id !== id));

    try {
      await fetch(`/api/influence?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
        <h3 className="text-sm font-semibold tracking-wide text-secondary uppercase">The Influence Map</h3>
        <button 
          onClick={addStakeholder}
          className="text-xs flex items-center gap-1 bg-accent hover:bg-border text-foreground px-2 py-1 rounded transition-colors"
        >
          <Plus className="w-3 h-3" /> Add Stakeholder
        </button>
      </div>
      
      {loading ? (
        <div className="text-sm text-muted text-center py-6 animate-pulse">Loading committee data...</div>
      ) : stakeholders.length === 0 ? (
         <div className="text-sm text-muted text-center py-6 bg-accent/30 rounded-md border border-dashed border-border animate-in fade-in duration-300">
           No stakeholders mapped yet. Identify the committee.
         </div>
      ) : (
        <div className="space-y-3">
          {stakeholders.map((sh) => (
            <div key={sh.id} className="flex flex-col md:flex-row gap-3 bg-accent/20 p-3 rounded-md border border-border items-start md:items-center animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="flex flex-col w-full gap-2">
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center w-full">
                  <input 
                    type="text" 
                    placeholder="Name"
                    value={sh.name}
                    onChange={(e) => updateStakeholder(sh.id, 'name', e.target.value)}
                    onBlur={(e) => handleBlur(sh.id, 'name', e.target.value)}
                    className="w-full md:w-1/4 bg-input/50 backdrop-blur-sm border border-border rounded p-2 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <input 
                    type="text" 
                    placeholder="Role (e.g. CEO)"
                    value={sh.role}
                    onChange={(e) => updateStakeholder(sh.id, 'role', e.target.value)}
                    onBlur={(e) => handleBlur(sh.id, 'role', e.target.value)}
                    className="w-full md:w-1/4 bg-input/50 backdrop-blur-sm border border-border rounded p-2 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <select 
                    value={sh.quadrant}
                    onChange={(e) => updateStakeholder(sh.id, 'quadrant', e.target.value as Quadrant)}
                    className="w-full md:flex-1 bg-input/50 backdrop-blur-sm border border-border rounded p-2 text-sm focus:outline-none focus:border-primary appearance-none transition-colors"
                  >
                    {QUADRANTS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                  <select 
                    value={sh.status}
                    onChange={(e) => updateStakeholder(sh.id, 'status', e.target.value as Status)}
                    className={`w-full md:w-32 border rounded p-2 text-sm focus:outline-none appearance-none transition-colors ${
                      sh.status === 'Champion' ? 'bg-primary/10 border-primary/30 text-primary' : 
                      sh.status === 'Saboteur' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 
                      'bg-input border-border text-foreground'
                    }`}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button 
                    onClick={() => removeStakeholder(sh.id)}
                    className="p-2 sm:p-2.5 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-md border border-red-500/20 transition-colors w-full md:w-auto flex justify-center items-center gap-2 mt-2 md:mt-0 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="md:hidden text-xs font-bold uppercase tracking-wider">Remove Stakeholder</span>
                  </button>
                </div>
                <input 
                  type="text" 
                  placeholder="Primary Fear (e.g. Exposure, Budget Overrun)"
                  value={sh.primaryFear || ''}
                  onChange={(e) => updateStakeholder(sh.id, 'primaryFear', e.target.value)}
                  onBlur={(e) => handleBlur(sh.id, 'primaryFear', e.target.value)}
                  className="w-full bg-input/50 backdrop-blur-sm border border-border rounded p-2 text-xs focus:outline-none focus:border-primary mt-1 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
