import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/preact';
import type { JSX } from 'preact';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { Form } from '../../components/Form/index.ts';
import { useForm } from '../useForm/index.ts';
import { useField } from './useField.ts';

describe('useField', () => {
  describe('initialization', () => {
    test('should return field store with default state and props', () => {
      const { result } = renderHook(() => {
        const form = useForm({ schema: v.object({ name: v.string() }) });
        return useField(form, { path: ['name'] });
      });

      const field = result.current;
      expect(field.path.value).toEqual(['name']);
      expect(field.input.value).toBe(undefined);
      expect(field.errors.value).toBe(null);
      expect(field.isTouched.value).toBe(false);
      expect(field.isDirty.value).toBe(false);
      expect(field.isValid.value).toBe(true);
      expect(field.props.name).toBe('["name"]');
      expect(field.props.autofocus).toBe(false);
    });

    test('should reflect initialInput from form', () => {
      const { result } = renderHook(() => {
        const form = useForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'John' },
        });
        return useField(form, { path: ['name'] });
      });

      expect(result.current.input.value).toBe('John');
    });
  });

  describe('input updates', () => {
    test('should update input and isDirty via DOM onInput', async () => {
      function Test(): JSX.Element {
        const form = useForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'initial' },
        });
        const field = useField(form, { path: ['name'] });
        return (
          <div>
            <input
              data-testid="input"
              {...field.props}
              value={field.input.value ?? ''}
            />
            <span data-testid="dirty">{String(field.isDirty.value)}</span>
          </div>
        );
      }

      render(<Test />);

      const input = screen.getByTestId('input') as HTMLInputElement;
      const dirty = screen.getByTestId('dirty');
      expect(input.value).toBe('initial');
      expect(dirty).toHaveTextContent('false');

      fireEvent.input(input, { target: { value: 'changed' } });

      await waitFor(() => {
        expect(input.value).toBe('changed');
        expect(dirty).toHaveTextContent('true');
      });
    });

    test('should update input and trigger validation via imperative onInput', async () => {
      const { result } = renderHook(() => {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'input',
          initialInput: { email: '' },
        });
        return useField(form, { path: ['email'] });
      });

      act(() => {
        result.current.onInput('not-an-email');
      });

      expect(result.current.input.value).toBe('not-an-email');

      await waitFor(() => {
        expect(result.current.errors.value).toEqual(['Invalid email']);
        expect(result.current.isValid.value).toBe(false);
      });
    });
  });

  describe('validation modes', () => {
    test('should run validate:"touch" on focus and flip isTouched', async () => {
      function Test(): JSX.Element {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.nonEmpty('Required')),
          }),
          validate: 'touch',
          initialInput: { email: '' },
        });
        const field = useField(form, { path: ['email'] });
        return (
          <div>
            <input data-testid="input" {...field.props} />
            <span data-testid="touched">{String(field.isTouched.value)}</span>
            <span data-testid="valid">{String(field.isValid.value)}</span>
          </div>
        );
      }

      render(<Test />);

      const touched = screen.getByTestId('touched');
      const valid = screen.getByTestId('valid');
      expect(touched).toHaveTextContent('false');
      expect(valid).toHaveTextContent('true');

      fireEvent.focus(screen.getByTestId('input'));

      await waitFor(() => {
        expect(touched).toHaveTextContent('true');
        expect(valid).toHaveTextContent('false');
      });
    });

    test('should run validate:"input" on input and surface errors', async () => {
      function Test(): JSX.Element {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'input',
          initialInput: { email: '' },
        });
        const field = useField(form, { path: ['email'] });
        return (
          <div>
            <input
              data-testid="input"
              {...field.props}
              value={field.input.value ?? ''}
            />
            <span data-testid="valid">{String(field.isValid.value)}</span>
            {field.errors.value && (
              <span data-testid="error">{field.errors.value[0]}</span>
            )}
          </div>
        );
      }

      render(<Test />);

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      fireEvent.input(screen.getByTestId('input'), {
        target: { value: 'bad' },
      });

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid email');
      });
    });

    // Preact (and Solid, Svelte, Vue) fire validation through a separate
    // `onChange` handler in `field.props`; React folds it into the same
    // handler that updates the input value.
    test('should run validate:"change" on change event', async () => {
      function Test(): JSX.Element {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'change',
          initialInput: { email: 'invalid' },
        });
        const field = useField(form, { path: ['email'] });
        return (
          <div>
            <input
              data-testid="input"
              {...field.props}
              value={field.input.value ?? ''}
            />
            <span data-testid="valid">{String(field.isValid.value)}</span>
          </div>
        );
      }

      render(<Test />);

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      fireEvent.change(screen.getByTestId('input'));

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
      });
    });

    test('should run validate:"blur" on blur and surface errors', async () => {
      function Test(): JSX.Element {
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
              value={field.input.value ?? ''}
            />
            <span data-testid="valid">{String(field.isValid.value)}</span>
          </div>
        );
      }

      render(<Test />);

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      fireEvent.blur(screen.getByTestId('input'));

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
      });
    });
  });

  describe('store stability', () => {
    test('should return memoized store reference across re-renders', () => {
      const { result, rerender } = renderHook(() => {
        const form = useForm({ schema: v.object({ name: v.string() }) });
        return useField(form, { path: ['name'] });
      });

      const first = result.current;
      rerender();
      expect(result.current).toBe(first);
    });
  });

  describe('element registration', () => {
    test('should focus the registered element when validation fails on submit', async () => {
      function Test(): JSX.Element {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.nonEmpty('Required')),
          }),
          initialInput: { email: '' },
        });
        const field = useField(form, { path: ['email'] });
        return (
          <Form of={form} onSubmit={vi.fn()} aria-label="Test">
            <input
              data-testid="input"
              {...field.props}
              value={field.input.value ?? ''}
            />
            <button type="submit">Submit</button>
          </Form>
        );
      }

      render(<Test />);

      const input = screen.getByTestId('input');
      expect(document.activeElement).not.toBe(input);

      fireEvent.submit(screen.getByRole('form', { name: 'Test' }));

      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });
    });

    test('should unmount cleanly when the registered element is removed', () => {
      function Test(): JSX.Element {
        const form = useForm({ schema: v.object({ name: v.string() }) });
        const field = useField(form, { path: ['name'] });
        return <input data-testid="input" {...field.props} />;
      }

      const { unmount } = render(<Test />);
      expect(screen.getByTestId('input')).toBeInTheDocument();

      unmount();

      expect(screen.queryByTestId('input')).toBeNull();
    });
  });
});
