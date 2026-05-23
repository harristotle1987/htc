import React, { useState } from 'react';
import { Target, ArrowRight, ShieldCheck, LayoutDashboard, Database, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import AuthModal from './AuthModals';

interface LandingPageProps {
  onSignInSuccess: () => void;
}

export default function LandingPage({ onSignInSuccess }: LandingPageProps) {
  const [modalType, setModalType] = useState<'login' | 'signup' | null>(null);

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-6 selection:bg-amber-900/50">
      <nav className="flex justify-between items-center max-w-7xl mx-auto py-6">
        <div className="text-xl font-display font-bold text-primary">Aegis Vault</div>
        <div className="flex gap-4">
          <button onClick={() => setModalType('login')} className="text-sm font-medium hover:text-primary transition-colors">Log In</button>
          <button onClick={() => setModalType('signup')} className="text-sm font-bold bg-secondary text-secondary-foreground px-4 py-2 rounded-lg border border-border hover:brightness-110 transition-colors">Claim Workspace</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto mt-20 md:mt-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8">
            I do not compete. <span className="text-primary">I diagnose, then prescribe.</span>
          </h1>
          <p className="text-xl text-muted mb-12 leading-relaxed">
            The private pipeline matrix. Securely manage, visualize, and track your high-value strategic leads with enterprise-grade focus.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setModalType('signup')} className="bg-secondary text-secondary-foreground font-bold px-8 py-4 rounded-xl text-lg border border-border hover:brightness-110 transition-all shadow-lg">Claim Workspace</button>
            <button onClick={() => setModalType('login')} className="bg-card text-card-foreground font-bold px-8 py-4 rounded-xl text-lg hover:brightness-110 transition-all">Access Vault</button>
          </div>
        </motion.div>

        <section className="mt-32 grid md:grid-cols-3 gap-6">
          {[
            { icon: LayoutDashboard, title: "Obsidian 5-Stage Kanban", desc: "Military-grade pipeline visibility." },
            { icon: Database, title: "10-Call Type Tracker", desc: "Diagnostic-focused script analytics." },
            { icon: BarChart3, title: "Executive Metrics Panel", desc: "Real-time strategic insights." }
          ].map((feat, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center">
              <feat.icon className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
              <p className="text-muted">{feat.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <AuthModal 
        isOpen={modalType !== null} 
        onClose={() => setModalType(null)} 
        type={modalType || 'login'} 
        onSignInSuccess={onSignInSuccess}
      />
    </div>
  );
}
