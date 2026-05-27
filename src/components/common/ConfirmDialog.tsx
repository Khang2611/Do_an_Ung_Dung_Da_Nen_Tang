import React from "react";
import { AlertCircle, AlertTriangle, HelpCircle, X } from "lucide-react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "danger";
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "info",
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const iconMap = {
    info: <HelpCircle className="h-6 w-6 text-blue-600" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    danger: <AlertCircle className="h-6 w-6 text-rose-600" />,
  };

  const bgIconMap = {
    info: "bg-blue-50",
    warning: "bg-amber-50",
    danger: "bg-rose-50",
  };

  const buttonVariantMap = {
    info: "primary" as const,
    warning: "primary" as const, // We can style further if needed
    danger: "danger" as const,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onCancel} />
      
      {/* Container */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          disabled={isLoading}
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="flex gap-4">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${bgIconMap[type]}`}>
            {iconMap[type]}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>
            {children}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={buttonVariantMap[type]} onClick={onConfirm} loading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
