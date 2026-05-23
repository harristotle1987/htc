import React from 'react';
import { Target, LayoutDashboard, Users, Shield, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

export type ViewType = 'pipeline' | 'contacts' | 'security' | 'admin';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const scrollToTop = () => {
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: main.scrollHeight, behavior: 'smooth' });
  };

  return (
    <aside className="w-16 md:w-64 bg-card/80 backdrop-blur-3xl border-r border-border h-full flex flex-col transition-all duration-300 z-10 shrink-0 relative shadow-[1px_0_24px_rgba(0,0,0,0.1)]">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 blur-[50px] pointer-events-none rounded-full -translate-y-1/2"></div>
      
      <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-border relative z-10">
        <div className="p-2 bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-lg shadow-inner">
          <Target className="w-5 h-5 text-primary shrink-0" />
        </div>
        <span className="ml-3 font-display font-bold tracking-tight hidden md:block text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted">Aegis Vault</span>
      </div>
      
      <nav className="flex-1 py-6 flex flex-col gap-2 px-3 relative z-10 overflow-y-auto custom-scrollbar">
        <NavItem 
          id="pipeline"
          icon={<LayoutDashboard size={18} />} 
          label="Pipeline" 
          active={currentView === 'pipeline'} 
          onClick={() => onViewChange('pipeline')} 
        />
        <NavItem 
          id="contacts"
          icon={<Users size={18} />} 
          label="Contacts" 
          active={currentView === 'contacts'} 
          onClick={() => onViewChange('contacts')} 
        />
        <NavItem 
          id="security"
          icon={<Shield size={18} />} 
          label="Security" 
          active={currentView === 'security'} 
          onClick={() => onViewChange('security')} 
        />
        <NavItem 
          id="admin"
          icon={<Settings size={18} />} 
          label="Admin" 
          active={currentView === 'admin'} 
          onClick={() => onViewChange('admin')} 
        />
        
        <div className="md:hidden flex flex-col gap-2 pt-4 border-t border-primary/5 mt-4">
          <button onClick={scrollToTop} className="p-3 rounded-xl text-muted hover:text-primary transition-colors flex justify-center">
            <ChevronUp size={18} />
          </button>
          <button onClick={scrollToBottom} className="p-3 rounded-xl text-muted hover:text-primary transition-colors flex justify-center">
            <ChevronDown size={18} />
          </button>
        </div>
      </nav>
      
      <div className="p-4 border-t border-border mt-auto relative z-10 flex flex-col gap-1">
        <div className="hidden md:flex flex-col gap-1 mb-2">
          <button 
            onClick={scrollToTop}
            className="w-full flex items-center p-3 rounded-xl transition-colors group text-muted hover:text-primary hover:bg-primary/5"
            title="Scroll to Top"
          >
            <ChevronUp size={18} className="shrink-0" />
            <span className="ml-3 text-xs font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100">Scroll Top</span>
          </button>
          <button 
            onClick={scrollToBottom}
            className="w-full flex items-center p-3 rounded-xl transition-colors group text-muted hover:text-primary hover:bg-primary/5"
            title="Scroll to Bottom"
          >
            <ChevronDown size={18} className="shrink-0" />
            <span className="ml-3 text-xs font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100">Scroll Bottom</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ id, icon, label, active, onClick }: { id: string, icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`relative w-full flex items-center justify-center md:justify-start p-3 rounded-xl transition-colors group z-10`}
    >
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
          initial={false}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <div className={`relative z-10 flex items-center justify-center ${active ? 'text-primary' : 'text-muted group-hover:text-foreground'}`}>
        {icon}
      </div>
      <span className={`relative z-10 hidden md:block ml-3 text-sm font-semibold transition-colors ${active ? 'text-primary' : 'text-muted group-hover:text-foreground'}`}>
        {label}
      </span>
    </button>
  );
}
