import { apiFetch } from "../lib/api";
import React, { useState, useEffect } from 'react';
import { User as UserIcon, Trash2, Edit, Save, X, Settings2, Plus, Eye, Download, Megaphone, Activity, DollarSign, Users, ShieldAlert } from 'lucide-react';
import ActivityLogs from './ActivityLogs';
import AdminUserForm from './AdminUserForm';
import ConfirmModal from './ConfirmModal';
import MemberProfile from './MemberProfile';
import DiscountCalculator from './DiscountCalculator';
import { useToast } from './Toast';

export default function AdminPanel({ isAdmin }: { isAdmin?: boolean }) {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewUser, setViewUser] = useState<any | null>(null);
  
  const [deleteData, setDeleteData] = useState<{ email: string, x: number, y: number } | null>(null);
  const [tierPrices, setTierPrices] = useState({ 
    architect: { monthly: 6, quarterly: 16.2, annually: 57.6 }, 
    syndicate: { monthly: 16, quarterly: 43.2, annually: 153.6 } 
  });
  const [savingPrice, setSavingPrice] = useState(false);

  const [globalSettings, setGlobalSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    requireVerification: false
  });
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  
  const fetchSettings = () => {
    apiFetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setGlobalSettings(data.settings);
      })
      .catch(err => console.error(err));
  };

  const handleExportCSV = async (type: string) => {
    toast(`Exporting ${type} to CSV...`);
    try {
       if (type === 'Users') {
          const res = await apiFetch('/api/admin/users');
          const data = await res.json();
          const csvContent = "data:text/csv;charset=utf-8," + 
             "ID,Name,Email,Phone,Subscription,Signup Date\n" +
             (data.users || []).map((u: any) => `${u.id},${u.name},${u.email},${u.phone || ''},${u.subscription},${u.signupDate}`).join("\n");
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "users_export.csv");
          document.body.appendChild(link);
          link.click();
       } else if (type === 'Leads Database') {
          const res = await apiFetch('/api/leads');
          const data = await res.json();
          const csvContent = "data:text/csv;charset=utf-8," + 
             "ID,Name,Company,Stage,Deal Size\n" +
             (data.leads || []).map((l: any) => `${l.id},${l.name},${l.company},${l.stage},${l.dealSize}`).join("\n");
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "leads_export.csv");
          document.body.appendChild(link);
          link.click();
       }
       toast(`${type} export complete.`);
    } catch(err) {
       toast(`Failed to export ${type}`);
    }
  };

  const saveSettings = async (newSettings: any) => {
    setGlobalSettings(newSettings);
    try {
       const res = await apiFetch('/api/admin/settings', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ settings: newSettings })
       });
       if (!res.ok) throw new Error('Failed');
       toast('Settings updated');
    } catch(err) {
       toast('Failed to update settings');
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    try {
        const res = await apiFetch('/api/admin/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: broadcastMessage })
        });
        if (!res.ok) throw new Error('Failed');
        toast('System broadcast dispatched successfully.');
        setBroadcastMessage('');
        fetchAnnouncements();
    } catch(err) {
        toast('Failed to dispatch broadcast');
    }
  };

  const fetchAnnouncements = () => {
    apiFetch('/api/admin/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data.announcements || []))
      .catch(console.error);
  };

  const deleteAnnouncement = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await apiFetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast('Announcement deleted');
      fetchAnnouncements();
    } catch (err) {
      toast('Failed to delete announcement');
    }
  };

  const updateAnnouncement = async (id: number) => {
    if (!editingAnnouncement || !editingAnnouncement.message.trim()) return;
    try {
      const res = await apiFetch(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: editingAnnouncement.message })
      });
      if (!res.ok) throw new Error('Failed');
      toast('Announcement updated');
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch(err) {
      toast('Failed to update announcement');
    }
  };

  const fetchUsers = () => {
    setLoading(true);
    apiFetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };
  
  const fetchPrices = () => {
    apiFetch('/api/prices')
      .then(res => res.json())
      .then(data => {
         if (data) setTierPrices({ 
            architect: data.architect || { monthly: 6, quarterly: 16.2, annually: 57.6 }, 
            syndicate: data.syndicate || { monthly: 16, quarterly: 43.2, annually: 153.6 } 
         });
      })
      .catch(err => console.error(err));
  }

  const [systemHealth, setSystemHealth] = useState<any>(null);

  const fetchHealth = () => {
    setSystemHealth(null);
    apiFetch('/api/admin/system/health')
      .then(res => res.json())
      .then(data => setSystemHealth(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
    fetchPrices();
    fetchHealth();
    fetchSettings();
    fetchAnnouncements();
  }, []);

  const [newTierName, setNewTierName] = useState('');
  
  const addTier = () => {
    if (!newTierName || tierPrices[newTierName as keyof typeof tierPrices]) return;
    setTierPrices({ ...tierPrices, [newTierName]: { monthly: 0, quarterly: 0, annually: 0 } });
    setNewTierName('');
  };

  const saveTierPrice = async (tier: string, price: any) => {
    setSavingPrice(true);
    try {
      await apiFetch('/api/admin/prices', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ [tier]: price })
      });
      toast('Price updated successfully');
    } catch(e) {
      toast('Failed to update price');
    }
    setSavingPrice(false);
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    try {
      await apiFetch(`/api/admin/users/${deleteData.email}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.email !== deleteData.email));
      setDeleteData(null);
      toast('User deleted successfully');
    } catch (err) {
      console.error(err);
      toast('Failed to delete user');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUserId(user.id);
    setEditForm({ ...user });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    try {
      await apiFetch(`/api/users/${editForm.email}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      setUsers(users.map(u => (u.id === editingUserId ? { ...u, ...editForm } : u)));
      setEditingUserId(null);
      setEditForm({});
      toast('Update saved successfully');
    } catch (err) {
      console.error(err);
      toast('Failed to save update');
    }
  };

  if (loading) return <div className="p-8">Loading users...</div>;

  if (viewUser) {
    return (
      <div className="w-full p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 relative">
        <button 
          onClick={() => setViewUser(null)}
          className="absolute top-4 left-4 z-10 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          &larr; Back to Admin
        </button>
        <MemberProfile 
          user={viewUser} 
          onLogout={() => setViewUser(null)} 
          onUpdateUser={(updates) => {
            const updated = { ...viewUser, ...updates };
            setViewUser(updated);
            setUsers(users.map(u => u.id === viewUser.id ? updated : u));
          }} 
        />
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-8 relative">
      <ConfirmModal 
        isOpen={!!deleteData}
        title="Delete User"
        message={`Are you sure you want to completely delete ${deleteData?.email}? This action is irreversible and all their data will be destroyed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteData(null)}
        confirmText="Destroy User"
        x={deleteData?.x}
        y={deleteData?.y}
      />
      {showCreateForm ? (
        <AdminUserForm onBack={() => setShowCreateForm(false)} onSaved={() => { setShowCreateForm(false); fetchUsers(); }} />
      ) : (
      <>
        {/* Analytics Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card/60 backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Active Users</h3>
                   <div className="text-4xl font-display font-bold">{users.filter((u: any) => u.subscription !== 'cancelled').length}</div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Users className="w-6 h-6" />
                </div>
            </div>
            
            <div className="bg-card/60 backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Monthly MRR</h3>
                   <div className="text-4xl font-display font-bold text-emerald-500">
                     ${users.reduce((acc: number, user: any) => acc + (user.subscription === 'syndicate' ? tierPrices.syndicate.monthly : user.subscription === 'architect' ? tierPrices.architect.monthly : 0), 0).toFixed(0)}
                   </div>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                    <DollarSign className="w-6 h-6" />
                </div>
            </div>
            
            <div className="bg-card/60 backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">System Status</h3>
                   <div className="text-2xl font-display font-bold text-emerald-500 flex items-center gap-2 mt-2">
                      <span className="relative flex h-3 w-3">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      Optimal
                   </div>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                    <Activity className="w-6 h-6" />
                </div>
            </div>
        </div>

        <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-display font-bold tracking-tight">User Management</h2>
            <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest hover:brightness-110 transition">
                <Plus className="w-4 h-4" /> Create User
            </button>
        </div>
        <div className="overflow-auto border border-white/10 rounded-xl bg-background/50 backdrop-blur-sm shadow-inner">
          <table className="w-full text-left text-sm">
            <thead className="bg-card/80 text-muted uppercase tracking-widest text-xs sticky top-0 z-10 backdrop-blur-md border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Tier Level (Sub)</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users && users.length > 0 ? users.map((u, i) => {
                const isEditing = editingUserId === u.id;
                return (
                <tr key={i} className="group hover:bg-card/30 transition-colors">
                  <td className="px-6 py-4 cursor-pointer" onClick={() => !isEditing && setViewUser(u)}>
                     {isEditing ? (
                         <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                             <input type="text" className="bg-background border border-border rounded px-2 py-1" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Full Name" />
                             <input type="text" className="bg-background border border-border rounded px-2 py-1" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Phone" />
                         </div>
                     ) : (
                         <div className="flex items-center gap-3">
                             {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-border" />
                                ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                             )}
                             <div>
                                 <div className="font-bold capitalize group-hover:text-primary transition-colors">{u.name}</div>
                                 <div className="text-xs text-muted-foreground">{u.phone || 'No phone'}</div>
                             </div>
                         </div>
                     )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                      {isEditing ? (
                          <select className="bg-background border border-border rounded px-2 py-1 capitalize" value={editForm.subscription || 'free'} onChange={e => setEditForm({...editForm, subscription: e.target.value})}>
                              <option value="free">Free</option>
                              <option value="architect">Architect</option>
                              <option value="syndicate">Syndicate</option>
                              <option value="cancelled">Cancelled (Violator)</option>
                          </select>
                      ) : (
                          <span className={`px-2 py-1 rounded text-xs font-mono uppercase tracking-widest ${
                              u.subscription === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                              u.subscription === 'syndicate' ? 'bg-amber-500/10 text-amber-500' :
                              u.subscription === 'architect' ? 'bg-primary/10 text-primary' : 'bg-zinc-500/10 text-zinc-400'
                          }`}>
                              {u.subscription || 'free'}
                          </span>
                      )}
                  </td>
                  <td className="px-6 py-4 text-right">
                      {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={saveEdit} className="p-2 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 rounded"><Save className="w-4 h-4" /></button>
                             <button onClick={cancelEdit} className="p-2 bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30 rounded"><X className="w-4 h-4" /></button>
                          </div>
                      ) : (
                        <div className="flex items-center justify-end gap-3 transition-opacity">
                            <button onClick={() => setViewUser(u)} className="text-muted-foreground hover:text-primary transition-colors" title="View Profile"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => handleEdit(u)} className="text-muted-foreground hover:text-primary transition-colors" title="Edit User"><Edit className="w-4 h-4" /></button>
                            <button onClick={(e) => setDeleteData({ email: u.email, x: e.clientX, y: e.clientY })} className="text-muted-foreground hover:text-red-500 transition-colors" title="Delete User (Terminates Data)"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                  </td>
                </tr>
              )}) : (
                <tr>
                   <td colSpan={4} className="px-6 py-12 text-center text-muted font-bold text-lg">0 Active Users Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* System Connections Dashboard */}
      {isAdmin && systemHealth && (
        <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 md:p-8 shadow-xl mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold tracking-tight">System Connections</h2>
            <button onClick={fetchHealth} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              Refresh Status
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             <div className="bg-background/50 border border-border p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none"></div>
                <h4 className="text-xs uppercase text-muted-foreground font-bold tracking-wider relative z-10">Google Sheets API</h4>
                <div className="flex items-center gap-2 relative z-10">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="font-semibold text-lg">Connected</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 relative z-10">Running natively on Neon DB</p>
             </div>
             
             <div className="bg-background/50 border border-border p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none"></div>
                <h4 className="text-xs uppercase text-muted-foreground font-bold tracking-wider relative z-10">Cal.com API</h4>
                <div className="flex items-center gap-2 relative z-10">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="font-semibold text-lg">Configured</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 relative z-10">Client scheduling</p>
             </div>
             
             <div className="bg-background/50 border border-border p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 ${systemHealth.monnifyGateway === 'Connected' ? 'bg-emerald-500/10' : 'bg-amber-500/10'} blur-[40px] rounded-full pointer-events-none`}></div>
                <h4 className="text-xs uppercase text-muted-foreground font-bold tracking-wider relative z-10">Monnify Gateway</h4>
                <div className="flex items-center gap-2 relative z-10">
                   <div className={`w-2 h-2 rounded-full ${systemHealth.monnifyGateway === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                   <span className="font-semibold text-lg">{systemHealth.monnifyGateway}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 relative z-10">Payment processing connection</p>
             </div>
          </div>
        </div>
      )}

{/* Tier Pricing Configuration */}
      <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 md:p-8 shadow-xl mt-8">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-display font-bold tracking-tight">Tier Pricing Configuration</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <input type="text" value={newTierName} onChange={e => setNewTierName(e.target.value)} placeholder="New Tier Name" className="bg-background border border-border px-3 py-1 rounded flex-1 sm:flex-none" />
                <button onClick={addTier} className="bg-primary text-primary-foreground px-4 py-1 rounded font-bold uppercase text-xs hover:brightness-110 shrink-0">Add Tier</button>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(tierPrices).filter(([_, price]) => !!price).map(([tierName, price]: [string, any]) => (
                <div key={tierName} className="bg-background/50 border border-border p-6 rounded-xl flex flex-col gap-4">
                   <h3 className="text-lg font-bold text-primary uppercase tracking-widest mb-2 capitalize">{tierName} Tier ($)</h3>
                   {['monthly', 'quarterly', 'annually'].map(cycle => (
                     <div key={cycle}>
                        <label className="text-xs uppercase text-muted-foreground mr-2 font-bold capitalize">{cycle}</label>
                        <input type="number" 
                               value={price ? price[cycle] : 0} 
                               onChange={e => {
                                    if (!price) return;
                                    const val = Number(e.target.value);
                                    setTierPrices(prev => ({
                                        ...prev,
                                        [tierName]: {
                                            ...(prev[tierName as keyof typeof prev] as any),
                                            [cycle]: val,
                                            ...(cycle === 'monthly' ? {
                                                quarterly: Number((val * 0.9 * 3).toFixed(2)),
                                                annually: Number((val * 0.8 * 12).toFixed(2))
                                            } : {})
                                        }
                                    }));
                               }} className="bg-background border border-border px-3 py-1 rounded w-full mt-1" />
                        <DiscountCalculator 
                            originalPrice={price ? price[cycle] : 0} 
                            onPriceCalculated={(newP) => price && setTierPrices({...tierPrices, [tierName]: {...price, [cycle]: newP}})}
                        />
                     </div>
                   ))}
                   <button onClick={() => saveTierPrice(tierName, price)} className="bg-primary text-primary-foreground px-4 py-3 rounded font-bold uppercase text-xs w-full mt-2 hover:brightness-110" disabled={savingPrice}>Save {tierName} Prices</button>
                </div>
            ))}
         </div>
      </div>
      {/* System Admin Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
         {/* Global Platform Settings */}
         <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <Settings2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-display font-bold tracking-tight">Global Platform Settings</h2>
             </div>
             
             <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-xl">
                    <div>
                        <div className="font-bold">Maintenance Mode</div>
                        <div className="text-sm text-muted-foreground">Disable general access for updates</div>
                    </div>
                    <button onClick={() => saveSettings({...globalSettings, maintenanceMode: !globalSettings.maintenanceMode})} className={`w-12 h-6 rounded-full relative transition-colors ${globalSettings.maintenanceMode ? 'bg-amber-500' : 'bg-border'}`}>
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${globalSettings.maintenanceMode ? 'left-7' : 'left-1'}`}></span>
                    </button>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-xl">
                    <div>
                        <div className="font-bold">Open Registration</div>
                        <div className="text-sm text-muted-foreground">Allow new signups on the landing page</div>
                    </div>
                    <button onClick={() => saveSettings({...globalSettings, registrationOpen: !globalSettings.registrationOpen})} className={`w-12 h-6 rounded-full relative transition-colors ${globalSettings.registrationOpen ? 'bg-emerald-500' : 'bg-border'}`}>
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${globalSettings.registrationOpen ? 'left-7' : 'left-1'}`}></span>
                    </button>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-xl">
                    <div>
                        <div className="font-bold">Require Email Verification</div>
                        <div className="text-sm text-muted-foreground">Force users to verify before access</div>
                    </div>
                    <button onClick={() => saveSettings({...globalSettings, requireVerification: !globalSettings.requireVerification})} className={`w-12 h-6 rounded-full relative transition-colors ${globalSettings.requireVerification ? 'bg-primary' : 'bg-border'}`}>
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${globalSettings.requireVerification ? 'left-7' : 'left-1'}`}></span>
                    </button>
                 </div>
             </div>
         </div>
         
         <div className="flex flex-col gap-8">
             {/* Data Extraction */}
             <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-center">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <Download className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-display font-bold tracking-tight">Data Extraction</h2>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => handleExportCSV('Users')} className="bg-background border border-border p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-card/50 hover:border-primary/50 transition">
                         <Users className="w-8 h-8 text-muted-foreground" />
                         <span className="font-bold text-sm">Export Users</span>
                     </button>
                     <button onClick={() => handleExportCSV('Leads Database')} className="bg-background border border-border p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-card/50 hover:border-primary/50 transition">
                         <ShieldAlert className="w-8 h-8 text-muted-foreground" />
                         <span className="font-bold text-sm">Export Leads</span>
                     </button>
                 </div>
             </div>
             
             {/* System Announcer */}
             <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-xl flex flex-col h-full">
                 <div className="flex items-center gap-3 mb-4 shrink-0">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-display font-bold tracking-tight">System Announcer</h2>
                 </div>
                 
                 <div className="flex flex-col gap-4 overflow-y-auto mb-4 max-h-[300px] pr-2">
                    {announcements.map((ann) => (
                       <div key={ann.id} className="bg-background border border-border rounded-xl p-4 shadow-sm relative group transition-all hover:border-amber-500/50">
                          {editingAnnouncement && editingAnnouncement.id === ann.id ? (
                            <div className="flex flex-col gap-2 relative z-10 text-foreground">
                               <textarea
                                  value={editingAnnouncement.message}
                                  onChange={(e) => setEditingAnnouncement({...editingAnnouncement, message: e.target.value})}
                                  className="w-full bg-card border border-amber-500/50 rounded-lg p-2 h-20 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none text-foreground"
                               />
                               <div className="flex gap-2 self-end">
                                  <button 
                                     onClick={() => setEditingAnnouncement(null)} 
                                     className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md bg-muted/50 hover:bg-muted transition"
                                  >
                                     <X className="w-3 h-3" /> Cancel
                                  </button>
                                  <button 
                                     onClick={() => updateAnnouncement(ann.id)}
                                     className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-500 px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 transition"
                                  >
                                     <Save className="w-3 h-3" /> Save
                                  </button>
                               </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-sm font-medium mb-1 text-foreground leading-snug break-words pr-8">
                                 {ann.message}
                              </div>
                              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                 {new Date(ann.created_at).toLocaleString()}
                              </div>
                              
                              <div className="absolute top-2 right-2 flex flex-col sm:flex-row items-center bg-card/80 backdrop-blur-sm border border-border rounded-lg shadow-sm overflow-hidden opacity-100 transition-opacity">
                                 <button onClick={() => setEditingAnnouncement(ann)} className="p-1.5 sm:p-2 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition">
                                    <Edit className="w-3.5 h-3.5" />
                                 </button>
                                 <button onClick={() => deleteAnnouncement(ann.id)} className="p-1.5 sm:p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition border-t sm:border-t-0 sm:border-l border-border">
                                    <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                              </div>
                            </>
                          )}
                       </div>
                    ))}
                    {announcements.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground py-6 italic opacity-70">
                        No active announcements.
                      </div>
                    )}
                 </div>

                 <div className="mt-auto shrink-0 border-t border-border pt-4">
                     <textarea 
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Enter a new broadcast to display to all users..."
                        className="w-full bg-background border border-border rounded-xl p-3 h-20 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none shadow-inner"
                     />
                     <button onClick={sendBroadcast} className="w-full mt-3 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-bold uppercase tracking-widest text-[11px] py-2.5 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm" disabled={!broadcastMessage.trim()}>
                        Dispatch Global Alert
                     </button>
                 </div>
             </div>
         </div>
      </div>
      
      </>
      )}

      <div className="mt-8">
        <ActivityLogs />
      </div>
    </div>
  );
}

