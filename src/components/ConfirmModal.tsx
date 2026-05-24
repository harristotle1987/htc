import React from 'react';
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
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
