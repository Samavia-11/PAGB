'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { replaceGlobalAlert } from '@/utils/notifications';

export type ConfirmDialogOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ConfirmFn = (options: ConfirmDialogOptions) => Promise<boolean>;

type DialogState = {
  open: boolean;
  options: ConfirmDialogOptions | null;
};

const ConfirmDialogContext = createContext<ConfirmFn | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const [state, setState] = useState<DialogState>({ open: false, options: null });

  useEffect(() => {
    replaceGlobalAlert();
  }, []);

  const close = useCallback((value: boolean) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setState({ open: false, options: null });
    resolver?.(value);
  }, []);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ open: true, options });
    });
  }, []);

  useEffect(() => {
    if (!state.open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close, state.open]);

  const value = useMemo(() => confirm, [confirm]);
  const options = state.options;

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      {state.open && options ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/50"
            onClick={() => close(false)}
          />
          <div className="relative w-full max-w-md rounded-lg bg-white shadow-lg border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <div className="text-lg font-semibold text-gray-900">{options.title}</div>
              {options.message ? (
                <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{options.message}</div>
              ) : null}
            </div>
            <div className="p-5 flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => close(false)}
              >
                {options.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-white ${options.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={() => close(true)}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }
  return ctx;
}
