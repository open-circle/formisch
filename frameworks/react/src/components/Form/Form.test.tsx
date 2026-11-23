import { batch, createSignal, flushUpdates } from '@formisch/core/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactElement, startTransition, Suspense, use } from 'react';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { useForm } from '../../hooks/index.ts';
import { useSignals } from '../../hooks/useSignals/index.ts';
import { Field } from '../Field/index.ts';
import { Form } from './Form.tsx';

const schema = v.object({
  email: v.pipe(v.string(), v.nonEmpty('Email is required')),
});

describe('Form', () => {
  test('should render a form element with noValidate, children, and forwarded attributes', () => {
    function Test(): ReactElement {
      const form = useForm({ schema });
      return (
        <Form
          of={form}
          onSubmit={vi.fn()}
          aria-label="Test"
          className="my-form"
          id="signup"
        >
          <span data-testid="child">child</span>
        </Form>
      );
    }

    render(<Test />);

    const formElement = screen.getByRole('form', { name: 'Test' });
    expect(formElement.tagName).toBe('FORM');
    expect(formElement).toHaveAttribute('novalidate');
    expect(formElement).toHaveClass('my-form');
    expect(formElement).toHaveAttribute('id', 'signup');
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('should call onSubmit with the validated output when submitted', async () => {
    const onSubmit = vi.fn();

    function Test(): ReactElement {
      const form = useForm({
        schema,
        initialInput: { email: 'user@example.com' },
      });
      return (
        <Form of={form} onSubmit={onSubmit} aria-label="Test">
          <button type="submit">Submit</button>
        </Form>
      );
    }

    render(<Test />);

    fireEvent.submit(screen.getByRole('form', { name: 'Test' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'user@example.com' },
        expect.any(Object)
      );
    });
  });

  test('should not call onSubmit when validation fails', async () => {
    const onSubmit = vi.fn();

    function Test(): ReactElement {
      const form = useForm({ schema, initialInput: { email: '' } });
      return (
        <Form of={form} onSubmit={onSubmit} aria-label="Test">
          <span data-testid="valid">{String(form.isValid)}</span>
          <button type="submit">Submit</button>
        </Form>
      );
    }

    render(<Test />);

    const valid = screen.getByTestId('valid');

    expect(valid).toHaveTextContent('true');

    fireEvent.submit(screen.getByRole('form', { name: 'Test' }));

    await waitFor(() => {
      expect(valid).toHaveTextContent('false');
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('should render field errors before focusing the first invalid field', async () => {
    const onSubmit = vi.fn();
    let snapshotAtFocus:
      | { ariaInvalid: string | null; errorText: string | null }
      | undefined;

    function Test(): ReactElement {
      const form = useForm({ schema, initialInput: { email: '' } });
      return (
        <Form of={form} onSubmit={onSubmit} aria-label="Test">
          <Field of={form} path={['email']}>
            {(field) => (
              <>
                <input
                  {...field.props}
                  value={field.input ?? ''}
                  aria-invalid={Boolean(field.errors)}
                  aria-errormessage="email-error"
                  onFocus={(event) => {
                    field.props.onFocus();
                    snapshotAtFocus = {
                      ariaInvalid: event.target.getAttribute('aria-invalid'),
                      errorText:
                        document.getElementById('email-error')?.textContent ??
                        null,
                    };
                  }}
                />
                {field.errors && <div id="email-error">{field.errors[0]}</div>}
                <button type="submit">Submit</button>
              </>
            )}
          </Field>
        </Form>
      );
    }

    render(<Test />);

    fireEvent.submit(screen.getByRole('form', { name: 'Test' }));

    await waitFor(() => {
      expect(snapshotAtFocus).toBeDefined();
    });

    expect(snapshotAtFocus).toStrictEqual({
      ariaInvalid: 'true',
      errorText: 'Email is required',
    });
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('should not block validation focus on an unrelated suspended useSignals transition or empty batch', async () => {
    const onSubmit = vi.fn();
    const unrelatedSignal = createSignal(0);
    let resolveSuspension!: () => void;
    const pendingTransitionPromise = new Promise<void>((resolve) => {
      resolveSuspension = resolve;
    });
    let snapshotAtFocus:
      | { ariaInvalid: string | null; errorText: string | null }
      | undefined;

    function SuspendingComponent(): ReactElement {
      useSignals();
      if (unrelatedSignal.value > 0) {
        use(pendingTransitionPromise);
      }
      return <span data-testid="unrelated">{unrelatedSignal.value}</span>;
    }

    function Test(): ReactElement {
      const form = useForm({ schema, initialInput: { email: '' } });
      return (
        <>
          <Suspense fallback={<span>Loading</span>}>
            <SuspendingComponent />
          </Suspense>
          <Form of={form} onSubmit={onSubmit} aria-label="Test">
            <Field of={form} path={['email']}>
              {(field) => (
                <>
                  <input
                    {...field.props}
                    value={field.input ?? ''}
                    aria-invalid={Boolean(field.errors)}
                    aria-errormessage="email-error"
                    onFocus={(event) => {
                      field.props.onFocus();
                      snapshotAtFocus = {
                        ariaInvalid: event.target.getAttribute('aria-invalid'),
                        errorText:
                          document.getElementById('email-error')?.textContent ??
                          null,
                      };
                    }}
                  />
                  {field.errors && (
                    <div id="email-error">{field.errors[0]}</div>
                  )}
                  <button type="submit">Submit</button>
                </>
              )}
            </Field>
          </Form>
        </>
      );
    }

    render(<Test />);

    const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const isActEnvironment = globals.IS_REACT_ACT_ENVIRONMENT;
    globals.IS_REACT_ACT_ENVIRONMENT = false;
    try {
      // Trigger a transition on an unrelated useSignals listener that suspends
      // before committing its layout effect
      startTransition(() => {
        unrelatedSignal.value = 1;
      });

      // A batch that notifies zero listeners must clear prior cycle state and
      // return synchronously without waiting on the suspended listener
      batch(() => {});
      expect(flushUpdates()).toBeUndefined();

      screen
        .getByRole('form', { name: 'Test' })
        .dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true })
        );

      await waitFor(() => {
        expect(snapshotAtFocus).toBeDefined();
      });

      expect(snapshotAtFocus).toStrictEqual({
        ariaInvalid: 'true',
        errorText: 'Email is required',
      });
      expect(document.activeElement).toBe(screen.getByRole('textbox'));
      expect(screen.getByTestId('unrelated')).toHaveTextContent('0');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      globals.IS_REACT_ACT_ENVIRONMENT = isActEnvironment;
      resolveSuspension();
    }
  });
});
