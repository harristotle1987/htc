import React, { useState, useEffect } from 'react';
import { Target, ArrowRight, ShieldCheck, LayoutDashboard, Database, BarChart3, LockKeyhole, Zap, Fingerprint, ChevronRight, CheckCircle2, CreditCard, ChevronDown, Plus, FileText, Lock, Sun, Moon, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AuthModal from './AuthModals';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import PricingMatrix from './PricingMatrix';

interface LandingPageProps {
  onSignInSuccess: (email: string, pendingTier?: string | null, require2FA?: boolean) => void;
  globalSettings?: any;
}

const GenericPage = ({ title, onBack }: { title: string, onBack: () => void }) => {
  const displayTitle = title.charAt(0).toUpperCase() + title.slice(1).replace('-', ' ');
  return (
  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 max-w-4xl mx-auto min-h-[60vh] flex flex-col items-start mt-24 pb-24">
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onBack}
      className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      <span className="font-bold uppercase tracking-widest text-[10px]">Back to Home</span>
    </motion.button>
    <h1 className="text-3xl md:text-5xl font-display font-bold mb-6 text-foreground">{displayTitle}</h1>
    <p className="text-muted-foreground text-lg mb-8">This page is currently under construction. Please check back later for full details regarding {displayTitle.toLowerCase()}.</p>
    <div className="w-full h-[30vh] border border-border/50 rounded-xl bg-card/30 flex items-center justify-center backdrop-blur-sm">
      <div className="flex flex-col items-center text-muted-foreground">
        <Lock className="w-8 h-8 mb-4 opacity-50" />
        <p className="font-mono text-sm uppercase tracking-widest text-primary/70">SECURE ESTABLISHED</p>
      </div>
    </div>
  </div>
);
};

export default function LandingPage({ onSignInSuccess, globalSettings }: LandingPageProps) {
  const [modalType, setModalType] = useState<'login' | 'signup' | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });
  const [guestView, setGuestView] = useState<'home' | 'features' | 'pricing' | 'security' | 'api' | 'privacy' | 'terms' | 'data' | 'status'>('home');
  const [prices, setPrices] = useState<any>({ 
     architect: { monthly: 6 }, 
     syndicate: { monthly: 16 } 
  });

  useEffect(() => {
    const fetchPrices = () => {
      fetch('/api/prices')
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

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleTierSelect = (tier: string) => {
    setSelectedTier(tier);
    setModalType('signup');
  };

  const handleAuthSuccess = (email: string, require2FA?: boolean) => {
    onSignInSuccess(email, selectedTier, require2FA);
  };

  const faqs = [
    { question: "What makes Aegis Vault different from a standard CRM?", answer: "Aegis Vault is explicitly designed for high-ticket closing and absolute privacy. We eliminated the bloat of traditional CRMs to give you a lean, high-contrast matrix focused purely on pipeline velocity and secure document management." },
    { question: "How secure is my strategic contact data?", answer: "Your data is heavily encrypted. We utilize advanced session handling, mandatory Two-Factor Authentication (2FA), and secure database architecture to ensure your Rolodex and pipeline metrics remain exclusively under your control." },
    { question: "Does Aegis Vault process local currencies?", answer: "Yes. Through our native Paystack integration, you can securely handle your subscription and manage local fiat transactions seamlessly without leaving the ecosystem." },
    { question: "Can I migrate my existing pipeline into the Vault?", answer: "Absolutely. You can import your current leads and stakeholder data via a formatted CSV file directly into your Private Pipeline Matrix." },
    { question: "How does the Member-Only Document Vault work?", answer: "It acts as a secure, isolated storage drive within your CRM. You can upload, manage, and attach sensitive contracts or collateral directly to a lead's profile without relying on external cloud links." },
    { question: "Am I locked into a long-term contract?", answer: "No. The Initiate and Architect tiers are billed month-to-month. You can upgrade, downgrade, or purge your vault data at any time directly from your admin settings." },
    { question: "What happens if I execute the \"Purge Vault Data\" command?", answer: "This is a hard-reset function designed for absolute privacy. Executing a purge permanently wipes your local cache, diagnostic mapping, and pipeline flow. It cannot be undone." },
    { question: "Is there an onboarding process for new users?", answer: "Yes. Upon initializing your vault, you will be guided through a frictionless setup process, including securing your account with Google Authenticator and importing your initial data matrix." },
  ];

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground selection:bg-primary/30 overflow-x-hidden pt-20 transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50 transition-colors duration-300">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setGuestView('home')}>
            <div className="w-8 h-8 rounded-full border-2 border-primary/30 overflow-hidden shrink-0 shadow-sm flex items-center justify-center bg-card">
               <img src="/logo.png" alt="Aegis Vault" className="w-full h-full object-cover" />
            </div>
            <div className="text-xl font-display font-bold text-foreground tracking-wider">Aegis <span className="text-primary">Vault</span></div>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-muted/50 border border-transparent hover:border-border text-muted-foreground hover:text-foreground transition-all mr-2">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => { setModalType('login'); }} className="text-sm font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest hover:bg-muted/50 px-4 py-2.5 rounded">
              Sign In
            </button>
            {globalSettings?.registrationOpen !== false ? (
               <button onClick={() => { setModalType('signup'); }} className="text-sm font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded border border-primary hover:brightness-110 transition-all tracking-wider uppercase">Initialize Vault</button>
            ) : (
               <button disabled className="text-sm font-bold bg-muted text-muted-foreground px-5 py-2.5 rounded border border-border cursor-not-allowed tracking-wider uppercase" title="Registration is currently closed">Init Closed</button>
            )}
          </div>
        </div>
      </nav>

      {guestView === 'home' ? (
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <section className="flex flex-col items-center text-center space-y-8 mb-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.05)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/50 bg-primary/5 text-primary text-xs font-bold tracking-widest uppercase mb-4">
            <ShieldCheck className="w-4 h-4" /> Secure System
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold max-w-4xl tracking-tighter text-foreground">
            The Private <br className="hidden md:block"/> Sales CRM.
          </h1>
          
          <p className="text-xl text-muted-foreground/90 max-w-2xl leading-relaxed font-light">
            A secure digital workspace built for top sales professionals.
            Own your database. Secure your contracts. Calculate your velocity.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto justify-center mt-8">
            <button onClick={() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-primary text-primary-foreground font-bold uppercase tracking-widest px-8 py-4 rounded text-lg hover:brightness-110 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3">
              View Pricing <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={scrollToFeatures} className="bg-card/50 text-foreground font-bold uppercase tracking-widest px-8 py-4 rounded text-lg border border-border hover:brightness-110 transition-all flex items-center justify-center gap-3">
              View Features
            </button>
          </div>
          
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl opacity-60">
             <div className="flex flex-col items-center gap-2 text-foreground font-mono text-sm tracking-widest uppercase"><LockKeyhole className="w-6 h-6 text-primary" /> End-to-End</div>
             <div className="flex flex-col items-center gap-2 text-foreground font-mono text-sm tracking-widest uppercase"><Fingerprint className="w-6 h-6 text-primary" /> 2FA Secured</div>
             <div className="flex flex-col items-center gap-2 text-foreground font-mono text-sm tracking-widest uppercase"><Database className="w-6 h-6 text-primary" /> Local First</div>
             <div className="flex flex-col items-center gap-2 text-foreground font-mono text-sm tracking-widest uppercase"><Target className="w-6 h-6 text-primary" /> High-Ticket</div>
          </div>
        </section>

        <section id="features" className="mb-32 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="bg-card/80 backdrop-blur-md border border-border p-8 hover:border-primary/50 transition-colors rounded-2xl group flex flex-col justify-between">
              <div>
                <Database className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold font-display tracking-wide mb-3 text-foreground">Complete Privacy</h3>
                <p className="text-muted-foreground/90 leading-relaxed font-light mb-6">Pipeline data persists exclusively within your authenticated session. No external parsing, no telemetry.</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground font-mono uppercase tracking-wider">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Session Isolation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Offline Architecture</li>
              </ul>
            </div>

            <div className="bg-card/80 backdrop-blur-md border border-border p-8 hover:border-primary/50 transition-colors rounded-2xl group flex flex-col justify-between">
              <div>
                <LockKeyhole className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold font-display tracking-wide mb-3 text-foreground">Member-Only Vault</h3>
                <p className="text-muted-foreground/90 leading-relaxed font-light mb-6">A dedicated storage matrix for confidential client agreements, NDAs, and onboarding assets. Zero public links.</p>
              </div>
               <ul className="space-y-2 text-sm text-muted-foreground font-mono uppercase tracking-wider">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Isolated Storage</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Lead-Specific Binding</li>
              </ul>
            </div>

            <div className="bg-card/80 backdrop-blur-md border border-border p-8 hover:border-primary/50 transition-colors rounded-2xl group flex flex-col justify-between">
              <div>
                <LayoutDashboard className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold font-display tracking-wide mb-3 text-foreground">Kinetic Pipeline</h3>
                <p className="text-muted-foreground/90 leading-relaxed font-light mb-6">A highly visual, drag-and-drop strategic board designed for uncompromising deal-flow management.</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground font-mono uppercase tracking-wider">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Drag/Drop Routing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Target Mapping</li>
              </ul>
            </div>

            <div className="bg-card/80 backdrop-blur-md border border-border p-8 hover:border-primary/50 transition-colors rounded-2xl group flex flex-col justify-between">
              <div>
                <BarChart3 className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold font-display tracking-wide mb-3 text-foreground">Velocity Diagnostics</h3>
                <p className="text-muted-foreground/90 leading-relaxed font-light mb-6">Real-time analytical layer measuring close rates, pipeline value, and target-completion trajectory.</p>
              </div>
               <ul className="space-y-2 text-sm text-muted-foreground font-mono uppercase tracking-wider">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Win-Rate Metrics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Target Analysis</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="pricing" className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4 text-foreground">Access Tiers</h2>
            <p className="text-lg text-muted-foreground uppercase tracking-widest font-mono flex items-center justify-center gap-3">
              Secure processing via <CreditCard className="w-5 h-5 text-primary" /> <span className="text-foreground font-bold tracking-normal">Paystack</span>
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-center">
            
            <div className="bg-card/80 backdrop-blur-md border border-border p-10 flex flex-col hover:border-primary/50 transition-colors h-full rounded-2xl">
               <h3 className="text-xl font-bold uppercase tracking-wider text-foreground mb-2">Initiate</h3>
               <p className="text-muted-foreground/90 text-sm mb-6 pb-6 border-b border-border">Free tier. Hard limit of 10 active prospects.</p>
               <div className="text-4xl font-bold font-mono text-foreground mb-8">$0<span className="text-sm text-muted-foreground font-sans tracking-widest uppercase">/once</span></div>
               <ul className="space-y-4 mb-10 flex-1">
                 {['Active Pipeline Matrix (Up to 10 limits)', 'View analytics dashboard', 'No lead creation/editing'].map((f, i) => (
                   <li key={i} className="flex gap-3 text-sm text-foreground/90 items-start">
                     <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> 
                     <span>{f}</span>
                   </li>
                 ))}
               </ul>
               <button 
                 onClick={() => handleTierSelect('initiate')}
                 className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-800 py-4 font-bold uppercase tracking-widest text-sm transition-all flex justify-center items-center gap-2 rounded-lg"
               >
                 Sign Up Profile
               </button>
            </div>

             <div className="bg-card backdrop-blur-md border border-primary relative p-10 flex flex-col scale-105 shadow-[0_0_40px_rgba(217,119,6,0.15)] z-10 rounded-2xl">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                 Highly Recommended
               </div>
               <h3 className="text-xl font-bold uppercase tracking-wider text-foreground mb-2">Architect</h3>
               <p className="text-muted-foreground/90 text-sm mb-6 pb-6 border-b border-border">Standard CRM functionality for active closing.</p>
               <div className="text-4xl font-bold font-mono text-foreground mb-8">
                 ${prices?.architect?.monthly ?? 6}<span className="text-sm text-muted-foreground font-sans tracking-widest uppercase">/month</span>
               </div>
               <ul className="space-y-4 mb-10 flex-1">
                 {['Full read/write pipeline access', 'Create and edit leads', 'Active Pipeline Matrix', 'Standard Document Vault (5GB)'].map((f, i) => (
                   <li key={i} className="flex gap-3 text-sm text-foreground items-start font-medium">
                     <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> 
                     <span>{f}</span>
                   </li>
                 ))}
               </ul>
               <button 
                 onClick={() => handleTierSelect('architect')}
                 className="w-full bg-primary hover:brightness-110 text-primary-foreground py-4 font-bold uppercase tracking-widest text-sm transition-all shadow-lg shadow-primary/20 flex justify-center items-center gap-2 rounded-lg"
               >
                 Sign Up Profile
               </button>
            </div>

            <div className="bg-card/80 backdrop-blur-md border border-border p-10 flex flex-col hover:border-primary/50 transition-colors h-full rounded-2xl">
               <h3 className="text-xl font-bold uppercase tracking-wider text-foreground mb-2">Syndicate</h3>
               <p className="text-muted-foreground/90 text-sm mb-6 pb-6 border-b border-border">High-ticket professionals managing significant deal flow.</p>
               <div className="text-4xl font-bold font-mono text-foreground mb-8">
                 ${prices?.syndicate?.monthly ?? 16}<span className="text-sm text-muted-foreground/70 font-sans tracking-widest uppercase">/month</span>
               </div>
               <ul className="space-y-4 mb-10 flex-1">
                 {['Everything in Standard, plus:', 'Unlimited Active Leads', 'Advanced Analytics & Velocity Trajectory', 'Expanded Document Vault (50GB)'].map((f, i) => (
                   <li key={i} className="flex gap-3 text-sm text-foreground/90 items-start">
                     <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> 
                     <span>{f}</span>
                   </li>
                 ))}
               </ul>
               <button 
                 onClick={() => handleTierSelect('syndicate')}
                 className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-800 py-4 font-bold uppercase tracking-widest text-sm transition-all flex justify-center items-center gap-2 rounded-lg"
               >
                 Sign Up Profile
               </button>
            </div>
          </div>
        </section>

        <section className="mb-24 max-w-3xl mx-auto">
           <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4 text-foreground">Operational Parameters</h2>
            <p className="text-lg text-muted-foreground">Architectural details and deployment constraints.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`bg-card border overflow-hidden transition-all duration-300 rounded-xl hover:border-primary/40 ${activeFaq === index ? 'border-primary/50 shadow-xl shadow-primary/5' : 'border-border/60'}`}
              >
                <button 
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span className="font-bold text-foreground group-hover:text-primary transition-colors pr-8">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${activeFaq === index ? 'rotate-180 text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                </button>
                
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5 text-muted-foreground leading-relaxed pt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </main>
      ) : guestView === 'pricing' ? (
        <div className="pt-20">
          <PricingMatrix userEmail={null} onComplete={() => setGuestView('home')} onBack={() => setGuestView('home')} />
        </div>
      ) : guestView === 'privacy' ? (
        <div className="pt-24 pb-24 min-h-[80vh]">
          <PrivacyPolicy onBack={() => setGuestView('home')} />
        </div>
      ) : guestView === 'terms' ? (
        <div className="pt-24 pb-24 min-h-[80vh]">
           <TermsOfService onBack={() => setGuestView('home')} />
        </div>
      ) : (
        <GenericPage title={guestView} onBack={() => setGuestView('home')} />
      )}

      <footer className="border-t border-border/40 bg-zinc-950/80 dark:bg-zinc-950 text-zinc-400 py-16 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
             <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <span className="font-display font-bold text-xl text-zinc-100 tracking-tight">Aegis Vault</span>
             </div>
             <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
               Enterprise-grade operational CRM for private syndicates. Secure, logged, and untraceable.
             </p>
          </div>
          
          <div>
            <h3 className="font-bold text-zinc-100 mb-6 text-sm uppercase tracking-widest font-mono">Platform</h3>
            <ul className="space-y-4 text-sm">
              <li><button onClick={() => setGuestView('features')} className="hover:text-primary transition-colors cursor-pointer">Features</button></li>
              <li><button onClick={() => setGuestView('pricing')} className="hover:text-primary transition-colors cursor-pointer">Pricing Matrix</button></li>
              <li><button onClick={() => setGuestView('security')} className="hover:text-primary transition-colors cursor-pointer">Security Protocol</button></li>
              <li><button onClick={() => setGuestView('api')} className="hover:text-primary transition-colors cursor-pointer">API Access</button></li>
            </ul>
          </div>
          
          <div>
             <h3 className="font-bold text-zinc-100 mb-6 text-sm uppercase tracking-widest font-mono">Legal & Ops</h3>
             <ul className="space-y-4 text-sm">
              <li><button onClick={() => setGuestView('privacy')} className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => setGuestView('terms')} className="hover:text-primary transition-colors cursor-pointer">Terms of Service</button></li>
              <li><button onClick={() => setGuestView('data')} className="hover:text-primary transition-colors cursor-pointer">Data Processing</button></li>
              <li><button onClick={() => setGuestView('status')} className="hover:text-primary transition-colors cursor-pointer">System Status</button></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-zinc-600">
          <div>&copy; {new Date().getFullYear()} Aegis Vault Systems. All rights reserved. // <span className="text-primary/70">SECURE ESTABLISHED</span></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse"></div>
            <span>All operations logged and encrypted.</span>
          </div>
        </div>
      </footer>

      {modalType && (
        <AuthModal 
          isOpen={true} 
          onClose={() => { setModalType(null); }} 
          type={modalType} 
          registrationOpen={globalSettings?.registrationOpen}
          onSignInSuccess={handleAuthSuccess}
          onTypeChange={(type) => { 
            setModalType(type); 
          }}
        />
      )}
    </div>
  );
}
