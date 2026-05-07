import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ReactElement } from 'react';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { Form } from '../../components/Form/index.ts';
import { useForm } from '../useForm/index.ts';
import { useField } from './useField.ts';

describe('useField', () => {
  describe('initialization', () => {
    test('should create field store with correct path', () => {
      const schema = v.object({ name: v.string() });

      const { result } = renderHook(() => {
        const form = useForm({ schema });
        return useField(form, { path: ['name'] });
      });

      expect(result.current.path).toEqual(['name']);
    });

    test('should have undefined input for uninitialized field', () => {
      const schema = v.object({ name: v.string() });

      const { result } = renderHook(() => {
        const form = useForm({ schema });
        return useField(form, { path: ['name'] });
      });

      expect(result.current.input).toBe(undefined);
    });

    test('should have initial input value when provided', () => {
      const schema = v.object({ name: v.string() });

      const { result } = renderHook(() => {
        const form = useForm({
          schema,
          initialInput: { name: 'John' },
        });
        return useField(form, { path: ['name'] });
      });

      expect(result.current.input).toBe('John');
    });
  });

  describe('field state', () => {
    test('should have default state values', () => {
      const schema = v.object({ email: v.string() });

      const { result } = renderHook(() => {
        const form = useForm({ schema });
        return useField(form, { path: ['email'] });
      });

      expect(result.current.errors).toBe(null);
      expect(result.current.isTouched).toBe(false);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isValid).toBe(true);
    });

    test('should show errors after validation', async () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.email('Invalid email')),
      });

      const { result } = renderHook(() => {
        const form = useForm({
          schema,
          validate: 'initial',
          initialInput: { email: 'invalid' },
        });
        return useField(form, { path: ['email'] });
      });

      await waitFor(() => {
        expect(result.current.errors).not.toBe(null);
        expect(result.current.isValid).toBe(false);
      });
    });
  });

  describe('props', () => {
    test('should have correct name prop', () => {
      const schema = v.object({ username: v.string() });

      const { result } = renderHook(() => {
        const form = useForm({ schema });
        return useField(form, { path: ['username'] });
      });

      // The name is the stringified path
      expect(result.current.props.name).toBe('["username"]');
    });

    test('should have autoFocus false when no errors', () => {
      const schema = v.object({ name: v.string() });

      const { result } = renderHook(() => {
        const form = useForm({ schema });
        return useField(form, { path: ['name'] });
      });

      expect(result.current.props.autoFocus).toBe(false);
    });

    test('should have ref callback', () => {
      const schema = v.object({ name: v.string() });

      const { result } = renderHook(() => {
        const form = useForm({ schema });
        return useField(form, { path: ['name'] });
      });

      expect(typeof result.current.props.ref).toBe('function');
    });

    test('should have event handlers', () => {
      const schema = v.object({ name: v.string() });

      const { result } = renderHook(() => {
        const form = useForm({ schema });
        return useField(form, { path: ['name'] });
      });

      expect(typeof result.current.props.onFocus).toBe('function');
      expect(typeof result.current.props.onChange).toBe('function');
      expect(typeof result.current.props.onBlur).toBe('function');
    });
  });

  describe('imperative onChange', () => {
    test('should update field input and trigger validation', async () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.email('Invalid email')),
      });

      const { result } = renderHook(() => {
        const form = useForm({
          schema,
          validate: 'input',
          initialInput: { email: '' },
        });
        return useField(form, { path: ['email'] });
      });

      act(() => {
        result.current.onChange('not-an-email');
      });

      expect(result.current.input).toBe('not-an-email');

      await waitFor(() => {
        expect(result.current.errors).not.toBe(null);
        expect(result.current.isValid).toBe(false);
      });
    });
  });

  describe('event handlers', () => {
    function TestComponent(): ReactElement {
      const form = useForm({
        schema: v.object({ name: v.string() }),
        validate: 'touch',
      });
      const field = useField(form, { path: ['name'] });

      return (
        <div>
          <input
            data-testid="input"
            {...field.props}
            value={field.input ?? ''}
          />
          <span data-testid="touched">{String(field.isTouched)}</span>
          <span data-testid="dirty">{String(field.isDirty)}</span>
        </div>
      );
    }

    test('should set isTouched on focus', async () => {
      render(<TestComponent />);

      const input = screen.getByTestId('input');
      expect(screen.getByTestId('touched')).toHaveTextContent('false');

      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByTestId('touched')).toHaveTextContent('true');
      });
    });

    test('should update input value on change', async () => {
      render(<TestComponent />);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(input.value).toBe('test');
      });
    });

    test('should trigger validation on blur when validate is blur', async () => {
      function BlurValidateComponent(): ReactElement {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'blur',
          initialInput: { email: 'invalid' },
        });
        const field = useField(form, { path: ['email'] });

        return (
          <div>
            <input
              data-testid="input"
              {...field.props}
              value={field.input ?? ''}
            />
            <span data-testid="valid">{String(field.isValid)}</span>
            {field.errors && <span data-testid="error">{field.errors[0]}</span>}
          </div>
        );
      }

      render(<BlurValidateComponent />);

      // Initially valid (no validation run yet)
      expect(screen.getByTestId('valid')).toHaveTextContent('true');

      const input = screen.getByTestId('input');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByTestId('valid')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid email');
      });
    });
  });

  describe('nested fields', () => {
    test('should handle nested object path', () => {
      const schema = v.object({
        user: v.object({
          profile: v.object({
            name: v.string(),
          }),
        }),
      });

      const { result } = renderHook(() => {
        const form = useForm({
          schema,
          initialInput: { user: { profile: { name: 'John' } } },
        });
        return useField(form, { path: ['user', 'profile', 'name'] });
      });

      expect(result.current.path).toEqual(['user', 'profile', 'name']);
      expect(result.current.input).toBe('John');
    });

    test('should handle array index path', () => {
      const schema = v.object({
        items: v.array(v.string()),
      });

      const { result } = renderHook(() => {
        const form = useForm({
          schema,
          initialInput: { items: ['first', 'second'] },
        });
        return useField(form, { path: ['items', 0] });
      });

      expect(result.current.path).toEqual(['items', 0]);
      expect(result.current.input).toBe('first');
    });
  });

  describe('element registration', () => {
    test('should focus the registered element when validation fails on submit', async () => {
      function FocusOnErrorForm(): ReactElement {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.nonEmpty('Email is required')),
          }),
          initialInput: { email: '' },
        });
        const field = useField(form, { path: ['email'] });

        return (
          <Form of={form} onSubmit={vi.fn()} aria-label="Focus Form">
            <input
              data-testid="field-input"
              {...field.props}
              value={field.input ?? ''}
            />
            <button type="submit">Submit</button>
          </Form>
        );
      }

      render(<FocusOnErrorForm />);

      const input = screen.getByTestId('field-input');
      const formEl = screen.getByRole('form', { name: 'Focus Form' });

      expect(document.activeElement).not.toBe(input);

      fireEvent.submit(formEl);

      // The first registered element receives focus when validation fails
      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });
    });

    test('should remove disconnected elements on unmount', () => {
      function TestInputComponent(): ReactElement {
        const form = useForm({
          schema: v.object({ name: v.string() }),
        });
        const field = useField(form, { path: ['name'] });

        return <input data-testid="field-input" {...field.props} />;
      }

      const { unmount } = render(<TestInputComponent />);
      expect(screen.getByTestId('field-input')).toBeInTheDocument();

      // Cleanup runs without errors and removes disconnected elements
      expect(() => unmount()).not.toThrow();
      expect(screen.queryByTestId('field-input')).toBeNull();
    });
  });
});
