import { handleSubmit, reset } from '@formisch/methods/react-native';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { type ReactElement, useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import type { FormStore } from '../../types/index.ts';
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
      expect(field.path).toEqual(['name']);
      expect(field.input).toBe('');
      expect(field.errors).toBe(null);
      expect(field.isTouched).toBe(false);
      expect(field.isEdited).toBe(false);
      expect(field.isDirty).toBe(false);
      expect(field.isValid).toBe(true);
      expect(typeof field.props.ref).toBe('function');
      expect(typeof field.props.onChangeText).toBe('function');
    });

    test('should reflect initialInput from form', () => {
      const { result } = renderHook(() => {
        const form = useForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'John' },
        });
        return useField(form, { path: ['name'] });
      });

      expect(result.current.input).toBe('John');
    });
  });

  describe('input updates', () => {
    test('should update input and isDirty via onChangeText', async () => {
      function Test(): ReactElement {
        const form = useForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'initial' },
        });
        const field = useField(form, { path: ['name'] });
        return (
          <>
            <TextInput
              testID="input"
              {...field.props}
              value={field.input ?? ''}
            />
            <Text testID="dirty">{String(field.isDirty)}</Text>
          </>
        );
      }

      render(<Test />);

      const input = screen.getByTestId('input') as unknown as HTMLInputElement;
      const dirty = screen.getByTestId('dirty');
      expect(input.value).toBe('initial');
      expect(dirty).toHaveTextContent('false');

      fireEvent.change(input, { target: { value: 'changed' } });

      await waitFor(() => {
        expect(input.value).toBe('changed');
        expect(dirty).toHaveTextContent('true');
      });
    });

    test('should update input and trigger validation via imperative onChange', async () => {
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
        result.current.onChange('not-an-email');
      });

      expect(result.current.input).toBe('not-an-email');

      await waitFor(() => {
        expect(result.current.errors).toEqual(['Invalid email']);
        expect(result.current.isValid).toBe(false);
      });
    });
  });

  describe('edited state', () => {
    test('should not set isEdited on focus but should set isTouched', async () => {
      function Test(): ReactElement {
        const form = useForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: '' },
        });
        const field = useField(form, { path: ['name'] });
        return (
          <>
            <TextInput testID="input" {...field.props} />
            <Text testID="touched">{String(field.isTouched)}</Text>
            <Text testID="edited">{String(field.isEdited)}</Text>
          </>
        );
      }

      render(<Test />);

      const touched = screen.getByTestId('touched');
      const edited = screen.getByTestId('edited');

      fireEvent.focus(screen.getByTestId('input'));

      // Focusing marks the field as touched, but not as edited
      await waitFor(() => {
        expect(touched).toHaveTextContent('true');
      });
      expect(edited).toHaveTextContent('false');
    });

    test('should set isEdited on input', async () => {
      function Test(): ReactElement {
        const form = useForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: '' },
        });
        const field = useField(form, { path: ['name'] });
        return (
          <>
            <TextInput
              testID="input"
              {...field.props}
              value={field.input ?? ''}
            />
            <Text testID="edited">{String(field.isEdited)}</Text>
          </>
        );
      }

      render(<Test />);

      const edited = screen.getByTestId('edited');
      expect(edited).toHaveTextContent('false');

      fireEvent.change(screen.getByTestId('input'), {
        target: { value: 'changed' },
      });

      await waitFor(() => {
        expect(edited).toHaveTextContent('true');
      });
    });

    test('should keep isEdited after reverting the value to its initial value', async () => {
      function Test(): ReactElement {
        const form = useForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'initial' },
        });
        const field = useField(form, { path: ['name'] });
        return (
          <>
            <TextInput
              testID="input"
              {...field.props}
              value={field.input ?? ''}
            />
            <Text testID="edited">{String(field.isEdited)}</Text>
            <Text testID="dirty">{String(field.isDirty)}</Text>
          </>
        );
      }

      render(<Test />);

      const input = screen.getByTestId('input') as unknown as HTMLInputElement;
      const edited = screen.getByTestId('edited');
      const dirty = screen.getByTestId('dirty');

      fireEvent.change(input, { target: { value: 'changed' } });
      await waitFor(() => {
        expect(edited).toHaveTextContent('true');
        expect(dirty).toHaveTextContent('true');
      });

      // Reverting to the initial value clears isDirty but keeps isEdited
      fireEvent.change(input, { target: { value: 'initial' } });
      await waitFor(() => {
        expect(dirty).toHaveTextContent('false');
      });
      expect(edited).toHaveTextContent('true');
    });
  });

  describe('validation modes', () => {
    test('should run validate:"touch" on focus and flip isTouched', async () => {
      function Test(): ReactElement {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.nonEmpty('Required')),
          }),
          validate: 'touch',
          initialInput: { email: '' },
        });
        const field = useField(form, { path: ['email'] });
        return (
          <>
            <TextInput testID="input" {...field.props} />
            <Text testID="touched">{String(field.isTouched)}</Text>
            <Text testID="valid">{String(field.isValid)}</Text>
          </>
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

    test('should run validate:"input" on change and surface errors', async () => {
      function Test(): ReactElement {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'input',
          initialInput: { email: '' },
        });
        const field = useField(form, { path: ['email'] });
        return (
          <>
            <TextInput
              testID="input"
              {...field.props}
              value={field.input ?? ''}
            />
            <Text testID="valid">{String(field.isValid)}</Text>
            {field.errors && <Text testID="error">{field.errors[0]}</Text>}
          </>
        );
      }

      render(<Test />);

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      fireEvent.change(screen.getByTestId('input'), {
        target: { value: 'bad' },
      });

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid email');
      });
    });

    test('should run validate:"blur" on blur and surface errors', async () => {
      function Test(): ReactElement {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'blur',
          initialInput: { email: 'invalid' },
        });
        const field = useField(form, { path: ['email'] });
        return (
          <>
            <TextInput
              testID="input"
              {...field.props}
              value={field.input ?? ''}
            />
            <Text testID="valid">{String(field.isValid)}</Text>
          </>
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
      function Test(): ReactElement {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.nonEmpty('Required')),
          }),
          initialInput: { email: '' },
        });
        const field = useField(form, { path: ['email'] });
        return (
          <>
            <TextInput
              testID="input"
              {...field.props}
              value={field.input ?? ''}
            />
            <Pressable onPress={handleSubmit(form, vi.fn())}>
              <Text>Submit</Text>
            </Pressable>
          </>
        );
      }

      render(<Test />);

      const input = screen.getByTestId('input');
      expect(document.activeElement).not.toBe(input);

      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });
    });

    test('should focus a remounted field after reset instead of a stale element', async () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.nonEmpty('Required')),
      });

      // The field lives in its own component so unmounting it runs the
      // adapter cleanup (which reassigns `elements`), the way a real
      // conditionally rendered field does
      function EmailField({
        form,
      }: {
        form: FormStore<typeof schema>;
      }): ReactElement {
        const field = useField(form, { path: ['email'] });
        return (
          <TextInput
            testID="input"
            {...field.props}
            value={field.input ?? ''}
          />
        );
      }

      function Test(): ReactElement {
        const form = useForm({ schema, initialInput: { email: '' } });
        const [show, setShow] = useState(true);
        return (
          <>
            {show && <EmailField form={form} />}
            <Pressable onPress={() => setShow((value) => !value)}>
              <Text>toggle</Text>
            </Pressable>
            <Pressable onPress={() => reset(form)}>
              <Text>reset</Text>
            </Pressable>
            <Pressable onPress={handleSubmit(form, vi.fn())}>
              <Text>Submit</Text>
            </Pressable>
          </>
        );
      }

      render(<Test />);

      // Unmount then remount the field so the adapter cleanup reassigns
      // `elements` and a stale `initialElements` would diverge
      act(() => {
        fireEvent.click(screen.getByText('toggle'));
      });
      expect(screen.queryByTestId('input')).toBeNull();
      act(() => {
        fireEvent.click(screen.getByText('toggle'));
      });

      // Reset the form, then submit so validation focuses the first error field
      act(() => {
        fireEvent.click(screen.getByText('reset'));
      });
      fireEvent.click(screen.getByText('Submit'));

      // Focus must land on the live remounted input, not a detached baseline
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByTestId('input'));
      });
    });

    test('should unmount cleanly when the registered element is removed', () => {
      function Test(): ReactElement {
        const form = useForm({ schema: v.object({ name: v.string() }) });
        const field = useField(form, { path: ['name'] });
        return <TextInput testID="input" {...field.props} />;
      }

      const { unmount } = render(<Test />);
      expect(screen.getByTestId('input')).toBeInTheDocument();

      unmount();

      expect(screen.queryByTestId('input')).toBeNull();
    });
  });
});
