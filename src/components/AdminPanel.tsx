import { apiFetch } from "../lib/api";
import React, { useState, useEffect } from 'react';
import { User as UserIcon, Trash2, Edit, Save, X, Settings2, Plus, Eye } from 'lucide-react';
import ActivityLogs from './ActivityLogs';
import AdminUserForm from './AdminUserForm';
import ConfirmModal from './ConfirmModal';
import MemberProfile from './MemberProfile';
import DiscountCalculator from './DiscountCalculator';
import { useToast } from './Toast';

export default function AdminPanel() {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewUser, setViewUser] = useState<any | null>(null);
  
  const [deleteEmail, setDeleteEmail] = useState<string | null>(null);
  const [tierPrices, setTierPrices] = useState({ 
    architect: { monthly: 6, quarterly: 16.2, annually: 57.6 }, 
    syndicate: { monthly: 16, quarterly: 43.2, annually: 153.6 } 
  });
  const [savingPrice, setSavingPrice] = useState(false);

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
    if (!deleteEmail) return;
    try {
      await apiFetch(`/api/admin/users/${deleteEmail}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.email !== deleteEmail));
      setDeleteEmail(null);
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
        isOpen={!!deleteEmail}
        title="Delete User"
        message={`Are you sure you want to completely delete ${deleteEmail}? This action is irreversible and all their data will be destroyed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteEmail(null)}
        confirmText="Destroy User"
      />
      {showCreateForm ? (
        <AdminUserForm onBack={() => setShowCreateForm(false)} onSaved={() => { setShowCreateForm(false); fetchUsers(); }} />
      ) : (
      <>
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
                            <button onClick={() => setDeleteEmail(u.email)} className="text-muted-foreground hover:text-red-500 transition-colors" title="Delete User (Terminates Data)"><Trash2 className="w-4 h-4" /></button>
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
      </>
      )}

      {/* System Health / API Status */}
      <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 md:p-8 shadow-xl mt-8">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold tracking-tight">System Health & APIs</h2>
            <button onClick={fetchHealth} className="bg-background border border-border px-4 py-1 rounded font-bold uppercase text-xs hover:bg-card/50 transition">Refresh</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemHealth ? Object.entries(systemHealth).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-4 bg-background/50 border border-border rounded-lg">
                    <span className="capitalize font-bold text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                        (value as string) === 'Connected' || (value as string) === 'development' || (value as string) === 'production'
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : (value as string).includes('No Connection') || (value as string).includes('Error')
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                        {value as string}
                    </span>
                </div>
            )) : (
                <div className="col-span-2 text-center text-muted-foreground py-4">Checking systems...</div>
            )}
         </div>
      </div>

      <div className="mt-8">
        <ActivityLogs />
      </div>
    </div>
  );
}

