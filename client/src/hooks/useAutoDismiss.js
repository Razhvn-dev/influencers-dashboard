import { useEffect } from 'react';

export function useAutoDismiss(value, onDismiss, delayMs = 4000) {
  useEffect(() => {
    if (!value) {
      return undefined;
    }

    const timer = window.setTimeout(onDismiss, delayMs);
    return () => window.clearTimeout(timer);
  }, [value, onDismiss, delayMs]);
}
