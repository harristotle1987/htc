import { apiFetch } from "../lib/api";
import React, { useState, useEffect } from 'react';
import { User, Payment } from '../types';
import { LogOut, User as UserIcon, Mail, Phone, Gem, Edit3, X, Check, Lock, Camera, Eye, EyeOff, Receipt } from 'lucide-react';

interface MemberProfileProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (updates: Partial<User>) => void;
  onUpgradeTier?: () => void;
}

export default function MemberProfile({ user, onLogout, onUpdateUser, onUpgradeTier }: MemberProfileProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || '',
    password: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await apiFetch(`/api/payments/${user.email}`);
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
        }
      } catch (err) {
        console.error('Failed to fetch payments:', err);
      }
    };
    fetchPayments();
  }, [user.email]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiFetch(`/api/users/${user.email}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onUpdateUser({ name: formData.name, phone: formData.phone, avatarUrl: formData.avatarUrl });
        setIsEditModalOpen(false);
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const openModal = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
      password: ''
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Member Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and personal information.</p>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-8 border border-border rounded-3xl bg-card flex flex-col items-center text-center">
            <div className="relative mb-6">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl" />
              ) : (
                <div className="w-32 h-32 bg-primary/10 rounded-full text-primary flex items-center justify-center border-4 border-background shadow-xl">
                  <UserIcon className="w-16 h-16" />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold">{user.name || 'Member'}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{user.email}</p>
            <div className="mt-6 pt-6 border-t border-border/50 w-full">
              <button 
                onClick={openModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Grid Details */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 border border-border rounded-3xl bg-card space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Mail className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Email Address</h3>
              </div>
              <p className="text-lg font-medium">{user.email}</p>
            </div>
            
            <div className="p-6 border border-border rounded-3xl bg-card space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Phone className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Phone Number</h3>
              </div>
              <p className="text-lg font-medium font-mono">{user.phone || 'Not provided'}</p>
            </div>

            <div className="p-6 border border-border rounded-3xl bg-card space-y-2 sm:col-span-2 flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-br from-card to-primary/5 gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Gem className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Subscription Tier</h3>
                </div>
                <p className="text-muted-foreground text-sm">Your current plan</p>
                {user.subscriptionExpiresAt && (
                   <p className={`text-xs mt-2 font-bold ${new Date(user.subscriptionExpiresAt) < new Date() ? 'text-red-500' : 'text-amber-500'}`}>
                     {new Date(user.subscriptionExpiresAt) < new Date() ? 'Expired on: ' : 'Expiring on: '}
                     {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                   </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="px-4 py-2 bg-primary/20 text-primary rounded-full font-bold uppercase tracking-widest text-sm shadow-inner text-center w-full sm:w-auto">
                  {user.subscription}
                </div>
                {user.subscription !== 'syndicate' && onUpgradeTier && (
                  <button 
                    onClick={onUpgradeTier}
                    className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:brightness-110 text-primary-foreground rounded-full text-sm font-bold uppercase tracking-wider transition-all shadow-md shrink-0"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
            
             <div className="p-6 border border-border rounded-3xl bg-card space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Lock className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Security</h3>
              </div>
              <div className="flex justify-between items-center">
                 <p className="text-sm text-muted-foreground">Change your password here.</p>
                 <button onClick={openModal} className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                   Update Password
                 </button>
              </div>
            </div>

            <div className="p-6 border border-border rounded-3xl bg-card space-y-4 sm:col-span-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Receipt className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Payment History</h3>
              </div>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No past transactions found.</p>
              ) : (
                <div className="space-y-3">
                  {payments.map(payment => (
                    <div key={payment.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-background border border-border rounded-xl">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                           <span className="font-bold text-foreground">GHS {Number(payment.amount).toFixed(2)}</span>
                           <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase">{payment.tier}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">Ref: {payment.reference}</p>
                      </div>
                      <div className="text-sm text-muted-foreground text-left sm:text-right">
                        {new Date(payment.date).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-card w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Phone Number</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-wider pl-1">Avatar URL</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Camera className="w-4 h-4" />
                  </div>
                  <input 
                    type="url" 
                    value={formData.avatarUrl}
                    onChange={e => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-wider pl-1">New Password</label>
                <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Leave blank to keep current"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground pl-1 mt-1">
                  Only fill this out if you wish to change your password.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
