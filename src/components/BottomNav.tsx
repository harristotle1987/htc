import React from 'react';
import { ViewType } from './Sidebar';
import { LayoutDashboard, Users, Shield, Settings, User, Calendar, Headset } from 'lucide-react';

interface BottomNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isAdmin?: boolean;
}

export default function BottomNav({ currentView, onViewChange, isAdmin }: BottomNavProps) {
  const items = [
    { id: 'pipeline', label: 'Pipeline', icon: <LayoutDashboard size={20} /> },
    { id: 'contacts', label: 'Contacts', icon: <Users size={20} /> },
    { id: 'scheduling', label: 'Scheduling', icon: <Calendar size={20} /> },
    { id: 'security', label: 'Security', icon: <Shield size={20} /> },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: <Settings size={20} /> }] : []),
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'support', label: 'Support', icon: <Headset size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden h-16 bg-[#121111]/90 backdrop-blur-md border-t border-amber-900/10 px-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id as ViewType)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${currentView === item.id ? 'text-amber-500' : 'text-zinc-500'}`}
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
