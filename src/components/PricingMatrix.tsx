import { apiFetch } from "../lib/api";
import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, ArrowLeft } from 'lucide-react';

// Declare standard browser interface for Monnify inline
declare global {
  interface Window {
    MonnifySDK: {
      initialize: (config: any) => void;
    }
  }
}

export default function PricingMatrix({ userEmail, pendingTier, isExpired, onComplete, onBack }: { userEmail: string | null; pendingTier?: string | null; isExpired?: boolean; onComplete: (tier: string, billingCycle?: 'monthly' | 'quarterly' | 'annually') => void; onBack?: () => void }) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [prices, setPrices] = useState({ 
    architect: { monthly: 6, quarterly: 16.2, annually: 57.6 }, 
    syndicate: { monthly: 16, quarterly: 43.2, annually: 153.6 } 
  });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  useEffect(() => {
    const fetchPrices = () => {
      apiFetch('/api/prices')
        .then(res => res.json())
        .then(data => {
          if (data) setPrices(data);
        })
        .catch(console.error);
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFree = async () => {
    if (!userEmail) return;
    setLoadingTier('initiate');
    setPaymentError(null);
    try {
      await apiFetch(`/api/users/${userEmail}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: 'free' })
      });
      onComplete('free');
    } catch (e) {
      console.error(e);
      setLoadingTier(null);
    }
  };

  const loadMonnifyScript = (apiKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.MonnifySDK) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      const isTest = apiKey.startsWith('MK_TEST');
      script.src = isTest ? 'https://sandbox.sdk.monnify.com/plugin/monnify.js' : 'https://sdk.monnify.com/plugin/monnify.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Monnify JS'));
      document.body.appendChild(script);
      
      // Fallback timeout in case onload/onerror fail to fire
      setTimeout(() => reject(new Error('Monnify load timeout')), 10000);
    });
  };

  const handlePaid = async (tier: 'architect' | 'syndicate', priceInput: number) => {
    if (!userEmail) return;

    setLoadingTier(tier);
    setPaymentError(null);

    try {
      // First fetch the backend config to ensure we have the right keys
      const configRes = await apiFetch('/api/config/monnify');
      const monnifyKeys = await configRes.json();
      
      const configuredApiKey = monnifyKeys.apiKey || 'MK_TEST_5BQALXXL2N';
      await loadMonnifyScript(configuredApiKey);
      if (!window.MonnifySDK) throw new Error("Monnify not initialized");

      const monnifyConfig = {
        apiKey: configuredApiKey,
        contractCode: monnifyKeys.contractCode || '6732385923',
        isTestMode: configuredApiKey.startsWith('MK_TEST'),
        currency: "NGN",
        amount: Math.round(priceInput * 1000), // Adjusting amount
        reference: 'aegis_' + Date.now().toString(),
        customerFullName: 'Aegis Client',
        customerEmail: userEmail,
        paymentDescription: 'Aegis Vault Subscription',
        paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
        onLoadStart: () => console.log('Monnify loading started'),
        onLoadComplete: () => {
             console.log('Monnify loading completed');
        },
        onComplete: (response: any) => {
          if (response.status === 'SUCCESS') {
            apiFetch(`/api/users/${encodeURIComponent(userEmail as string)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: tier, monnify_reference: response.transactionReference, amount: priceInput, billing_cycle: billingCycle })
            })
            .then(async (res) => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Server returned ${res.status}: ${errorText}`);
                }
                return res.json();
            })
            .then(() => onComplete(tier, billingCycle))
            .catch((e) => {
                console.error(e);
                setLoadingTier(null);
                setPaymentError(`Payment was successful, but server update failed: ${e.message}`);
            });
          } else {
             setPaymentError(`Payment status: ${response.status}`);
             setLoadingTier(null);
          }
        },
        onClose: (data: any) => {
          console.log('Payment closed', data);
          setLoadingTier(null);
        }
      };

      window.MonnifySDK.initialize(monnifyConfig);
    } catch (err) {
      console.error("Payment initialization error:", err);
      setPaymentError("Failed to initialize payment gateway. Please try again.");
      setLoadingTier(null);
      return;
    }
  };

  const hasAutoTriggered = React.useRef(false);

  // Auto-trigger payment if returning from sign up with a pending tier
  useEffect(() => {
    if (pendingTier && userEmail && !hasAutoTriggered.current) {
      // Ensure we have loaded prices before firing if they are dynamic, but we have default prices anyway
      // So let's just fire once.
      hasAutoTriggered.current = true;
      if (pendingTier === 'initiate') {
         handleFree();
      } else if (pendingTier === 'architect') {
         handlePaid('architect', prices.architect[billingCycle]);
      } else if (pendingTier === 'syndicate') {
         handlePaid('syndicate', prices.syndicate[billingCycle]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTier, userEmail, prices.architect, prices.syndicate, billingCycle]);

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col items-center justify-center p-4 py-12 md:p-8 relative">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[10px]">Back</span>
        </button>
      )}
      <div className="max-w-7xl w-full flex flex-col items-center">
        {isExpired && (
          <div className="w-full max-w-2xl mb-8 bg-red-950/40 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center justify-center gap-3">
             <AlertCircle className="w-5 h-5 text-red-500" />
             <span className="font-bold">Your subscription has expired. Please authorize a tier to regain access.</span>
          </div>
        )}
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-foreground text-center">
           {isExpired ? 'Renew Authorization' : 'Select Authorization Tier'}
        </h2>
        <p className="text-muted-foreground text-lg mb-8 text-center max-w-2xl font-mono uppercase tracking-widest">
          Choose your protocol level to access the intelligence vault.
        </p>

        <div className="flex bg-background border border-border rounded-lg p-1 mb-12">
          {['monthly', 'quarterly', 'annually'].map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle as any)}
              className={`px-6 py-2 rounded-md capitalize font-bold text-sm tracking-widest transition-colors ${
                billingCycle === cycle ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cycle} {cycle !== 'monthly' && <span className="text-[10px] opacity-70 ml-1">SAVE</span>}
            </button>
          ))}
        </div>

        {paymentError && (
          <div className="w-full max-w-3xl mb-8 p-4 bg-red-950/50 border border-red-500/50 rounded-xl flex items-start gap-4 text-red-200">
            <AlertCircle className="w-6 h-6 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-red-400 mb-1">Transaction Failed</h3>
              <p className="text-sm opacity-90">{paymentError}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 w-full">
          {/* Free Tier */}
          <div className="bg-card backdrop-blur-xl border border-border p-8 rounded-2xl flex flex-col relative overflow-hidden group">
            <h3 className="text-xl font-bold mb-2 uppercase tracking-widest text-muted-foreground">Initiate</h3>
            <div className="text-4xl font-bold text-foreground mb-8">
              Free
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-muted-foreground"><Check className="text-primary shrink-0 w-5 h-5" /> 10 Prospect Capacity Limit</li>
              <li className="flex gap-3 text-sm text-muted-foreground"><Check className="text-primary shrink-0 w-5 h-5" /> Standard Data Matrix</li>
              <li className="flex gap-3 text-sm text-foreground/40 line-through"><Check className="text-foreground/20 shrink-0 w-5 h-5" /> Executive Analytics</li>
              <li className="flex gap-3 text-sm text-foreground/40 line-through"><Check className="text-foreground/20 shrink-0 w-5 h-5" /> Multi-Tenant Shield</li>
            </ul>
            <button 
              onClick={handleFree}
              disabled={loadingTier !== null}
              className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-100 py-4 rounded-lg font-bold uppercase tracking-widest transition-all">
              {loadingTier === 'free' ? 'Authorizing...' : 'Initialize (Free)'}
            </button>
          </div>

          {/* Architect Tier */}
          <div className="bg-card backdrop-blur-xl border-2 border-primary p-8 rounded-2xl flex flex-col relative overflow-hidden group transform md:-translate-y-4 shadow-2xl shadow-primary/10">
            <div className="absolute top-0 right-0 bg-primary/20 text-primary uppercase text-[10px] tracking-widest font-bold px-3 py-1 rounded-bl-lg">Recommended</div>
            <h3 className="text-xl font-bold mb-2 uppercase tracking-widest text-primary">Architect</h3>
            <div className="text-4xl font-bold text-foreground mb-8">
              ${prices.architect[billingCycle as keyof typeof prices.architect]} <span className="text-sm font-normal text-muted-foreground capitalize">/ {billingCycle.replace('ly', '')}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-foreground"><Check className="text-primary shrink-0 w-5 h-5" /> Unlimited Active Prospects</li>
              <li className="flex gap-3 text-sm text-foreground"><Check className="text-primary shrink-0 w-5 h-5" /> Advanced Matrix Intelligence</li>
              <li className="flex gap-3 text-sm text-foreground"><Check className="text-primary shrink-0 w-5 h-5" /> Full Session Isolation</li>
              <li className="flex gap-3 text-sm text-foreground/40 line-through"><Check className="text-foreground/20 shrink-0 w-5 h-5" /> Influence Map Protocol</li>
            </ul>
            <button 
              onClick={() => handlePaid('architect', prices.architect[billingCycle as keyof typeof prices.architect])}
              disabled={loadingTier !== null}
              className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20">
              {loadingTier === 'architect' ? 'Processing...' : 'Deploy Architecture'}
            </button>
          </div>

          {/* Syndicate Tier */}
          <div className="bg-card backdrop-blur-xl border border-border p-8 rounded-2xl flex flex-col relative overflow-hidden group">
            <h3 className="text-xl font-bold mb-2 uppercase tracking-widest text-amber-500">Syndicate</h3>
            <div className="text-4xl font-bold text-foreground mb-8">
              ${prices.syndicate[billingCycle as keyof typeof prices.syndicate]} <span className="text-sm font-normal text-muted-foreground capitalize">/ {billingCycle.replace('ly', '')}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
               <li className="flex gap-3 text-sm text-foreground"><Check className="text-primary shrink-0 w-5 h-5" /> Unlimited Active Prospects</li>
               <li className="flex gap-3 text-sm text-foreground"><Check className="text-primary shrink-0 w-5 h-5" /> Apex Analytics Sandbox</li>
               <li className="flex gap-3 text-sm text-foreground"><Check className="text-primary shrink-0 w-5 h-5" /> Sovereign Session Shield</li>
               <li className="flex gap-3 text-sm text-foreground"><Check className="text-primary shrink-0 w-5 h-5" /> Influence Map Protocol Enabled</li>
            </ul>
            <button 
              onClick={() => handlePaid('syndicate', prices.syndicate[billingCycle as keyof typeof prices.syndicate])}
              disabled={loadingTier !== null}
              className="w-full bg-zinc-900 text-amber-500 border border-amber-500/30 hover:border-amber-500 hover:bg-zinc-800 py-4 rounded-lg font-bold uppercase tracking-widest transition-all">
              {loadingTier === 'syndicate' ? 'Processing...' : 'Purchase Syndicate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
