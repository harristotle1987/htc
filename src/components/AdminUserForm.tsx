import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useToast } from './Toast';

interface AdminUserFormProps {
  onBack: () => void;
  onSaved: () => void;
}

export default function AdminUserForm({ onBack, onSaved }: AdminUserFormProps) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    subscription: 'free'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast('User created successfully');
        onSaved();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to create user');
        toast('Failed to create user');
      }
    } catch (err: any) {
      console.error(err);
      setError('An expected error occurred');
      toast('Failed to create user');
    }
    setLoading(false);
  };

  return (
    <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 md:p-8 shadow-xl max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors font-mono uppercase tracking-widest text-xs">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>
      <h2 className="text-2xl font-display font-bold tracking-tight mb-6">Create New User</h2>
      
      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground uppercase tracking-wider font-mono text-[10px]">Full Name</label>
          <input required type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground uppercase tracking-wider font-mono text-[10px]">Email Address</label>
          <input required type="email" className="w-full bg-background border border-border rounded-lg px-4 py-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground uppercase tracking-wider font-mono text-[10px]">Phone / WhatsApp</label>
          <input type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground uppercase tracking-wider font-mono text-[10px]">Temporary Password</label>
          <input required type="password" minLength={6} className="w-full bg-background border border-border rounded-lg px-4 py-2" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground uppercase tracking-wider font-mono text-[10px]">Subscription Tier</label>
          <select className="w-full bg-background border border-border rounded-lg px-4 py-2" value={formData.subscription} onChange={e => setFormData({...formData, subscription: e.target.value})}>
            <option value="free">Free</option>
            <option value="architect">Architect</option>
            <option value="syndicate">Syndicate</option>
          </select>
        </div>
        
        <div className="pt-4">
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-bold uppercase tracking-widest hover:brightness-110 transition disabled:opacity-50">
             <Save className="w-4 h-4" /> {loading ? 'Creating...' : 'Save User Access'}
          </button>
        </div>
      </form>
    </div>
  );
}
