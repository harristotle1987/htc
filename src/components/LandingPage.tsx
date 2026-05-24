import React, { useState } from 'react';
import { Target, ArrowRight, ShieldCheck, LayoutDashboard, Database, BarChart3, LockKeyhole, Zap, Fingerprint, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import AuthModal from './AuthModals';

interface LandingPageProps {
  onSignInSuccess: () => void;
}

export default function LandingPage({ onSignInSuccess }: LandingPageProps) {
  const [modalType, setModalType] = useState<'login' | 'signup' | null>(null);

  return (
    <div className="min-h-screen w-full bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 overflow-hidden shrink-0 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] flex items-center justify-center bg-card">
               <img src="/logo.png" alt="Aegis Vault" className="w-full h-full object-cover" />
            </div>
            <div className="text-xl font-display font-bold text-foreground">Aegis <span className="text-primary">Vault</span></div>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setModalType('login')} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Access Vault</button>
            <button onClick={() => setModalType('signup')} className="text-sm font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded-lg border border-primary/20 hover:brightness-110 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">Claim Workspace</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-32 pb-20 px-6">
        
        {/* Hero Section */}
        <section className="pt-20 pb-24 md:pt-32 md:pb-40 text-center flex flex-col items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Aegis Vault v2.0 is Live</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-8 leading-[1.1] max-w-5xl mx-auto"
          >
            I do not compete. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-amber-600">I diagnose, then prescribe.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            The private pipeline matrix for elite closers. Securely manage, visualize, and track your high-ticket strategic leads with military precision.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center"
          >
            <button onClick={() => setModalType('signup')} className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl text-lg hover:brightness-110 transition-all shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center gap-2">
              Deploy Your Vault <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => setModalType('login')} className="bg-card text-foreground font-bold px-8 py-4 rounded-xl text-lg border border-border hover:bg-muted/10 transition-all flex items-center justify-center gap-2">
              <LockKeyhole className="w-5 h-5" /> Access Existing
            </button>
          </motion.div>
        </section>

        {/* Bento Grid Features */}
        <section className="mb-32 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">Enterprise-grade architecture.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Built for high-stakes deal flows where every stakeholder and detail matters.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Large Card */}
            <div className="md:col-span-2 bg-card border border-border rounded-3xl p-8 lg:p-12 relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-primary/20 transition-colors" />
              <LayoutDashboard className="w-12 h-12 text-primary mb-8" />
              <h3 className="text-2xl font-bold mb-4 font-display">Obsidian 5-Stage Kanban</h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-md">
                Military-grade visibility over your entire pipeline. Drag and drop leads through highly optimized stages. Identify bottlenecks before they fracture your deal.
              </p>
              <ul className="space-y-3">
                {['Tension Mapping', 'Budget Anchoring', 'Pain Point Diagnosis'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Small Card 1 */}
            <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-primary/30 transition-colors flex flex-col">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] -mr-24 -mb-24 group-hover:bg-blue-500/20 transition-colors" />
              <Fingerprint className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4 font-display">The Influence Map</h3>
              <p className="text-muted-foreground mb-auto">
                Visually track executive committees, blockers, and champions. Knowing who pulls the strings is half the close.
              </p>
            </div>
            
            {/* Small Card 2 */}
            <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-primary/30 transition-colors flex flex-col">
              <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] -ml-24 -mt-24 group-hover:bg-amber-500/20 transition-colors" />
              <BarChart3 className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4 font-display">Executive Metrics</h3>
              <p className="text-muted-foreground mb-auto">
                Real-time strategic insights. Monitor Show-to-Close rates, Talk:Listen ratios, and forecasted cash collected.
              </p>
            </div>
            
            {/* Large Card */}
            <div className="md:col-span-2 bg-gradient-to-br from-card to-card/50 border border-border rounded-3xl p-8 lg:p-12 relative overflow-hidden group hover:border-primary/30 transition-colors flex flex-col justify-center">
              <div className="absolute bottom-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
              <Zap className="w-12 h-12 text-primary mb-8" />
              <h3 className="text-2xl font-bold mb-4 font-display">Workspace Synchronization</h3>
              <p className="text-muted-foreground text-lg max-w-xl">
                Seamlessly pull the latest correspondence from your Google Workspace natively into the Vault. No more context switching. Secure, robust, and lightning-fast.
              </p>
              <button onClick={() => setModalType('signup')} className="mt-8 flex items-center gap-2 text-primary font-bold hover:underline w-fit">
                Start syncing today <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mb-24">
          <div className="bg-card border border-border rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] pointer-events-none" />
            <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">Ready to fortify your pipeline?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Stop bleeding high-ticket deals. Lock down your workflow with Aegis Vault and focus on what you do best: closing.
            </p>
            <button onClick={() => setModalType('signup')} className="bg-primary text-primary-foreground font-bold px-10 py-5 rounded-2xl text-xl hover:brightness-110 transition-all shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)]">
              Claim Your Workspace
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 rounded-full border border-primary/20 overflow-hidden shrink-0">
               <img src="/logo.png" alt="Aegis Vault" className="w-full h-full object-cover grayscale opacity-70" />
            </div>
            <span className="font-display font-bold text-muted-foreground">Aegis Vault</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground font-medium">
            <a href="/privacy.html" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms.html" className="hover:text-foreground transition-colors">Terms of Service</a>
            <span className="opacity-50">© 2026 Aegis Vault</span>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={modalType !== null} 
        onClose={() => setModalType(null)} 
        type={modalType || 'login'} 
        onSignInSuccess={onSignInSuccess}
      />
    </div>
  );
}
