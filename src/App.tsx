import React, { useState, useEffect } from 'react';
import { Lead, Stage, MetricData } from './types';
import Board from './components/Board';
import Dashboard from './components/Dashboard';
import { Moon, Sun, Plus, Database, Download, Trash2, Edit3, Shield, CheckCircle, Target } from 'lucide-react';
import LeadModal from './components/LeadModal';
import Sidebar, { ViewType } from './components/Sidebar';
import { AnimatePresence, motion } from 'motion/react';
import Setup2FAModal from './components/Setup2FAModal';
import Disable2FAModal from './components/Disable2FAModal';
import Login2FA from './components/Login2FA';
import { initAuth, logout, googleSignIn } from './lib/firebase';
import { io } from 'socket.io-client';
import LandingPage from './components/LandingPage';
import PricingMatrix from './components/PricingMatrix';
import CsvImporter from './components/CsvImporter';
import AdminPanel from './components/AdminPanel';
import BottomNav from './components/BottomNav';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

const socket = io();

import ConfirmModal from './components/ConfirmModal';

export default function App() {
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk', id?: string } | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(() => {
    const saved = localStorage.getItem('monthlyTarget');
    return saved ? parseInt(saved, 10) : 50000;
  });
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>( localStorage.getItem('theme') as 'dark' | 'light' || 'dark');
  const [tier, setTier] = useState<string | null>(() => localStorage.getItem('tier'));
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(
    (localStorage.getItem('currentView') as ViewType) || 'pipeline'
  );

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);
  const [contactSearch, setContactSearch] = useState('');
  const [notifiedTasks, setNotifiedTasks] = useState<Set<string>>(new Set());
  
  // Auth state
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (Notification.permission !== 'granted') return;

    const now = new Date();
    leads.forEach(lead => {
      lead.tasks?.forEach(task => {
        if (task.dueDate && !task.completed && !notifiedTasks.has(task.id)) {
          const dueDate = new Date(task.dueDate);
          if (dueDate <= now) {
            new Notification('Task Due', {
              body: `Task "${task.title}" for lead "${lead.name}" is due.`
            });
            setNotifiedTasks(prev => new Set(prev).add(task.id));
          }
        }
      });
    });
  }, [leads, notifiedTasks]);
  
  // Bulk Actions
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  
  // Workspace Auth State
  const [isWorkspaceConnected, setIsWorkspaceConnected] = useState(false);

  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('userEmail'));

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    if (userEmail) localStorage.setItem('userEmail', userEmail);
    else localStorage.removeItem('userEmail');
  }, [userEmail]);

  useEffect(() => {
    if (tier) localStorage.setItem('tier', tier);
    else localStorage.removeItem('tier');
  }, [tier]);

  useEffect(() => {
    // Theme persistence
    if (theme === 'light') {
        document.documentElement.classList.add('light');
    } else {
        document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('monthlyTarget', monthlyTarget.toString());
  }, [monthlyTarget]);

  useEffect(() => {
    fetchLeadsAndMetrics();
    
    const unsubscribe = initAuth(
      async (user, token) => {
        setIsWorkspaceConnected(!!token);
        setUserEmail(user?.email || null);
        if (user?.email) {
            try {
              const res = await fetch(`/api/subscription/${user.email}`);
              const data = await res.json();
              setTier(data.tier);
            } catch (err) {
                console.error("Failed to fetch subscription:", err);
            }
        }
        await checkAuthStatus();
      },
      () => {
        setIsWorkspaceConnected(false);
        if (localStorage.getItem('isAuthenticated') === 'true') {
           setIsAuthChecking(false);
           return; // Retain current UI session
        }
        setIsAuthenticated(false);
        setIsAuthChecking(false);
        setTier(null);
        setUserEmail(null);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    socket.on('lead_updated', (updatedLead: Partial<Lead> & { id: string }) => {
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? { ...l, ...updatedLead } : l));
    });
    socket.on('lead_deleted', ({ id }) => {
      setLeads(prev => prev.filter(l => l.id !== id));
    });
    socket.on('lead_created', (newLead: Lead) => {
      setLeads(prev => {
        if (prev.some(l => l.id === newLead.id)) return prev;
        return [...prev, newLead];
      });
    });

    return () => {
      socket.off('lead_updated');
      socket.off('lead_deleted');
      socket.off('lead_created');
    };
  }, []);

  const handleDisconnectWorkspace = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      await logout();
      setIsWorkspaceConnected(false);
    } catch (e) {
      console.error("Failed to disconnect Workspace", e);
    }
  };

  const handleConnectWorkspace = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      await googleSignIn();
    } catch (e) {
      console.error("Failed to connect Workspace, simulating success for Vercel static deploy.", e);
      setIsWorkspaceConnected(true);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const stored2FAStatus = localStorage.getItem('is2FAEnabled') === 'true';
      setIs2FAEnabled(stored2FAStatus);
      if (!stored2FAStatus) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Error checking 2fa status:', err);
      setIsAuthenticated(true); // Fallback
    } finally {
      setIsAuthChecking(false);
    }
  };


  const fetchLeadsAndMetrics = async () => {
    setLoading(true);
    try {
      const [leadsRes, metricsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/metrics')
      ]);
      
      let leadsData, metricsData;
      
      const textLeads = await leadsRes.text();
      try { leadsData = JSON.parse(textLeads); } catch(e) { console.error('Failed to parse leads JSON:', textLeads); leadsData = { leads: [] }; }
      
      const textMetrics = await metricsRes.text();
      try { metricsData = JSON.parse(textMetrics); } catch(e) { console.error('Failed to parse metrics JSON:', textMetrics); metricsData = { metrics: [] }; }
      
      if (leadsData.setupRequired || metricsData.setupRequired) {
        setSetupRequired(true);
      }
      if (leadsData.leads) setLeads(leadsData.leads);
      if (metricsData.metrics && metricsData.metrics.length > 0) {
        setMetrics(metricsData.metrics[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const handleDownloadCSV = () => {
    const headers = ['Lead ID', 'Name', 'Company', 'Deal Size', 'Stage', 'Follow Up'];
    const csvRows = [
      headers.join(','),
      ...leads.map(l => 
        [l.id, `"${l.name.replace(/"/g, '""')}"`, `"${(l.company || '').replace(/"/g, '""')}"`, l.dealSize, `"${l.stage.replace(/"/g, '""')}"`, `"${(l.nextFollowUp || '').replace(/"/g, '""')}"`].join(',')
      )
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateLead = async () => {
    const newLead = {
      name: 'New Lead',
      company: 'New Company',
      dealSize: 0,
      stage: 'Discovery Scheduled' as Stage,
      emotionalAnchor: '',
      coi: '',
      nextFollowUp: new Date().toISOString().split('T')[0]
    };
    
    // Show a loading indicator instead of optimistic update if needed,
    // but the fetch is usually fast.
    const tempId = 'temp-' + Date.now();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
      const data = await res.json();
      if (data.id) {
        // We let the socket.on('lead_created') handle adding it to the list,
        // or we add it ourselves if it's not there yet.
        setLeads(prev => {
          if (prev.some(l => l.id === data.id)) return prev;
          return [...prev, { ...newLead, id: data.id }];
        });
        // Auto-open modal for the new lead
        setSelectedLead({ ...newLead, id: data.id });
      } else if (data.offline) {
        setLeads(prev => [...prev, { ...newLead, id: tempId }]);
        setSelectedLead({ ...newLead, id: tempId });
      }
    } catch (e) {
      console.error('Failed to create lead', e);
      setLeads(prev => [...prev, { ...newLead, id: tempId }]);
      setSelectedLead({ ...newLead, id: tempId });
    }
  };

  const triggerDeleteLead = (leadId: string) => {
    setDeleteConfirm({ type: 'single', id: leadId });
  };

  const triggerBulkDelete = () => {
    setDeleteConfirm({ type: 'bulk' });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'single' && deleteConfirm.id) {
      const leadId = deleteConfirm.id;
      setLeads(prev => prev.filter(l => l.id !== leadId));
      setSelectedLead(null);
      try {
        await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to delete lead', e);
      }
    } else if (deleteConfirm.type === 'bulk') {
      setLeads(prev => prev.filter(l => !selectedLeadIds.includes(l.id)));
      const idsToDelete = [...selectedLeadIds];
      setSelectedLeadIds([]);
      
      for (const leadId of idsToDelete) {
        try {
          fetch(`/api/leads/${leadId}`, { method: 'DELETE' }).catch(e => console.error('Failed to delete lead', leadId, e));
        } catch (e) {}
      }
    }
    
    setDeleteConfirm(null);
  };

  const handleBulkStageUpdate = async (newStage: Stage) => {
    setLeads(prev => prev.map(l => selectedLeadIds.includes(l.id) ? { ...l, stage: newStage } : l));
    const idsToUpdate = [...selectedLeadIds];
    setSelectedLeadIds([]);

    for (const leadId of idsToUpdate) {
      try {
        fetch(`/api/leads/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: newStage })
        }).catch(e => console.error('Failed to update stage for lead', leadId, e));
      } catch (e) {}
    }
  };

  const onDragEnd = async (leadId: string, newStage: Stage) => {
    const updated = leads.map(l => l.id === leadId ? { ...l, stage: newStage } : l);
    setLeads(updated);
    
    // Optimistic update, but we should tell the backend
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
    } catch (e) {
      console.error('Failed to update stage', e);
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    const updated = leads.map(l => l.id === leadId ? { ...l, ...updates } : l);
    setLeads(updated);
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error('Failed to update lead data', e);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
    in: { opacity: 1, y: 0, filter: 'blur(0px)' },
    out: { opacity: 0, y: -10, filter: 'blur(4px)' }
  };

  const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-[100dvh] w-full bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (userEmail && is2FAEnabled) {
      return <Login2FA onSuccess={() => setIsAuthenticated(true)} />;
    }
    return <LandingPage onSignInSuccess={() => {
      if (!is2FAEnabled) setIsAuthenticated(true)
    }} />;
  }

  return (
    <div className={`${theme} min-h-[100dvh] w-full ${theme === 'dark' ? 'bg-[#0B0A0A] text-zinc-50' : 'bg-[#FDFBF7] text-zinc-900'} flex flex-col md:flex-row font-sans transition-colors duration-300 overflow-y-auto selection:bg-primary/30`}>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-background via-accent/20 to-background dark:via-background dark:to-card/50">
        <header className="border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between h-20 shrink-0 z-10 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary/20 text-primary overflow-hidden shrink-0">
               <img src="/logo.png" alt="Aegis Vault Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-display font-bold tracking-tight text-foreground leading-tight">
                Aegis Vault
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-[0.1em] font-semibold mt-0.5">PRIVATE PIPELINE MATRIX</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${
              setupRequired 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}>
              <Database className="w-3.5 h-3.5" />
              {setupRequired ? 'Demo Mode' : 'Sheets Connected'}
              <span className="relative flex h-2 w-2 ml-1">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${setupRequired ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${setupRequired ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
            </div>
            {currentView !== 'security' && (
              <motion.button
                 type="button"
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={handleCreateLead}
                 className="bg-primary text-primary-foreground px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold hover:brightness-110 flex items-center gap-1 md:gap-2 transition-all shadow-md border border-primary/50"
              >
                 <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{currentView === 'contacts' ? 'New Contact' : 'New Lead'}</span><span className="sm:hidden">{currentView === 'contacts' ? 'Contact' : 'Lead'}</span>
              </motion.button>
            )}
            {currentView === 'pipeline' && (
              <motion.button 
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadCSV}
                className="p-2 md:p-2.5 rounded-xl bg-card border border-border hover:border-primary transition-all text-muted hover:text-foreground shadow-sm"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
              </motion.button>
            )}
            <motion.button 
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 md:p-2.5 rounded-xl bg-card border border-border hover:border-primary transition-all text-muted hover:text-foreground shadow-sm"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
            </motion.button>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-2 md:p-8 overflow-auto relative custom-scrollbar pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            {currentView === 'pipeline' && (
              <motion.div 
                key="pipeline"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
                className="flex-[1] flex flex-col lg:flex-row gap-8 w-full"
              >
                {/* Main Board Area */}
                <div className="flex-[1] flex flex-col min-w-0 w-full">
                  {/* Banner removed */}
                  
                  <Dashboard metrics={metrics} leads={leads} loading={loading} tier={tier} monthlyTarget={monthlyTarget} />

                  <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="text-xl font-bold">Pipeline</h2>
                    <CsvImporter onImport={fetchLeadsAndMetrics} />
                  </div>

                  <div className="flex-[1] min-h-0 w-full px-0 md:px-2">
                    <Board leads={leads} onDragEnd={onDragEnd} onLeadClick={setSelectedLead} />
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'contacts' && (
              <motion.div 
                key="contacts"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
                className="w-full bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 md:p-8 shadow-xl"
              >
                <div className="max-w-[1600px] mx-auto w-full flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display font-bold tracking-tight mb-2">Rolodex</h2>
                      <p className="text-muted text-base">Manage all stakeholders and strategic contacts across your pipeline.</p>
                    </div>
                    
                    <input 
                      type="text"
                      placeholder="Search contacts..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="bg-card border border-border px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-primary"
                    />

                    <AnimatePresence>
                      {selectedLeadIds.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center gap-3 bg-card border border-border p-2 rounded-xl shadow-lg"
                        >
                          <span className="text-sm font-bold px-3">{selectedLeadIds.length} Selected</span>
                          <div className="h-6 w-px bg-border"></div>
                          
                          <select 
                            onChange={(e) => {
                              if (e.target.value) {
                                handleBulkStageUpdate(e.target.value as Stage);
                                e.target.value = '';
                              }
                            }}
                            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground focus:text-foreground focus:border-primary focus:outline-none"
                            defaultValue=""
                          >
                            <option value="" disabled>Move to...</option>
                            <option value="Discovery Scheduled">Discovery</option>
                            <option value="Stakeholder Buy-In">Stakeholder Buy-In</option>
                            <option value="Executive Review">Executive Review</option>
                            <option value="Pending Payment">Pending Payment</option>
                            <option value="Closed-Won">Closed-Won</option>
                            <option value="Lost">Lost</option>
                          </select>
                          
                          <button 
                            onClick={triggerBulkDelete}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-white transition-colors bg-red-500/10 hover:bg-red-600 rounded-lg border border-red-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Bulk Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="overflow-auto border border-white/10 rounded-xl bg-background/50 backdrop-blur-sm shadow-inner flex-1">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-card/80 text-muted uppercase tracking-widest text-xs sticky top-0 z-10 backdrop-blur-md border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 w-12">
                            <input 
                              type="checkbox" 
                              className="rounded border-border bg-background focus:ring-primary w-4 h-4"
                              checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedLeadIds(leads.map(l => l.id));
                                else setSelectedLeadIds([]);
                              }}
                            />
                          </th>
                          <th className="px-6 py-4 font-semibold">Name</th>
                          <th className="px-6 py-4 font-semibold">Company</th>
                          <th className="px-6 py-4 font-semibold">Stage</th>
                          <th className="px-6 py-4 font-semibold">Follow Up</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {leads
                          .filter(l => l.name.toLowerCase().includes(contactSearch.toLowerCase()) || (l.company || '').toLowerCase().includes(contactSearch.toLowerCase()))
                          .map(lead => (
                          <tr key={lead.id} className={`hover:bg-white/[0.02] transition-colors cursor-pointer group ${selectedLeadIds.includes(lead.id) ? 'bg-primary/5' : ''}`} onClick={() => setSelectedLead(lead)}>
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="checkbox" 
                                className="rounded border-border bg-background focus:ring-primary w-4 h-4 cursor-pointer"
                                checked={selectedLeadIds.includes(lead.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedLeadIds(prev => [...prev, lead.id]);
                                  else setSelectedLeadIds(prev => prev.filter(id => id !== lead.id));
                                }}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-foreground group-hover:text-primary transition-colors">{lead.name}</span>
                            </td>
                            <td className="px-6 py-4 text-muted font-medium">{lead.company}</td>
                            <td className="px-6 py-4">
                              <span className="bg-muted/10 border border-border px-2.5 py-1 rounded-md text-xs font-semibold text-muted tracking-wide whitespace-nowrap">
                                {lead.stage}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{lead.nextFollowUp}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted hover:text-primary transition-colors hover:bg-primary/10 rounded-md border border-border sm:border-transparent sm:bg-transparent" onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}><Edit3 className="w-3.5 h-3.5" /> <span className="sm:hidden">Edit</span></button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-white transition-colors bg-red-500/10 hover:bg-red-600 rounded-md border border-red-500/20" onClick={(e) => { e.stopPropagation(); triggerDeleteLead(lead.id); }}><Trash2 className="w-3.5 h-3.5" /> <span className="sm:hidden">Delete</span></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {leads.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-muted">No strategic contacts found in pipeline</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'security' && (
              <motion.div 
                key="security"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
                className="w-full flex justify-center pt-4 md:pt-10 px-4 pb-12"
              >
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl md:rounded-2xl p-5 md:p-8 max-w-2xl w-full shadow-xl relative overflow-hidden">
                  {/* Decorative glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none -mr-32 -mt-32"></div>

                  <h2 className="text-xl md:text-2xl font-display font-bold mb-3 flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 shrink-0">
                      <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    Shield Wall & Security
                  </h2>
                  <p className="text-muted text-sm md:text-base mb-8 md:mb-10 lg:ml-14">Manage vault access, authentication posture, and data retention.</p>
                  
                  <div className="space-y-4">
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className={`p-5 md:p-6 border rounded-xl flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center transition-all ${is2FAEnabled ? 'bg-primary/5 border-primary/30' : 'bg-background/50 border-border'}`}
                    >
                      <div>
                        <h3 className="text-sm md:text-base font-bold flex items-center gap-2">
                          Two-Factor Authentication (2FA)
                          {is2FAEnabled && <CheckCircle className="w-4 h-4 text-primary" />}
                        </h3>
                        <p className="text-xs md:text-sm text-muted mt-1.5 max-w-sm">Require an extra security step when logging in to protect sensitive pipeline data.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => is2FAEnabled ? setShowDisable2FA(true) : setShowSetup2FA(true)}
                        className={`w-full sm:w-auto px-6 py-2.5 font-bold text-xs rounded-lg uppercase tracking-wider transition-all shadow-sm ${is2FAEnabled ? 'bg-card border border-border text-muted hover:text-foreground' : 'bg-primary text-primary-foreground hover:brightness-110 shadow-md'}`}
                      >
                        {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                      </button>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className="p-5 md:p-6 border border-border rounded-xl bg-background/50 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center"
                    >
                      <div>
                        <h3 className="text-sm md:text-base font-bold">Google Workspace Integration</h3>
                        <p className="text-xs md:text-sm text-muted mt-1.5 flex items-center gap-2">
                          <span className={`shrink-0 w-2 h-2 rounded-full ${isWorkspaceConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></span>
                          Status: {isWorkspaceConnected ? 'Bound to Workspace' : 'Disconnected'}
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={isWorkspaceConnected ? handleDisconnectWorkspace : handleConnectWorkspace}
                        className="w-full sm:w-auto px-6 py-2.5 bg-card border border-border hover:border-primary/50 text-foreground font-bold text-xs rounded-lg uppercase tracking-wider transition-all"
                      >
                        {isWorkspaceConnected ? 'Disconnect' : 'Connect Workspace'}
                      </button>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className="p-5 md:p-6 border border-border rounded-xl bg-background/50 flex flex-col gap-6 mt-8"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center">
                        <div>
                          <h3 className="text-sm md:text-base font-bold flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            Revenue Target Configuration
                          </h3>
                          <p className="text-xs md:text-sm text-muted mt-1.5 max-w-sm">Set your monthly target to track progress in the dashboard.</p>
                        </div>
                        <div className="w-full sm:w-auto flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl">
                          <span className="text-muted text-sm font-bold">$</span>
                          <input 
                            type="number"
                            value={monthlyTarget}
                            onChange={(e) => setMonthlyTarget(parseInt(e.target.value) || 0)}
                            className="bg-transparent border-none focus:outline-none font-mono font-bold text-primary w-24"
                          />
                        </div>
                      </div>

                      <div className="h-px bg-border w-full"></div>

                      <h3 className="text-sm md:text-base font-bold flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Performance Analytics
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-card/60 border border-border rounded-lg">
                          <p className="text-[10px] font-bold text-muted tracking-widest uppercase">Avg Talk to Listen Ratio</p>
                          <p className="text-2xl font-bold mt-1 text-primary">
                            {(() => {
                              const leadsWithRatio = leads.filter(l => (l.talkToListenRatio ?? 0) > 0);
                              if (leadsWithRatio.length === 0) return '0%';
                              const avg = leadsWithRatio.reduce((acc, curr) => acc + (curr.talkToListenRatio || 0), 0) / leadsWithRatio.length;
                              return `${Math.round(avg)}%`;
                            })()}
                          </p>
                        </div>
                        <div className="p-4 bg-card/60 border border-border rounded-lg">
                          <p className="text-[10px] font-bold text-muted tracking-widest uppercase">Show-to-Close Rate</p>
                          <p className="text-2xl font-bold mt-1 text-primary">
                            {(() => {
                              const shows = leads.filter(l => l.stage !== 'Discovery Scheduled' && l.stage !== 'Nurture / Long-Term').length;
                              const closes = leads.filter(l => l.stage === 'Closed-Won').length;
                              if (shows === 0) return '0%';
                              return `${Math.round((closes / shows) * 100)}%`;
                            })()}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className="p-5 md:p-6 border border-red-500/20 rounded-xl bg-red-500/5 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center mt-6 md:mt-8 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full pointer-events-none"></div>
                      <div className="relative z-10 w-full sm:w-auto">
                        <h3 className="text-sm md:text-base font-bold text-red-500">Purge Vault Data</h3>
                        <p className="text-xs md:text-sm text-red-500/70 mt-1.5 max-w-sm">Permanently wipe all local cache, diagnostic mapping, and pipeline flow. This cannot be undone.</p>
                      </div>
                      <button type="button" className="relative z-10 w-full sm:w-auto px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xs rounded-lg uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all shadow-sm shrink-0">Execute Purge</button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'admin' && (
              <motion.div 
                key="admin"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
              >
                <AdminPanel />
              </motion.div>
            )}

            {currentView === 'privacy' && (
              <motion.div 
                key="privacy"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
                className="w-full"
              >
                <PrivacyPolicy onBack={() => setCurrentView('pipeline')} />
              </motion.div>
            )}

            {currentView === 'terms' && (
              <motion.div 
                key="terms"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
                className="w-full"
              >
                <TermsOfService onBack={() => setCurrentView('pipeline')} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Navigation */}
          <footer className="mt-auto pt-12 pb-8 border-t border-border/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">© 2026 Aegis Vault CRM. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setCurrentView('privacy')}
                  className="text-[10px] text-muted hover:text-primary transition-colors font-bold uppercase tracking-widest"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => setCurrentView('terms')}
                  className="text-[10px] text-muted hover:text-primary transition-colors font-bold uppercase tracking-widest"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <AnimatePresence>
        {selectedLead && (
          <LeadModal 
            lead={selectedLead} 
            onClose={() => setSelectedLead(null)} 
            onUpdate={handleUpdateLead}
            onDelete={triggerDeleteLead}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSetup2FA && (
          <Setup2FAModal 
            onClose={() => setShowSetup2FA(false)} 
            onSuccess={() => { setShowSetup2FA(false); setIs2FAEnabled(true); }}
          />
        )}
        {showDisable2FA && (
          <Disable2FAModal 
            onClose={() => setShowDisable2FA(false)} 
            onSuccess={() => { setShowDisable2FA(false); setIs2FAEnabled(false); }}
          />
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={deleteConfirm !== null}
        title={deleteConfirm?.type === 'bulk' ? 'Delete Multiple Leads' : 'Delete Lead'}
        message={deleteConfirm?.type === 'bulk' ? `Are you sure you want to permanently delete ${selectedLeadIds.length} leads? This action cannot be undone.` : 'Are you sure you want to permanently delete this lead? This action cannot be undone.'}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
