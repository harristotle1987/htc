import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

let addToast: (message: string) => void = () => {};

export function useToast() {
  return addToast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<string[]>([]);

  addToast = (message: string) => {
    setToasts(prev => [...prev, message]);
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3000);
  };

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg"
            >
              {t}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
