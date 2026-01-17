import { render, screen, waitFor } from '@testing-library/react';
import { type ReactElement, useEffect, useState } from 'react';
import { describe, expect, test } from 'vitest';
import { useSignals } from './useSignals.ts';

describe('useSignals', () => {
  describe('basic functionality', () => {
    function TestComponent(): ReactElement {
      useSignals();
      const [count, setCount] = useState(0);

      return (
        <div>
          <span data-testid="count">{count}</span>
          <button onClick={() => setCount((c) => c + 1)}>Increment</button>
        </div>
      );
    }

    test('should render without errors', () => {
      render(<TestComponent />);
      expect(screen.getByTestId('count')).toHaveTextContent('0');
    });

    test('should allow re-renders', async () => {
      render(<TestComponent />);
      const button = screen.getByText('Increment');

      button.click();

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      });
    });
  });

  describe('cleanup', () => {
    function MountUnmountComponent({
      onMount,
      onUnmount,
    }: {
      onMount: () => void;
      onUnmount: () => void;
    }): ReactElement {
      useSignals();

      useEffect(() => {
        onMount();
        return () => {
          onUnmount();
        };
      }, [onMount, onUnmount]);

      return <div data-testid="mounted">Mounted</div>;
    }

    test('should cleanup on unmount', async () => {
      let mounted = false;
      let unmounted = false;

      const { unmount } = render(
        <MountUnmountComponent
          onMount={() => {
            mounted = true;
          }}
          onUnmount={() => {
            unmounted = true;
          }}
        />
      );

      expect(mounted).toBe(true);
      expect(unmounted).toBe(false);

      unmount();

      // Give time for the timeout-based cleanup
      await waitFor(() => {
        expect(unmounted).toBe(true);
      });
    });
  });

  describe('multiple components', () => {
    function Counter({ id }: { id: string }): ReactElement {
      useSignals();
      const [count, setCount] = useState(0);

      return (
        <div>
          <span data-testid={`count-${id}`}>{count}</span>
          <button
            data-testid={`button-${id}`}
            onClick={() => setCount((c) => c + 1)}
          >
            Increment {id}
          </button>
        </div>
      );
    }

    test('should work with multiple components', async () => {
      render(
        <div>
          <Counter id="a" />
          <Counter id="b" />
        </div>
      );

      expect(screen.getByTestId('count-a')).toHaveTextContent('0');
      expect(screen.getByTestId('count-b')).toHaveTextContent('0');

      screen.getByTestId('button-a').click();

      await waitFor(() => {
        expect(screen.getByTestId('count-a')).toHaveTextContent('1');
        expect(screen.getByTestId('count-b')).toHaveTextContent('0');
      });
    });
  });
});
