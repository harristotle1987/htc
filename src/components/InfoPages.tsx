import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Server, ShieldCheck, Code, Activity, Database, KeyRound, Network, Lock, FileCode, CheckCircle2 } from 'lucide-react';

interface SubPageProps {
  onBack: () => void;
}

const BackButton = ({ onBack }: { onBack: () => void }) => (
  <motion.button
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={onBack}
    className="flex items-center gap-2 text-foreground/80 hover:text-primary mb-8 transition-colors group bg-accent/30 hover:bg-accent/60 px-4 py-2 rounded-xl backdrop-blur-md border border-border/50 w-fit"
  >
    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
    <span className="font-bold uppercase tracking-widest text-xs">Go Back</span>
  </motion.button>
);

export const DataProcessingPage = ({ onBack }: SubPageProps) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 max-w-4xl mx-auto w-full pt-24 pb-24">
      <BackButton onBack={onBack} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 bg-card/60 backdrop-blur-xl p-8 lg:p-10 rounded-3xl border border-border shadow-xl shadow-black/5"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">Data Processing Agreement</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold mt-1">Operational Guidelines</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">1. Data Sovereignty</h2>
          <p className="text-muted-foreground leading-relaxed">
            All user data, including lead profiles, contact details, and strategic documentation, is processed exclusively to provide the core CRM functionality. We do not sell, rent, or share your proprietary pipeline data with third-party analytical services or data brokers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">2. Local-First Caching</h2>
          <p className="text-muted-foreground leading-relaxed">
            To ensure lightning-fast velocity, Aegis Vault utilizes encrypted local browser caching. This minimizes network calls and ensures your data is accessible even during degraded network conditions, synchronizing stealthily in the background.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">3. Retention & Deletion</h2>
          <p className="text-muted-foreground leading-relaxed">
            Data is retained only as long as your account remains active. Through the "Purge Vault" command in the administrative panel, you retain the absolute right to instantly obliterate all your stored data, documents, and historical logs from our primary servers.
          </p>
        </section>
      </motion.div>
    </div>
  );
};

export const ApiAccessPage = ({ onBack }: SubPageProps) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 max-w-4xl mx-auto w-full pt-24 pb-24">
      <BackButton onBack={onBack} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 bg-card/60 backdrop-blur-xl p-8 lg:p-10 rounded-3xl border border-border shadow-xl shadow-black/5"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Code className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">API Access</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold mt-1">Developer Documentation</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Aegis Vault REST API is designed for enterprise architects to programmatically interface with their secure CRM environment. It allows for advanced lead injection, automated analytics retrieval, and custom dashboard integrations.
          </p>
          <div className="bg-background border border-border p-4 rounded-xl mt-4">
            <div className="flex items-center gap-2 mb-2">
              <FileCode className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-sm">Base URL</span>
            </div>
            <code className="text-primary">https://api.aegisvault.crm/v1/</code>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">Authentication</h2>
          <p className="text-muted-foreground leading-relaxed">
            All requests must be authenticated via an API Key provided in the Authorization header. API Tokens can be generated from the Syndicate Admin Dashboard.
          </p>
          <div className="bg-background border border-border p-4 rounded-xl mt-4">
            <code className="text-muted-foreground">Authorization: Bearer <span className="text-primary">av_live_xYz123...</span></code>
          </div>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Rate Limits</h2>
          <p className="text-muted-foreground leading-relaxed">
            To ensure infrastructural stability, API calls are rate-limited to 1,000 requests per minute per IP. Excess requests will receive a 429 Too Many Requests response.
          </p>
        </section>
      </motion.div>
    </div>
  );
};

export const SecurityProtocolPage = ({ onBack }: SubPageProps) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 max-w-4xl mx-auto w-full pt-24 pb-24">
      <BackButton onBack={onBack} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 bg-card/60 backdrop-blur-xl p-8 lg:p-10 rounded-3xl border border-border shadow-xl shadow-black/5"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">Security Protocol</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold mt-1">Infrastructure Hardening</p>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-background border border-border p-6 rounded-xl">
            <KeyRound className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">2FA Enforced</h3>
            <p className="text-sm text-muted-foreground">Time-based One-Time Password (TOTP) enforcement is heavily encouraged and required for enterprise administrators to access sensitive financial logs.</p>
          </div>
          <div className="bg-background border border-border p-6 rounded-xl">
            <Lock className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">Encrypted Transport</h3>
            <p className="text-sm text-muted-foreground">All data is encrypted in transit using industry-standard TLS 1.3, mitigating man-in-the-middle attacks and ensuring secure payload delivery.</p>
          </div>
          <div className="bg-background border border-border p-6 rounded-xl">
             <Network className="w-8 h-8 text-primary mb-4" />
             <h3 className="font-bold text-lg mb-2">Isolated Sessions</h3>
             <p className="text-sm text-muted-foreground">JSON Web Tokens are stateless, rigorously timed, and bound to specific client environments, auto-terminating after strategic periods of inactivity.</p>
          </div>
          <div className="bg-background border border-border p-6 rounded-xl">
             <Database className="w-8 h-8 text-primary mb-4" />
             <h3 className="font-bold text-lg mb-2">Database Encryption</h3>
             <p className="text-sm text-muted-foreground">Data at rest is secured via AES-256 block-level encryption inside private PostgreSQL clusters, shielded from public network access.</p>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export const SystemStatusPage = ({ onBack }: SubPageProps) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 max-w-4xl mx-auto w-full pt-24 pb-24">
      <BackButton onBack={onBack} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 bg-card/60 backdrop-blur-xl p-8 lg:p-10 rounded-3xl border border-border shadow-xl shadow-black/5"
      >
        <div className="flex items-center justify-between border-b border-border pb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">System Status</h1>
              <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold mt-1">Real-time Metrics</p>
            </div>
          </div>
          <div className="bg-emerald-500/10 text-emerald-500 font-bold px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            All Systems Operational
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
             <span className="font-bold">Core Application</span>
             <span className="flex items-center gap-2 text-emerald-500 text-sm font-bold"><CheckCircle2 className="w-4 h-4" /> Online</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
             <span className="font-bold">Database Cluster</span>
             <span className="flex items-center gap-2 text-emerald-500 text-sm font-bold"><CheckCircle2 className="w-4 h-4" /> Online</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
             <span className="font-bold">Payment Gateway (Monnify)</span>
             <span className="flex items-center gap-2 text-emerald-500 text-sm font-bold"><CheckCircle2 className="w-4 h-4" /> Online</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
             <span className="font-bold">Currency Exchange Node</span>
             <span className="flex items-center gap-2 text-emerald-500 text-sm font-bold"><CheckCircle2 className="w-4 h-4" /> Online</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
             <span className="font-bold">Member Vault Storage</span>
             <span className="flex items-center gap-2 text-emerald-500 text-sm font-bold"><CheckCircle2 className="w-4 h-4" /> Online</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
