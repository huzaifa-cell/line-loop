"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextState {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextState | null>(null);
let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-md shadow-xl border backdrop-blur-md ${
                t.type === "error"
                  ? "bg-brand-red/95 text-white border-brand-red"
                  : t.type === "success"
                  ? "bg-espresso/95 text-ivory border-espresso"
                  : "bg-mocha/95 text-ivory border-mocha"
              }`}
            >
              <span className="material-symbols-outlined text-[20px] mt-0.5 shrink-0">
                {t.type === "error"
                  ? "error"
                  : t.type === "success"
                  ? "check_circle"
                  : "info"}
              </span>
              <p className="font-body-md text-sm leading-relaxed flex-1">
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Dismiss"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
