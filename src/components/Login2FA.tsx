import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

interface Login2FAProps {
  onSuccess: () => void;
}

export default function Login2FA({ onSuccess }: Login2FAProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (data.success) {
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border shadow-xl p-8 rounded-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold font-display text-center mb-2">Vault Access Required</h2>
        <p className="text-muted-foreground text-center mb-8 text-sm">To access the executive pipeline, enter the 6-digit TOTP code from your authenticator app.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Authentication Code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full bg-background border border-border rounded-lg px-4 py-4 text-2xl tracking-[0.5em] text-center font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
              disabled={loading}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2 font-medium bg-red-500/10 border border-red-500/20 p-2 rounded">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || token.length < 6}
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 px-4 rounded-lg uppercase tracking-wider text-sm transition-all shadow-md hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Unlock Vault'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
