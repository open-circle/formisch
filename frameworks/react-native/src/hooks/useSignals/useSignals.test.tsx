import { batch, createSignal } from '@formisch/core/react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  Activity,
  type ReactElement,
  startTransition,
  StrictMode,
  useState,
} from 'react';
import { Pressable, Text } from 'react-native';
import { describe, expect, test, vi } from 'vitest';
import { useSignals } from './useSignals.ts';

describe('useSignals', () => {
  describe('signal subscription', () => {
    test('should re-render the component when a tracked signal changes', () => {
      const signal = createSignal(0);

      function TrackedComponent(): ReactElement {
        useSignals();
        return <Text testID="value">{signal.value}</Text>;
      }

      render(<TrackedComponent />);
      expect(screen.getByTestId('value')).toHaveTextContent('0');

      act(() => {
        signal.value = 5;
      });

      expect(screen.getByTestId('value')).toHaveTextContent('5');
    });

    test('should not re-render the component for signals that were not read', () => {
      const tracked = createSignal('a');
      const untracked = createSignal('x');
      let renderCount = 0;

      function PartialTrackComponent(): ReactElement {
        useSignals();
        renderCount++;
        return <Text testID="value">{tracked.value}</Text>;
      }

      render(<PartialTrackComponent />);
      const initialRenderCount = renderCount;

      act(() => {
        untracked.value = 'y';
      });

      expect(renderCount).toBe(initialRenderCount);
    });

    test('should re-render once per batched signal update cycle', () => {
      const signalA = createSignal(0);
      const signalB = createSignal(0);
      let renderCount = 0;

      function BatchedComponent(): ReactElement {
        useSignals();
        renderCount++;
        return <Text testID="sum">{signalA.value + signalB.value}</Text>;
      }

      render(<BatchedComponent />);
      const initialRenderCount = renderCount;

      act(() => {
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

      function TrackedComponent(): ReactElement {
        useSignals();
        renderCount++;
        return <Text testID="value">{signal.value}</Text>;
      }

      const { unmount } = render(<TrackedComponent />);
      const renderCountBeforeUnmount = renderCount;

      unmount();

      signal.value = 'after-unmount';

      expect(renderCount).toBe(renderCountBeforeUnmount);
    });

    test('should keep subscriptions alive across StrictMode effect re-runs', () => {
      const signal = createSignal(0);

      function TrackedComponent(): ReactElement {
        useSignals();
        return <Text testID="value">{signal.value}</Text>;
      }

      // StrictMode mounts → unmounts → re-mounts the component in dev mode,
      // which removes and then restores the signal subscriptions. The signal
      // subscription must survive that cycle.
      render(
        <StrictMode>
          <TrackedComponent />
        </StrictMode>
      );

      act(() => {
        signal.value = 7;
      });

      expect(screen.getByTestId('value')).toHaveTextContent('7');
    });

    describe.each([
      ['without StrictMode', false],
      ['with StrictMode', true],
    ])('Activity hide and reveal %s', (_, strict) => {
      test('should restore subscriptions after the component is revealed', () => {
        vi.useFakeTimers();
        try {
          const signal = createSignal('initial');

          function TrackedComponent(): ReactElement {
            useSignals();
            return <Text testID="value">{signal.value}</Text>;
          }

          // Hint: The child element identity is preserved so that revealing
          // the component re-creates its effects without re-rendering it.
          const child = <TrackedComponent />;
          let setVisible!: (visible: boolean) => void;

          function App(): ReactElement {
            const [visible, _setVisible] = useState(true);
            setVisible = _setVisible;
            return (
              <Activity mode={visible ? 'visible' : 'hidden'}>{child}</Activity>
            );
          }

          render(
            strict ? (
              <StrictMode>
                <App />
              </StrictMode>
            ) : (
              <App />
            )
          );

          act(() => {
            setVisible(false);
          });
          act(() => {
            vi.runAllTimers();
          });

          // Signal changes while hidden must be picked up on reveal
          signal.value = 'while-hidden';

          act(() => {
            setVisible(true);
          });
          act(() => {
            vi.runAllTimers();
          });

          expect(screen.getByTestId('value')).toHaveTextContent('while-hidden');

          act(() => {
            signal.value = 'after-reveal';
          });

          expect(screen.getByTestId('value')).toHaveTextContent('after-reveal');
        } finally {
          vi.useRealTimers();
        }
      });
    });

    test('should show current signal values before paint after Activity reveal', async () => {
      const signal = createSignal('initial');

      function TrackedComponent(): ReactElement {
        useSignals();
        return <Text testID="value">{signal.value}</Text>;
      }

      const child = <TrackedComponent />;
      let setVisible!: (visible: boolean) => void;

      function App(): ReactElement {
        const [visible, _setVisible] = useState(true);
        setVisible = _setVisible;
        return (
          <Activity mode={visible ? 'visible' : 'hidden'}>{child}</Activity>
        );
      }

      render(<App />);

      act(() => {
        setVisible(false);
      });

      signal.value = 'while-hidden';

      // Hint: The reveal runs outside of `act` so that React schedules its
      // work like in a browser. The mutation observer callback runs as a
      // microtask right after the task that committed the reveal, i.e. before
      // the browser could paint, and captures the first visible content.
      const element = screen.getByTestId('value');
      const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
      const isActEnvironment = globals.IS_REACT_ACT_ENVIRONMENT;
      globals.IS_REACT_ACT_ENVIRONMENT = false;
      try {
        const firstVisibleContent = await new Promise<string | null>(
          (resolve) => {
            const observer = new MutationObserver(() => {
              if (element.style.display !== 'none') {
                observer.disconnect();
                resolve(element.textContent);
              }
            });
            observer.observe(element, { attributes: true });
            startTransition(() => {
              setVisible(true);
            });
          }
        );

        expect(firstVisibleContent).toBe('while-hidden');
      } finally {
        globals.IS_REACT_ACT_ENVIRONMENT = isActEnvironment;
      }
    });
  });

  describe('multiple components', () => {
    test('should only re-render components that read the changed signal', () => {
      const signalA = createSignal(0);
      const signalB = createSignal(0);
      let renderCountA = 0;
      let renderCountB = 0;

      function CounterA(): ReactElement {
        useSignals();
        renderCountA++;
        return <Text testID="a">{signalA.value}</Text>;
      }

      function CounterB(): ReactElement {
        useSignals();
        renderCountB++;
        return <Text testID="b">{signalB.value}</Text>;
      }

      render(
        <>
          <CounterA />
          <CounterB />
        </>
      );

      const initialA = renderCountA;
      const initialB = renderCountB;

      act(() => {
        signalA.value = 1;
      });

      expect(screen.getByTestId('a')).toHaveTextContent('1');
      expect(screen.getByTestId('b')).toHaveTextContent('0');
      expect(renderCountA - initialA).toBe(1);
      expect(renderCountB).toBe(initialB);
    });
  });

  describe('coexistence with React state', () => {
    test('should update signals and useState independently in the same component', () => {
      const signal = createSignal('signal-initial');

      function StateComponent(): ReactElement {
        useSignals();
        const [count, setCount] = useState(0);
        return (
          <>
            <Text testID="count">{count}</Text>
            <Text testID="signal">{signal.value}</Text>
            <Pressable onPress={() => setCount((c) => c + 1)}>
              <Text>Increment</Text>
            </Pressable>
          </>
        );
      }

      render(<StateComponent />);
      const count = screen.getByTestId('count');
      const signalText = screen.getByTestId('signal');
      expect(count).toHaveTextContent('0');
      expect(signalText).toHaveTextContent('signal-initial');

      act(() => {
        fireEvent.click(screen.getByText('Increment'));
      });
      expect(count).toHaveTextContent('1');
      expect(signalText).toHaveTextContent('signal-initial');

      act(() => {
        signal.value = 'signal-updated';
      });
      expect(count).toHaveTextContent('1');
      expect(signalText).toHaveTextContent('signal-updated');
    });
  });
});
