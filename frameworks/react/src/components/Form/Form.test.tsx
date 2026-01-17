import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { useForm } from '../../hooks/index.ts';
import { Form } from './Form.tsx';

describe('Form', () => {
  describe('rendering', () => {
    function TestForm(): ReactElement {
      const form = useForm({ schema: v.object({ name: v.string() }) });
      return (
        <Form of={form} onSubmit={() => {}}>
          <input name="name" aria-label="Name" />
          <button type="submit">Submit</button>
        </Form>
      );
    }

    test('should render form element with children', () => {
      render(<TestForm />);

      expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Submit' })
      ).toBeInTheDocument();
    });

    test('should have noValidate attribute', () => {
      render(<TestForm />);

      // Form elements without accessible name don't have role="form"
      // so we use querySelector instead
      const form = document.querySelector('form');
      expect(form).toHaveAttribute('noValidate');
    });
  });

  describe('props forwarding', () => {
    test('should forward standard form attributes', () => {
      function TestFormWithProps(): ReactElement {
        const form = useForm({ schema: v.object({ name: v.string() }) });
        return (
          <Form
            of={form}
            onSubmit={() => {}}
            className="test-class"
            id="test-form"
            aria-label="Test Form"
          >
            <button type="submit">Submit</button>
          </Form>
        );
      }

      render(<TestFormWithProps />);

      const formElement = screen.getByRole('form', { name: 'Test Form' });
      expect(formElement).toHaveClass('test-class');
      expect(formElement).toHaveAttribute('id', 'test-form');
    });
  });

  describe('submission', () => {
    test('should call onSubmit when form is submitted with valid data', async () => {
      const handleSubmit = vi.fn();
      const schema = v.object({ name: v.string() });

      function SubmitTestForm(): ReactElement {
        const form = useForm({
          schema,
          initialInput: { name: 'John' },
        });

        return (
          <Form of={form} onSubmit={handleSubmit} aria-label="Submit Test">
            <button type="submit">Submit</button>
          </Form>
        );
      }

      render(<SubmitTestForm />);

      const form = screen.getByRole('form', { name: 'Submit Test' });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });

    test('should prevent default form submission', async () => {
      const handleSubmit = vi.fn();
      const schema = v.object({ name: v.string() });

      function PreventDefaultForm(): ReactElement {
        const form = useForm({
          schema,
          initialInput: { name: 'John' },
        });

        return (
          <Form of={form} onSubmit={handleSubmit} aria-label="Prevent Default">
            <button type="submit">Submit</button>
          </Form>
        );
      }

      render(<PreventDefaultForm />);

      const form = screen.getByRole('form', { name: 'Prevent Default' });
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });

      form.dispatchEvent(submitEvent);

      // The form should prevent default
      expect(submitEvent.defaultPrevented).toBe(true);
    });
  });

  describe('validation on submit', () => {
    test('should not call onSubmit when validation fails', async () => {
      const handleSubmit = vi.fn();
      const schema = v.object({
        email: v.pipe(v.string(), v.nonEmpty('Email is required')),
      });

      function ValidationForm(): ReactElement {
        const form = useForm({
          schema,
          initialInput: { email: '' },
        });

        return (
          <Form of={form} onSubmit={handleSubmit} aria-label="Validation Form">
            <button type="submit">Submit</button>
          </Form>
        );
      }

      render(<ValidationForm />);

      const form = screen.getByRole('form', { name: 'Validation Form' });
      fireEvent.submit(form);

      // Use waitFor to ensure validation has completed
      await waitFor(() => {
        expect(handleSubmit).not.toHaveBeenCalled();
      });
    });

    test('should call onSubmit with valid output', async () => {
      const handleSubmit = vi.fn();
      const schema = v.object({
        email: v.pipe(v.string(), v.email()),
      });

      function ValidForm(): ReactElement {
        const form = useForm({
          schema,
          initialInput: { email: 'test@example.com' },
        });

        return (
          <Form of={form} onSubmit={handleSubmit} aria-label="Valid Form">
            <button type="submit">Submit</button>
          </Form>
        );
      }

      render(<ValidForm />);

      const form = screen.getByRole('form', { name: 'Valid Form' });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          { email: 'test@example.com' },
          expect.any(Object)
        );
      });
    });
  });

  describe('form state', () => {
    test('should set isSubmitting during submission', async () => {
      const schema = v.object({ name: v.string() });
      let capturedIsSubmitting = false;

      function StateForm(): ReactElement {
        const form = useForm({
          schema,
          initialInput: { name: 'John' },
        });

        return (
          <Form
            of={form}
            onSubmit={async () => {
              capturedIsSubmitting = form.isSubmitting;
              await new Promise((resolve) => setTimeout(resolve, 50));
            }}
            aria-label="State Form"
          >
            <span data-testid="submitting">{String(form.isSubmitting)}</span>
            <button type="submit">Submit</button>
          </Form>
        );
      }

      render(<StateForm />);

      expect(screen.getByTestId('submitting')).toHaveTextContent('false');

      const form = screen.getByRole('form', { name: 'State Form' });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(capturedIsSubmitting).toBe(true);
      });
    });
  });
});
