import { useSyncExternalStore } from 'react';

// Store mínimo para abrir/cerrar el popup de lista de espera desde cualquier botón.
let open = false;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export function openWaitlist() {
  open = true;
  emit();
  if (typeof window !== 'undefined' && typeof window.hj === 'function') {
    window.hj('event', 'waitlist_open');
  }
}

export function closeWaitlist() {
  open = false;
  emit();
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useWaitlistOpen() {
  return useSyncExternalStore(subscribe, () => open, () => open);
}
