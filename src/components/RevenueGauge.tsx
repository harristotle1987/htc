import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface RevenueGaugeProps {
  leads: any[];
  targetRevenue: number;
}

const RevenueGauge: React.FC<RevenueGaugeProps> = ({ leads, targetRevenue }) => {
  const wonLeads = leads.filter(l => l.stage === 'Closed-Won' && l.paymentConfirmed);
  const totalRevenue = wonLeads.reduce((acc, curr) => acc + ((curr.amountPaid || 0) * ((curr.closerPercentage || 0) / 100)), 0);
  
  const percentage = Math.min((totalRevenue / targetRevenue) * 100, 100);
  const data = [
    { name: 'Collected', value: totalRevenue },
    { name: 'Remaining', value: Math.max(targetRevenue - totalRevenue, 0) }
  ];
  const COLORS = ['#10b981', '#f3f4f6'];

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border h-full flex flex-col items-center justify-center">
      <h3 className="text-sm font-semibold text-muted mb-4">Monthly Revenue Target Progress</h3>
      <div className="w-full h-48">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              <Cell key="cell-0" fill={COLORS[0]} />
              <Cell key="cell-1" fill={COLORS[1]} />
            </Pie>
            <Label
              value={`${Math.round(percentage)}%`}
              position="center"
              fill="#111827"
              style={{ fontSize: '24px', fontWeight: 'bold' }}
              dy={-20}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-lg font-bold text-foreground">
        ${totalRevenue.toLocaleString()} <span className="text-sm text-muted">/ ${targetRevenue.toLocaleString()}</span>
      </p>
    </div>
  );
};

export default RevenueGauge;
