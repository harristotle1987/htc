import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Shield, X, Scan, Key } from 'lucide-react';

interface Setup2FAProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function Setup2FAModal({ onClose, onSuccess }: Setup2FAProps) {
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');

  useEffect(() => {
    const generateToken = async () => {
      // Mock for static app: Provide a dummy QR code
      setQrCode('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2UzZThlOCIvPjx0ZXh0IHg9Ijc1IiB5PSI3NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zNmVtIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=');
      setSecret('YOUR_MOCK_SECRET_KEY');
    };
    generateToken();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      // Simulate validation (accept any token of 6 digits for the static demo)
      if (token.length >= 6) {
        localStorage.setItem('is2FAEnabled', 'true');
        onSuccess();
      } else {
        setError('Invalid 2FA token');
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
          <h2 className="font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Enable 2FA
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app (like Google Authenticator or Authy) to add Aegis Vault to your device.</p>
              
              <div className="flex justify-center p-4 bg-white rounded-xl">
                {qrCode ? (
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 bg-muted animate-pulse rounded flex items-center justify-center">
                    <Scan className="w-8 h-8 text-muted-foreground opacity-50" />
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-4">
                <Key className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Manual Setup Key</p>
                  <p className="font-mono text-sm break-all font-bold opacity-80">{secret || 'Generating...'}</p>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!qrCode}
                className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg uppercase tracking-wider text-sm transition-all shadow-md hover:brightness-110 disabled:opacity-50"
              >
                Next: Verify Code
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-muted-foreground mb-4">Enter the 6-digit code from your authenticator app to verify the setup.</p>
              
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
                  className="w-full bg-background border border-border rounded-lg px-4 py-4 text-2xl tracking-[0.5em] text-center font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                  disabled={loading}
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm mt-2 font-medium bg-red-500/10 border border-red-500/20 p-2 rounded">{error}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 border border-border bg-card hover:bg-muted font-bold py-3 px-4 rounded-lg uppercase tracking-wider text-sm transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || token.length < 6}
                  className="flex-[2] bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg uppercase tracking-wider text-sm transition-all shadow-md hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
