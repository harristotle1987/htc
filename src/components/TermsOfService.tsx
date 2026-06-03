import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 max-w-4xl mx-auto w-full">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-2 text-foreground/80 hover:text-primary mb-8 transition-colors group bg-accent/30 hover:bg-accent/60 px-4 py-2 rounded-xl backdrop-blur-md border border-border/50"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold uppercase tracking-widest text-xs">Go Back</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 bg-card/60 backdrop-blur-xl p-8 lg:p-10 rounded-3xl border border-border shadow-xl shadow-black/5"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">Terms of Service</h1>
            <p className="text-muted text-sm uppercase tracking-widest font-bold mt-1">Last Updated: May 24, 2026</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">1. Agreement to Terms</h2>
          <p className="text-muted leading-relaxed">
            By accessing or using Aegis Vault, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">2. Use of Services</h2>
          <p className="text-muted leading-relaxed">
            You are responsible for your use of the services and for any content you provide, including compliance with applicable laws, rules, and regulations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">3. Account Integrity</h2>
          <p className="text-muted leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">4. Termination</h2>
          <p className="text-muted leading-relaxed">
            We reserve the right to terminate or suspend your access to our services at any time, for any reason, including violation of these terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">5. Limitation of Liability</h2>
          <p className="text-muted leading-relaxed">
            To the maximum extent permitted by law, Aegis Vault shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
          </p>
        </section>
      </motion.div>
    </div>
  );
}
