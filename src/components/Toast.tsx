import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastData {
  id: number;
  message: string;
}

let addToast: (message: string) => void = () => {};

export function showToast(message: string) {
  addToast(message);
}

export function useToast() {
  return addToast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  addToast = (message: string) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  };

  return (
    <>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none items-center">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-2xl font-bold text-sm pointer-events-auto flex items-center justify-center whitespace-nowrap"
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
