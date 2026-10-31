import { type Listener, setListener } from '@formisch/core/react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

/**
 * Hook to enable reactive signals within a React component.
 */
export function useSignals(): void {
  // Create a force update function to trigger re-renders
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Create listener tuple for current component
  const listener = useMemo<Listener>(() => [forceUpdate, new Set()], []);

  // Create cleanup function to remove listener from subscribers
  const cleanSubscribers = useCallback(() => {
    for (const subscriber of listener[1]) {
      subscriber.delete(listener);
    }
  }, [listener]);

  // Clean previously registered subscribers
  cleanSubscribers();

  // Set listener for tracking signals
  setListener(listener);

  // Clear listener directly after render
  useLayoutEffect(() => setListener(undefined));

  // Cleanup registered subscribers when effects are destroyed and restore
  // them when effects are re-created
  //
  // Hint: React may destroy and re-create effects without re-rendering the
  // component, e.g. when `<StrictMode>` re-runs effects in dev mode or when
  // `<Activity>` hides and reveals its children. Since subscriptions are only
  // registered during render, a re-render is forced to restore them.
  const unsubscribed = useRef(false);
  useEffect(() => {
    if (unsubscribed.current) {
      unsubscribed.current = false;
      forceUpdate();
    }
    return () => {
      unsubscribed.current = true;
      cleanSubscribers();
    };
  }, [cleanSubscribers]);
}
