import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface FeedbackContextValue {
  toast: (message: string, kind?: ToastKind) => void;
  confirmDialog: (opts: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export const useFeedback = (): FeedbackContextValue => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback debe usarse dentro de <FeedbackProvider>');
  return ctx;
};

const toastStyles: Record<ToastKind, { icon: React.ElementType; accent: string }> = {
  success: { icon: CheckCircle2, accent: 'text-emerald-600' },
  error: { icon: AlertTriangle, accent: 'text-red-600' },
  info: { icon: Info, accent: 'text-stone-500' },
};

let nextToastId = 1;

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const confirmResolver = useRef<((value: boolean) => void) | null>(null);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = nextToastId++;
    setToasts(prev => [...prev, { id, kind, message }]);
    setTimeout(() => dismissToast(id), 5000);
  }, [dismissToast]);

  const confirmDialog = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      // Si hubiera un diálogo pendiente, lo resolvemos como cancelado
      confirmResolver.current?.(false);
      confirmResolver.current = resolve;
      setConfirmState(opts);
    });
  }, []);

  const settleConfirm = (value: boolean) => {
    confirmResolver.current?.(value);
    confirmResolver.current = null;
    setConfirmState(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirmDialog }}>
      {children}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const { icon: Icon, accent } = toastStyles[t.kind];
          return (
            <div
              key={t.id}
              className="pointer-events-auto bg-white border border-stone-200 rounded-xl shadow-lg p-4 flex items-start gap-3 animate-fade-in"
              role="status"
            >
              <Icon size={18} className={`${accent} shrink-0 mt-0.5`} />
              <p className="text-sm text-stone-700 whitespace-pre-line flex-1">{t.message}</p>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-stone-400 hover:text-stone-600 shrink-0"
                aria-label="Cerrar aviso"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal de confirmación */}
      {confirmState && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => settleConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-stone-200 max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="text-lg font-serif font-bold text-stone-800 mb-2">{confirmState.title}</h3>
            <p className="text-sm text-stone-600 whitespace-pre-line mb-6">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => settleConfirm(false)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors"
                autoFocus
              >
                {confirmState.cancelLabel || 'Cancelar'}
              </button>
              <button
                onClick={() => settleConfirm(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium text-white transition-colors ${confirmState.danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-stone-700 hover:bg-stone-800'
                  }`}
              >
                {confirmState.confirmLabel || 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
};
