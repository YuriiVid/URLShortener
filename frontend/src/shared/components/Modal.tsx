import React, { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children?: ReactNode;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  hideFooter?: boolean;
  closeOnOverlayClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  hideFooter = false,
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50"
      onMouseDown={(e) => {
        if (!closeOnOverlayClick) return;
        if (e.target === e.currentTarget) onCancel();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button onClick={onCancel} className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded" aria-label="Close">
          <X size={20} className="text-gray-500" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>

        {message && !children && <p className="text-gray-700 mb-6">{message}</p>}
        {children && <div className="mb-6">{children}</div>}

        {!hideFooter && (
          <div className="flex justify-end space-x-3">
            <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              {cancelLabel}
            </button>
            <button onClick={onConfirm} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              {confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.getElementById("modal-root")!
  );
};
