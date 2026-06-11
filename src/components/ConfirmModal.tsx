import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  x?: number;
  y?: number;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
  x,
  y
}: ConfirmModalProps) {
  const [modalStyle, setModalStyle] = useState<React.CSSProperties>({});
  const [animateProps, setAnimateProps] = useState<any>({
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  });

  useEffect(() => {
    if (isOpen) {
      if (typeof x !== 'undefined' && typeof y !== 'undefined') {
        const topSpace = y;
        // Flip if too close to the top
        const flip = topSpace < 250;
        
        // Clamp x to prevent horizontal overflow
        const maxLeft = typeof window !== 'undefined' ? window.innerWidth - 200 - 16 : 0;
        const minLeft = 200 + 16;
        let clampedX = x;
        if (typeof window !== 'undefined') {
            clampedX = Math.max(minLeft, Math.min(x, maxLeft));
        }

        setModalStyle({
          position: 'fixed' as const,
          left: `${clampedX}px`,
          top: `${y}px`,
        });
        
        setAnimateProps({
          initial: { opacity: 0, scale: 0.9, x: '-50%', y: flip ? '20%' : '-100%' },
          animate: { opacity: 1, scale: 1, x: '-50%', y: flip ? '20px' : '-120%' },
          exit: { opacity: 0, scale: 0.9, x: '-50%', y: flip ? '20%' : '-100%' },
        });

      } else {
        setModalStyle({
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
        });
        
        setAnimateProps({
          initial: { opacity: 0, scale: 0.9, x: '-50%', y: '-40%' },
          animate: { opacity: 1, scale: 1, x: '-50%', y: '-50%' },
          exit: { opacity: 0, scale: 0.9, x: '-50%', y: '-40%' },
        });
      }
    }
  }, [isOpen, x, y]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <motion.div
            initial={animateProps.initial}
            animate={animateProps.animate}
            exit={animateProps.exit}
            style={modalStyle}
            className="bg-card w-[calc(100vw-32px)] sm:w-[400px] rounded-2xl shadow-2xl border border-border overflow-hidden pointer-events-auto filter drop-shadow-2xl"
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold mb-1">{title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3 justify-end border-t border-border/50 pt-4">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="px-6 py-2 text-sm uppercase tracking-widest bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
