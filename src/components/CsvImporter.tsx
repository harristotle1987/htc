import { apiFetch } from "../lib/api";
import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Upload, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CsvImporterProps {
  onImport: () => void;
}

export default function CsvImporter({ onImport }: CsvImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMapping, setShowMapping] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLeads, setPreviewLeads] = useState<any[]>([]);
  const [fullLeads, setFullLeads] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const aegisFields = [
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'dealSize', label: 'Deal Size' },
    { key: 'stage', label: 'Stage' },
    { key: 'callType', label: 'Call Type' },
    { key: 'bleedingNeck', label: 'Bleeding Neck' },
    { key: 'emotionalAnchor', label: 'Emotional Anchor' },
    { key: 'coi', label: 'Cost of Inaction' },
    { key: 'futureIdentity', label: 'Future Identity' },
    { key: 'budgetAnchor', label: 'Budget Anchor' },
    { key: 'nextFollowUp', label: 'Next Follow Up' },
    { key: 'notes', label: 'Notes' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setColumns(results.meta.fields || []);
        setFullLeads(results.data);
        setShowMapping(true);
      }
    });
  };

  const applyMapping = () => {
    const leads = fullLeads.map((row: any) => ({
      name: row[mapping.name] || '',
      company: row[mapping.company] || '',
      dealSize: Number(row[mapping.dealSize]) || 0,
      stage: row[mapping.stage] || 'Discovery Scheduled',
      callType: row[mapping.callType] || '',
      bleedingNeck: row[mapping.bleedingNeck] || '',
      emotionalAnchor: row[mapping.emotionalAnchor] || '',
      coi: row[mapping.coi] || '',
      futureIdentity: row[mapping.futureIdentity] || '',
      budgetAnchor: row[mapping.budgetAnchor] || '',
      nextFollowUp: row[mapping.nextFollowUp] || '',
      notes: row[mapping.notes] || ''
    }));
    setFullLeads(leads);
    setPreviewLeads(leads.slice(0, 5));
    setShowMapping(false);
    setShowPreview(true);
  };

  const confirmImport = async () => {
    await apiFetch('/api/leads/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads: fullLeads })
    });
    setShowPreview(false);
    onImport();
  };

  return (
    <>
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-colors"
      >
        <Upload size={16} /> Import CSV
      </button>
      <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />

      <AnimatePresence>
        {showMapping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-4">Map CSV Columns</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {aegisFields.map(field => (
                  <div key={field.key} className="flex flex-col gap-1">
                    <label className="text-xs text-muted uppercase">{field.label}</label>
                    <select 
                      className="bg-background border border-border rounded p-2 text-sm"
                      onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                      value={mapping[field.key] || ''}
                    >
                      <option value="">Select Column</option>
                      {columns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button onClick={applyMapping} className="w-full bg-primary text-primary-foreground p-2 rounded-lg font-bold hover:brightness-110">Continue to Preview</button>
            </motion.div>
          </motion.div>
        )}
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-4">Preview First 5 Leads</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm text-left">
                  <thead className="text-muted uppercase text-xs">
                    <tr>
                      <th className="px-2 py-2">Name</th>
                      <th className="px-2 py-2">Company</th>
                      <th className="px-2 py-2">Deal Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewLeads.map((lead, i) => (
                      <tr key={i}>
                        <td className="px-2 py-2">{lead.name}</td>
                        <td className="px-2 py-2">{lead.company}</td>
                        <td className="px-2 py-2">{lead.dealSize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4 justify-end">
                <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-muted hover:text-foreground">
                  <X size={16} /> Cancel
                </button>
                <button onClick={confirmImport} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-colors">
                  <Check size={16} /> Confirm Import ({fullLeads.length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
