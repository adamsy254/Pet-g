import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  isDestructive = true,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDestructive ? "bg-rose-50 text-rose-600" : "bg-teal-50 text-teal-600"
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-4 text-xs text-stone-600 leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
