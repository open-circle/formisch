import { batch, createSignal } from '@formisch/core/honox';
import { fireEvent, screen } from '@testing-library/dom';
import { useState } from 'hono/jsx';
import { flushSync } from 'hono/jsx/dom';
import type { JSX } from 'hono/jsx/jsx-runtime';
import { describe, expect, test } from 'vitest';
import { renderHono } from '../../vitest/render.tsx';
import { useSignals } from './useSignals.ts';

// Note: React additionally covers a `<StrictMode>` test, because its dev mode
// mounts, unmounts and re-mounts a component so the subscription cleanup has to
// survive that cycle. hono/jsx aliases `StrictMode` to a fragment and never
// re-runs effects on mount, so there is no such cycle to cover here.
describe('useSignals', () => {
  describe('signal subscription', () => {
    test('should re-render the component when a tracked signal changes', () => {
      const signal = createSignal(0);

      function TrackedComponent(): JSX.Element {
        useSignals();
        return <span data-testid="value">{signal.value}</span>;
      }

      renderHono(<TrackedComponent />);
      expect(screen.getByTestId('value')).toHaveTextContent('0');

      flushSync(() => {
        signal.value = 5;
      });

      expect(screen.getByTestId('value')).toHaveTextContent('5');
    });

    test('should not re-render the component for signals that were not read', () => {
      const tracked = createSignal('a');
      const untracked = createSignal('x');
      let renderCount = 0;

      function PartialTrackComponent(): JSX.Element {
        useSignals();
        renderCount++;
        return <span data-testid="value">{tracked.value}</span>;
      }

      renderHono(<PartialTrackComponent />);
      const initialRenderCount = renderCount;

      flushSync(() => {
        untracked.value = 'y';
      });

      expect(renderCount).toBe(initialRenderCount);
    });

    test('should re-render once per batched signal update cycle', () => {
      const signalA = createSignal(0);
      const signalB = createSignal(0);
      let renderCount = 0;

      function BatchedComponent(): JSX.Element {
        useSignals();
        renderCount++;
        return <span data-testid="sum">{signalA.value + signalB.value}</span>;
      }

      renderHono(<BatchedComponent />);
      const initialRenderCount = renderCount;

      flushSync(() => {
        batch(() => {
          signalA.value = 1;
          signalB.value = 2;
        });
      });

      expect(screen.getByTestId('sum')).toHaveTextContent('3');
      // Both signals share a single subscriber, so a single notification fires
      expect(renderCount - initialRenderCount).toBe(1);
    });
  });

  describe('cleanup', () => {
    test('should not re-render after unmount when a tracked signal changes', () => {
      const signal = createSignal('initial');
      let renderCount = 0;

      function TrackedComponent(): JSX.Element {
        useSignals();
        renderCount++;
        return <span data-testid="value">{signal.value}</span>;
      }

      const { unmount } = renderHono(<TrackedComponent />);
      const renderCountBeforeUnmount = renderCount;

      unmount();

      flushSync(() => {
        signal.value = 'after-unmount';
      });

      expect(renderCount).toBe(renderCountBeforeUnmount);
    });
  });

  describe('multiple components', () => {
    test('should only re-render components that read the changed signal', () => {
      const signalA = createSignal(0);
      const signalB = createSignal(0);
      let renderCountA = 0;
      let renderCountB = 0;

      function CounterA(): JSX.Element {
        useSignals();
        renderCountA++;
        return <span data-testid="a">{signalA.value}</span>;
      }

      function CounterB(): JSX.Element {
        useSignals();
        renderCountB++;
        return <span data-testid="b">{signalB.value}</span>;
      }

      renderHono(
        <>
          <CounterA />
          <CounterB />
        </>
      );

      const initialA = renderCountA;
      const initialB = renderCountB;

      flushSync(() => {
        signalA.value = 1;
      });

      expect(screen.getByTestId('a')).toHaveTextContent('1');
      expect(screen.getByTestId('b')).toHaveTextContent('0');
      expect(renderCountA - initialA).toBe(1);
      expect(renderCountB).toBe(initialB);
    });
  });

  describe('coexistence with component state', () => {
    test('should update signals and useState independently in the same component', () => {
      const signal = createSignal('signal-initial');

      function StateComponent(): JSX.Element {
        useSignals();
        const [count, setCount] = useState(0);
        return (
          <div>
            <span data-testid="count">{count}</span>
            <span data-testid="signal">{signal.value}</span>
            <button onClick={() => setCount((c) => c + 1)}>Increment</button>
          </div>
        );
      }

      renderHono(<StateComponent />);
      const count = screen.getByTestId('count');
      const signalText = screen.getByTestId('signal');
      expect(count).toHaveTextContent('0');
      expect(signalText).toHaveTextContent('signal-initial');

      flushSync(() => {
        fireEvent.click(screen.getByText('Increment'));
      });
      expect(count).toHaveTextContent('1');
      expect(signalText).toHaveTextContent('signal-initial');

      flushSync(() => {
        signal.value = 'signal-updated';
      });
      expect(count).toHaveTextContent('1');
      expect(signalText).toHaveTextContent('signal-updated');
    });
  });
});
