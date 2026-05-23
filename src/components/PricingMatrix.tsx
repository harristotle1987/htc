import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

type BillingFrequency = 'monthly' | 'quarterly' | 'yearly';

export default function PricingMatrix() {
  const [billing, setBilling] = useState<BillingFrequency>('monthly');

  const plans = {
    monthly: { price: 49, interval: '/ mo' },
    quarterly: { price: 129, interval: '/ qtr' },
    yearly: { price: 399, interval: '/ yr' }
  };

  const getPrice = (base: number) => {
    if (billing === 'monthly') return base;
    if (billing === 'quarterly') return Math.floor(base * 3 * 0.9); // Slight discount
    return Math.floor(base * 12 * 0.8); // 20% discount
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-8 text-primary">Choose Your Path</h2>
      
      <div className="flex bg-muted/20 rounded-lg p-1 mb-12">
        {(['monthly', 'quarterly', 'yearly'] as BillingFrequency[]).map(f => (
          <button 
            key={f} 
            onClick={() => setBilling(f)}
            className={`px-6 py-2 rounded-md font-bold capitalize ${billing === f ? 'bg-primary text-primary-foreground' : 'text-muted'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl">
        {[
          { name: 'Monthly', features: ['Full Pipeline CRUD', 'Unlimited Leads', 'Standard Metrics'] },
          { name: 'Quarterly', features: ['Core Features', 'Executive Dashboard', 'Stakeholder Access'] },
          { name: 'Yearly', features: ['Full Workspace', '10-Call Script Map', 'Automated Cadences'] }
        ].map((plan, i) => (
          <div key={i} className="bg-card backdrop-blur-xl border border-border p-8 rounded-2xl flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-foreground">{plan.name}</h3>
            <div className="text-4xl font-bold text-primary mb-8">
              ${getPrice(i === 0 ? 49 : i === 1 ? 43 : 33)} 
              <span className="text-sm text-muted">{plans[billing].interval}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex gap-2 text-muted"><Check className="text-primary" /> {f}</li>
              ))}
            </ul>
            <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold border border-border hover:brightness-110 transition-colors">Select Plan</button>
          </div>
        ))}
      </div>
    </div>
  );
}
