import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, BarChart as BarChartIcon } from 'lucide-react';

const mockData = [
  { name: 'Jan', velocity: 14, cash: 40000 },
  { name: 'Feb', velocity: 13, cash: 55000 },
  { name: 'Mar', velocity: 12, cash: 60000 },
  { name: 'Apr', velocity: 10, cash: 85000 },
  { name: 'May', velocity: 9, cash: 110000 },
  { name: 'Jun', velocity: 9, cash: 145000 },
];

// Mock data for stage breakdown
const stageData = [
  { name: 'Discovery', volume: 150000 },
  { name: 'Stakeholder', volume: 220000 },
  { name: 'Executive', volume: 180000 },
  { name: 'Payment', volume: 95000 },
];

export default function AnalyticsChart() {
  return (
    <div className="flex gap-4 p-4 border-b border-border bg-card/50 overflow-hidden">
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="w-full border-b border-border bg-card/50 overflow-hidden"
    >
      <div className="px-6 py-5 max-w-[1600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Chart */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Trajectory: Cash Collected vs Pipeline Velocity
              </h3>
            </div>
            
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={mockData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#71717a' }} 
                    dy={10}
                  />
                  <YAxis 
                    yAxisId="left" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#71717a' }} 
                    tickFormatter={(value) => `$${value/1000}k`}
                    dx={-10}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#71717a' }} 
                    tickFormatter={(value) => `${value}d`}
                    dx={10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(18, 17, 17, 0.95)', 
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#e4e4e7', fontWeight: 600 }}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="cash" 
                    name="Cash Collected"
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCash)" 
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="velocity" 
                    name="Avg Velocity"
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVelocity)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* New Horizontal Bar Chart */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChartIcon className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Volume by Pipeline Stage
              </h3>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stageData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false}/>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={(val) => `$${val/1000}k`}/>
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} width={80}/>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(18, 17, 17, 0.95)', 
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#e4e4e7', fontWeight: 600 }}
                  />
                  <Bar dataKey="volume" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </div>
  );
}
