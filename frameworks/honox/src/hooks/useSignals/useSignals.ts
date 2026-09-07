import { type Listener, setListener } from '@formisch/core/honox';
import { useCallback, useLayoutEffect, useMemo, useReducer } from 'hono/jsx';

/**
 * Hook to enable reactive signals within a hono/jsx component.
 */
export function useSignals(): void {
  // Create a force update function to trigger re-renders
  //
  // Hint: Unlike React, hono/jsx's `useReducer` has no special zero-argument
  // dispatch overload for single-parameter reducers, so the dispatch function
  // is wrapped to match the zero-argument `Listener` execute function shape.
  const [, dispatch] = useReducer((count: number) => count + 1, 0);
  const forceUpdate = useCallback((): void => {
    dispatch(undefined);
  }, [dispatch]);

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

  // Cleanup registered subscribers on unmount
  //
  // Hint: Unlike React, hono/jsx defers `useEffect` callbacks to the next
  // animation frame, so a component that unmounts before that frame would
  // never have registered its cleanup and would keep being notified about
  // signal updates. A layout effect is committed synchronously instead.
  // hono/jsx also aliases `<StrictMode>` to a fragment and never re-runs
  // effects on mount, so no timeout is needed to survive a second mount.
  useLayoutEffect(() => () => cleanSubscribers(), [cleanSubscribers]);
}
