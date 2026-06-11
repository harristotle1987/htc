import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, X } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface Disable2FAProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function Disable2FAModal({ onClose, onSuccess }: Disable2FAProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
       const response = await apiFetch('/api/auth/2fa/disable', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ token })
       });
       const data = await response.json();
       
       if (response.ok && data.success) {
          localStorage.removeItem('is2FAEnabled');
          onSuccess();
       } else {
          setError(data.error || 'Invalid 2FA token');
       }
    } catch (err) {
      setError('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-border flex justify-between items-center bg-card">
          <h2 className="font-bold flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-5 h-5" />
            Disable 2FA
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-muted-foreground mb-4">Enter the 6-digit code from your authenticator app to confirm disabling Two-Factor Authentication. This lowers your vault security.</p>
            
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-background border border-border rounded-lg px-4 py-4 text-2xl tracking-[0.5em] text-center font-mono focus:outline-none focus:border-destructive focus:ring-1 focus:ring-destructive transition-colors disabled:opacity-50"
                disabled={loading}
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mt-2 font-medium bg-red-500/10 border border-red-500/20 p-2 rounded">{error}</p>}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 border border-border bg-card hover:bg-muted font-bold py-3 px-4 rounded-lg uppercase tracking-wider text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || token.length < 6}
                className="flex-[2] bg-destructive text-destructive-foreground font-bold py-3 px-4 rounded-lg uppercase tracking-wider text-sm transition-all shadow-md hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Disabling...' : 'Confirm Disable'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
