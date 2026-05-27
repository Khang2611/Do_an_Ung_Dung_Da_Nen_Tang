import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

// Global Event Dispatcher for Toast
export const showToast = (message: string, type: ToastType = "success") => {
  const event = new CustomEvent("toast:show", { detail: { message, type } });
  window.dispatchEvent(event);
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleShow = (event: Event) => {
      const { message, type } = (event as CustomEvent).detail;
      const id = `${Date.now()}-${Math.random()}`;
      
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto dismiss after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };

    window.addEventListener("toast:show", handleShow);
    return () => window.removeEventListener("toast:show", handleShow);
  }, []);

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600" />,
    info: <Info className="h-5 w-5 text-indigo-600" />,
  };

  const bgMap = {
    success: "bg-emerald-50 border-emerald-100",
    error: "bg-rose-50 border-rose-100",
    info: "bg-indigo-50 border-indigo-100",
  };

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2.5 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur transition-all duration-300 animate-slide-in ${bgMap[toast.type]}`}
        >
          <div className="shrink-0">{iconMap[toast.type]}</div>
          <div className="flex-1 text-sm font-semibold text-slate-800 leading-snug">
            {toast.message}
          </div>
          <button
            onClick={() => remove(toast.id)}
            className="shrink-0 rounded-lg p-0.5 text-slate-400 hover:bg-white/50 hover:text-slate-700 transition"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// Add animation stylesheet locally via inject
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes slideIn {
      from {
        transform: translateY(-1rem);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `;
  document.head.appendChild(style);
}
