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
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  addToast = (message: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const id = Date.now() + Math.random();
    const newToast = { id, message };
    setToasts([newToast]);
    
    timeoutRef.current = setTimeout(() => {
      setToasts([]);
    }, 2500);
  };

  return (
    <>
      {children}
      <div 
        className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none flex justify-center pt-6 overflow-hidden"
        onClick={() => setToasts([])}
      >
        <div className="pointer-events-auto flex flex-col gap-2 items-center" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg font-bold text-xs flex items-center justify-center whitespace-nowrap border border-primary-foreground/10"
              >
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
