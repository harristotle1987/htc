import React from 'react';
import { Target, LayoutDashboard, Users, Shield, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

export type ViewType = 'pipeline' | 'contacts' | 'security' | 'admin' | 'privacy' | 'terms';

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
    <aside className="hidden md:flex w-full md:w-64 bg-card/80 backdrop-blur-3xl border-t md:border-t-0 md:border-r border-border h-[4.5rem] md:h-full flex-row md:flex-col transition-all duration-300 z-40 shrink-0 relative shadow-[0_-4px_24px_rgba(0,0,0,0.1)] md:shadow-[1px_0_24px_rgba(0,0,0,0.1)]">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-0 w-full md:w-full h-1 md:h-32 bg-primary/20 md:bg-primary/5 blur-[10px] md:blur-[50px] pointer-events-none md:rounded-full md:-translate-y-1/2"></div>
      
      <div className="hidden md:flex h-16 items-center justify-center md:justify-start md:px-6 border-b border-border relative z-10 shrink-0">
        <div className="w-8 h-8 rounded-full border-2 border-primary/20 bg-gradient-to-br from-primary/20 to-transparent shadow-inner overflow-hidden shrink-0 flex items-center justify-center">
          <img src="/logo.png" alt="Aegis Vault Logo" className="w-full h-full object-cover" />
        </div>
        <span className="ml-3 font-display font-bold tracking-tight hidden md:block text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted">Aegis Vault</span>
      </div>
      
      <nav className="flex-1 py-1 px-2 md:py-6 flex flex-row md:flex-col justify-around md:justify-start gap-1 md:gap-2 md:px-3 relative z-10 overflow-x-auto md:overflow-y-auto custom-scrollbar no-scrollbar">
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
      </nav>
      
      <div className="hidden md:flex p-4 border-t border-border mt-auto relative z-10 flex-col gap-1">
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
      className={`relative w-full flex flex-col md:flex-row items-center justify-center md:justify-start p-2 md:p-3 rounded-xl transition-colors group z-10 flex-1 md:flex-none`}
    >
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute inset-x-1 inset-y-1 md:inset-0 bg-primary/10 border border-primary/20 rounded-xl"
          initial={false}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <div className={`relative z-10 flex items-center justify-center ${active ? 'text-primary' : 'text-muted group-hover:text-foreground'}`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 md:w-[18px] md:h-[18px]' })}
      </div>
      <span className={`relative z-10 mt-1 md:mt-0 md:ml-3 text-[10px] md:text-sm font-semibold transition-colors ${active ? 'text-primary' : 'text-muted group-hover:text-foreground'}`}>
        {label}
      </span>
    </button>
  );
}
