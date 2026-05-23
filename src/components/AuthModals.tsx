import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { googleSignIn, emailSignUp, emailSignIn } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'signup';
  onSignInSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, type, onSignInSuccess }: AuthModalProps) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (type === 'signup') {
      // 1. Firebase signup
      try {
          await emailSignUp(formData.email, formData.password);
      } catch (e: any) {
          if (e.code === 'auth/email-already-in-use') {
              try {
                  await emailSignIn(formData.email, formData.password);
                  onSignInSuccess();
                  onClose();
                  return; 
              } catch (signInErr) {
                  setError('Account exists, but password was incorrect.');
                  return;
              }
          } else {
              setError('An error occurred during sign up.');
          }
          console.error(e);
          return;
      }
      // 2. Send to API
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSignInSuccess();
        onClose();
      } else {
        setError('Failed to complete setup.');
      }
    } else {
        // Standard Firebase auth via login
        try {
            await emailSignIn(formData.email, formData.password);
            onSignInSuccess();
            onClose();
        } catch (e) {
            setError('Invalid credentials.');
            console.error(e);
        }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-[#121111] border border-amber-900/30 rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
              <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-100"><X /></button>
              
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100 mb-6 capitalize">{type === 'login' ? 'Access Vault' : 'Claim Workspace'}</h2>
              
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {type === 'signup' && (
                  <>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-primary" />
                      <input type="text" placeholder="Full Name" className="w-full bg-input border border-border rounded-lg py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted" onChange={e => setFormData({...formData, name: e.target.value})} required/>
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-primary" />
                      <input type="tel" placeholder="WhatsApp / Phone" className="w-full bg-input border border-border rounded-lg py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted" onChange={e => setFormData({...formData, phone: e.target.value})} required/>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-primary" />
                      <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="w-full bg-input border border-border rounded-lg py-2.5 pl-10 pr-10 text-foreground placeholder:text-muted" onChange={e => setFormData({...formData, password: e.target.value})} required/>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted hover:text-foreground">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-primary" />
                  <input type="email" placeholder="Professional Email" className="w-full bg-input border border-border rounded-lg py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted" onChange={e => setFormData({...formData, email: e.target.value})} required/>
                </div>
                {type === 'login' && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-primary" />
                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="w-full bg-input border border-border rounded-lg py-2.5 pl-10 pr-10 text-foreground placeholder:text-muted" onChange={e => setFormData({...formData, password: e.target.value})} required/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted hover:text-foreground">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}
                
                <button type="submit" className="w-full bg-amber-950 text-amber-200 py-3 rounded-lg font-bold border border-amber-800 hover:bg-amber-900 transition-colors">
                  {type === 'login' ? 'Access' : 'Claim'} Workspace
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
