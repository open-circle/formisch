import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { flushSync } from 'hono/jsx/dom';
import type { JSX } from 'hono/jsx/jsx-runtime';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { useForm } from '../../hooks/index.ts';
import { renderHono } from '../../vitest/render.tsx';
import { Form } from './Form.tsx';

const schema = v.object({
  email: v.pipe(v.string(), v.nonEmpty('Email is required')),
});

describe('Form', () => {
  test('should render a form element with noValidate, children, and forwarded attributes', () => {
    function Test(): JSX.Element {
      const form = useForm({ schema });
      return (
        <Form
          of={form}
          onSubmit={vi.fn()}
          aria-label="Test"
          class="my-form"
          id="signup"
        >
          <span data-testid="child">child</span>
        </Form>
      );
    }

    renderHono(<Test />);

    const formElement = screen.getByRole('form', { name: 'Test' });
    expect(formElement.tagName).toBe('FORM');
    expect(formElement).toHaveAttribute('novalidate');
    expect(formElement).toHaveClass('my-form');
    expect(formElement).toHaveAttribute('id', 'signup');
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('should call onSubmit with the validated output when submitted', async () => {
    const onSubmit = vi.fn();

    function Test(): JSX.Element {
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

    renderHono(<Test />);

    // hono/jsx/dom wraps `<form />` with its own submit listener that treats
    // every untrusted submit event as one of its own form actions, so the
    // submission is driven through the button the way a user would
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'user@example.com' },
        expect.any(Object)
      );
    });
  });

  test('should not call onSubmit when validation fails', async () => {
    const onSubmit = vi.fn();

    function Test(): JSX.Element {
      const form = useForm({ schema, initialInput: { email: '' } });
      return (
        <Form of={form} onSubmit={onSubmit} aria-label="Test">
          <span data-testid="valid">{String(form.isValid)}</span>
          <button type="submit">Submit</button>
        </Form>
      );
    }

    renderHono(<Test />);

    const valid = screen.getByTestId('valid');

    expect(valid).toHaveTextContent('true');

    flushSync(() => {
      fireEvent.click(screen.getByText('Submit'));
    });

    await waitFor(() => {
      expect(valid).toHaveTextContent('false');
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
