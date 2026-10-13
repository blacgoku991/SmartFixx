"use client";
import type { CSSProperties, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
/* États partagés par le formulaire et le panel : taille réservée, aria-busy, role=status ou alert. */
export function StateLoading({ rows = 3, label = "Chargement…", rowHeight = 44 }: { rows?: number; label?: string; rowHeight?: number }) {
  return (
    <div className="sx-state" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="sx-skeletons" aria-hidden="true">{Array.from({ length: rows }, (_, i) => <span key={i} className="sx-skeleton" style={{ "--sx-skeleton-h": `${rowHeight}px` } as CSSProperties} />)}</div>
    </div>
  );
}
export function StateEmpty({ title, text, action }: { title: string; text?: ReactNode; action?: ReactNode }) {
  return (
    <div className="sx-state" role="status">
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
      {action}
    </div>
  );
}
export function StateError({ message, onRetry, retryLabel = "Réessayer" }: { message: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="sx-state sx-state--error" role="alert">
      <p className="sx-state-title"><AlertCircle size={18} aria-hidden="true" />{message}</p>
      {onRetry ? <button type="button" className="sx-retry" onClick={onRetry}><RotateCcw size={16} aria-hidden="true" />{retryLabel}</button> : null}
    </div>
  );
}
