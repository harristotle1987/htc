import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

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
  const modalRef = React.useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Dismiss on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onCancel();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onCancel]);

  // Close on route change
  const prevPathname = React.useRef(pathname);
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      if (isOpen) onCancel();
    }
    prevPathname.current = pathname;
  }, [pathname, isOpen, onCancel]);

  useEffect(() => {
    if (isOpen && typeof x !== 'undefined' && typeof y !== 'undefined') {
      const modalWidth = 256; // w-64 is 256px
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Clamp coordinates to keep within viewport
      let finalX = Math.max(16, Math.min(x, viewportWidth - modalWidth - 16));
      let finalY = Math.max(16, Math.min(y, viewportHeight - 200 - 16)); // 200 is approx height

      setModalStyle({
        position: 'fixed' as const,
        left: `${finalX}px`,
        top: `${finalY}px`,
        width: `${modalWidth}px`,
      });
    } else if (isOpen) {
      // Centered fallback
      setModalStyle({
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '256px',
      });
    }
  }, [isOpen, x, y]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]" onClick={(e) => e.stopPropagation()}>
          {/* Backdrop for click-outside dismissal */}
          <div className="fixed inset-0 bg-black/20 z-0" onClick={onCancel} />
          
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={modalStyle}
            className="z-10 bg-card w-full max-w-[280px] p-4 rounded-xl shadow-2xl border border-border overflow-hidden pointer-events-auto"
          >
            <h2 className="text-sm font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground text-xs leading-relaxed mb-4">{message}</p>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={onCancel}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow-lg"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
