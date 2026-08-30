"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "./Button";
import { LuxurySpinner } from "@/components/brand/LuxuryLoader";

export function Modal({ open, onClose, title, description, children, className, size = "md" }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button type="button" className="absolute inset-0 bg-slate-950/50" aria-label="Close dialog" onClick={onClose} />
      <div className={cn("relative z-10 w-full rounded-2xl border border-[#d5e3df] bg-cream shadow-xl dark:border-nexus-700 dark:bg-nexus-900", sizes[size], className)}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-secondary">{description}</p> : null}
          </div>
          <IconButton label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-lg border border-slate-200 px-4 text-sm dark:border-slate-600"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-white disabled:opacity-60",
            danger ? "bg-danger hover:bg-red-800" : "bg-nexus-600 hover:bg-nexus-700"
          )}
        >
          {loading ? (
            <>
              <LuxurySpinner size={14} />
              Working...
            </>
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </Modal>
  );
}

export function Drawer({ open, onClose, title, children, side = "right" }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-slate-950/50" aria-label="Close drawer" onClick={onClose} />
      <div
        className={cn(
          "absolute top-0 h-full w-full max-w-md overflow-y-auto border-[#d5e3df] bg-cream shadow-xl dark:border-nexus-700 dark:bg-nexus-900",
          side === "right" ? "right-0 border-l" : "left-0 border-r"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 className="text-base font-semibold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
