import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">Privacy Policy</h1>
            <p className="text-muted text-sm uppercase tracking-widest font-bold mt-1">Last Updated: May 24, 2026</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">1. Introduction</h2>
          <p className="text-muted leading-relaxed">
            Aegis Vault ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Aegis Vault.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">2. Information We Collect</h2>
          <p className="text-muted leading-relaxed">
            We collect information that you provide directly to us, such as when you create or modify your account, request support, or otherwise communicate with us. This information may include:
          </p>
          <ul className="list-disc list-inside text-muted pl-4 space-y-2">
            <li>Name, email address, and other contact information</li>
            <li>Lead and contact data you input into the CRM</li>
            <li>Authentication data (Google OAuth tokens)</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">3. How We Use Your Information</h2>
          <p className="text-muted leading-relaxed">
            We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect Aegis Vault and our users. For example, we use information to:
          </p>
          <ul className="list-disc list-inside text-muted pl-4 space-y-2">
            <li>Facilitate lead management and sales tracking</li>
            <li>Operate and improve our CRM features</li>
            <li>Communicate with you about products, services, and events</li>
            <li>Keep our services safe and secure</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">4. Data Security</h2>
          <p className="text-muted leading-relaxed">
            We use a variety of security technologies and procedures to help protect your personal data from unauthorized access, use, or disclosure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">5. Contact Us</h2>
          <p className="text-muted leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at support@aegisvault.crm.
          </p>
        </section>
      </motion.div>
    </div>
  );
}
