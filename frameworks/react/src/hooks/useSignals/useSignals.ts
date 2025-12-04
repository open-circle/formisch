import { type Listener, setListener } from '@formisch/core/vanilla';
import { useLayoutEffect, useMemo, useState } from 'react';

/**
 * Hook to enable reactive signals within a React component.
 */
export function useSignals(): void {
  // Create a state to trigger re-renders
  const [, setTick] = useState({});

  // Create listener for current component
  const listener = useMemo<Listener>(
    () => [() => setTick({}), new Set<Set<Listener>>()],
    []
  );

  // Remove listener from subscribers
  for (const subscriber of listener[1]) {
    subscriber.delete(listener);
  }

  // Set listener for tracking signals
  setListener(listener);

  // Clear listener directly after render
  useLayoutEffect(() => setListener(undefined));
}
