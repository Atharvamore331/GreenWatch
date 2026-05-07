// Simple Pub/Sub event emitter for toast notifications
const listeners = new Set();

export const toast = {
  success: (message) => notify({ message, type: 'success' }),
  error: (message) => notify({ message, type: 'error' }),
  info: (message) => notify({ message, type: 'info' })
};

function notify(toastData) {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  listeners.forEach(listener => listener({ id, ...toastData }));
}

export function subscribeToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
