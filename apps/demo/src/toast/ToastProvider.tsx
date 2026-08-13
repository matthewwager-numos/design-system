import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Alert } from "@numosai/ui";
import type { AlertStatus } from "@numosai/ui";

interface Toast {
  id: number;
  status: AlertStatus;
  title: ReactNode;
  description?: ReactNode;
}

type ShowToast = (toast: { status: AlertStatus; title: ReactNode; description?: ReactNode }) => void;

const ToastContext = createContext<ShowToast | null>(null);

/**
 * Wraps the app to provide `useToast()` — a stack of `<Alert>` toasts (the
 * design system's own portaled, self-dismissing status notification, built
 * on `<Banner>`) surfaced for CRUD events across the demo, rather than a
 * new notification component of its own.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback<ShowToast>((toast) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { ...toast, id }]);
  }, []);

  function dismiss(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          status={toast.status}
          title={toast.title}
          description={toast.description}
          autoDismissDelay={4000}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast must be used within a ToastProvider");
  return showToast;
}
