'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toaster, toast as hotToast } from 'react-hot-toast';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    resolve: null,
  });

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        resolve,
      });
    });
  }, []);

  const handleConfirm = (value) => {
    if (confirmState.resolve) {
      confirmState.resolve(value);
    }
    setConfirmState({ isOpen: false, message: '', resolve: null });
  };

  const toast = {
    success: (msg) => hotToast.success(msg),
    error: (msg) => hotToast.error(msg),
    loading: (msg) => hotToast.loading(msg),
    dismiss: (id) => hotToast.dismiss(id),
  };

  return (
    <UIContext.Provider value={{ showConfirm, toast }}>
      {children}
      <Toaster position="top-right" />

      {/* Modern Custom Confirm Modal */}
      {confirmState.isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', maxWidth: '24rem', width: '100%', padding: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem 0' }}>Confirmation</h3>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0 0 1.5rem 0' }}>{confirmState.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => handleConfirm(false)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirm(true)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, color: '#fff', backgroundColor: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
