import { apiFetch } from "../lib/api";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'signup';
  onSignInSuccess: (email: string) => void;
  onTypeChange?: (type: 'login' | 'signup') => void;
}

export default function AuthModal({ isOpen, onClose, type, onSignInSuccess, onTypeChange }: AuthModalProps) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (type === 'signup') {
      try {
        const res = await apiFetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        let data;
        const text = await res.text();
        try {
           data = text ? JSON.parse(text) : {};
        } catch {
           setError(`Server Error (${res.status}): ${text.slice(0, 40)}`);
           return;
        }
        
        if (res.ok) {
          onSignInSuccess(formData.email);
          onClose();
        } else {
          if (data.error === 'auth/email-already-in-use') {
            const loginRes = await apiFetch('/api/login', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            let loginData;
            const loginText = await loginRes.text();
            try {
              loginData = loginText ? JSON.parse(loginText) : {};
            } catch {
              setError(`Server Error on fallback log in (${loginRes.status})`);
              return;
            }

            if (loginRes.ok) {
               onSignInSuccess(formData.email);
               onClose();
            } else {
               setError('Account exists, but password was incorrect.');
            }
          } else {
            setError(data.error || 'An error occurred during sign up.');
          }
        }
      } catch (e) {
        setError(`Network error connecting to API: ${(e as Error).message}`);
      }
    } else {
      try {
        const res = await apiFetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        let data;
        const text = await res.text();
        try {
           data = text ? JSON.parse(text) : {};
        } catch {
           setError(`Server Error (${res.status}): ${text.slice(0, 40)}`);
           return;
        }
        
        if (res.ok) {
          onSignInSuccess(formData.email);
          onClose();
        } else {
          setError(data.error || 'Invalid credentials.');
        }
      } catch (e) {
        setError(`Network error connecting to API: ${(e as Error).message}`);
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
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
              <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X /></button>
              
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6 capitalize">{type === 'login' ? 'Authenticate' : 'Initialize Vault'}</h2>
              
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
                
                <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold border border-primary hover:brightness-110 transition-colors">
                  {type === 'login' ? 'Authenticate' : 'Initialize Vault'}
                </button>
              </form>
              
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {type === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button type="button" onClick={() => onTypeChange?.('signup')} className="text-primary font-bold hover:underline">
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button type="button" onClick={() => onTypeChange?.('login')} className="text-primary font-bold hover:underline">
                      Log In
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
