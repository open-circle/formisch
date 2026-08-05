import { getFieldStore, INTERNAL } from '@formisch/core/react-native';
import {
  handleSubmit,
  remove,
  reset,
  swap,
} from '@formisch/methods/react-native';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { type ReactElement, useEffect, useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import type { FormStore } from '../../types/index.ts';
import { useFieldArray } from '../useFieldArray/index.ts';
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

    test('should focus a swapped element while the field stays mounted', async () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.nonEmpty('Required')),
      });

      let capturedForm: FormStore<typeof schema> | undefined;

      function Test(): ReactElement {
        const form = useForm({ schema, initialInput: { email: '' } });
        useEffect(() => {
          capturedForm = form;
        }, [form]);
        const field = useField(form, { path: ['email'] });
        const [swapped, setSwapped] = useState(false);
        return (
          <>
            {swapped ? (
              <TextInput
                key="second"
                testID="input-second"
                {...field.props}
                value={field.input ?? ''}
              />
            ) : (
              <TextInput
                key="first"
                testID="input-first"
                {...field.props}
                value={field.input ?? ''}
              />
            )}
            <Pressable onPress={() => setSwapped(true)}>
              <Text>swap</Text>
            </Pressable>
            <Pressable onPress={handleSubmit(form, vi.fn())}>
              <Text>Submit</Text>
            </Pressable>
          </>
        );
      }

      render(<Test />);

      // Replace the element while the field stays mounted so the ref callback
      // unregisters the detached element and registers the new one
      act(() => {
        fireEvent.click(screen.getByText('swap'));
      });
      expect(screen.queryByTestId('input-first')).toBeNull();

      // Only the live element must remain registered
      expect(
        getFieldStore(capturedForm![INTERNAL], ['email']).elements
      ).toHaveLength(1);

      // Submit so validation focuses the first error field
      fireEvent.click(screen.getByText('Submit'));

      // Focus must land on the live swapped input, not the detached one
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByTestId('input-second'));
      });
    });

    test('should unregister the correct element when the ref is shared', () => {
      const schema = v.object({ email: v.string() });

      let capturedForm: FormStore<typeof schema> | undefined;

      // Hint: Raw DOM elements are rendered because React attaches the ref
      // callback to them directly and honors its cleanup function, like
      // React Native's merged refs do on native, while react-native-web's
      // merged refs ignore the cleanup and only call the ref with `null`
      function Test(): ReactElement {
        const form = useForm({ schema, initialInput: { email: '' } });
        useEffect(() => {
          capturedForm = form;
        }, [form]);
        const field = useField(form, { path: ['email'] });
        const { ref } = field.props;
        const [showFirst, setShowFirst] = useState(true);
        return (
          <>
            {showFirst && <input data-testid="input-first" ref={ref} />}
            <input data-testid="input-second" ref={ref} />
            <Pressable onPress={() => setShowFirst(false)}>
              <Text>hide</Text>
            </Pressable>
          </>
        );
      }

      render(<Test />);
      const internalFieldStore = getFieldStore(capturedForm![INTERNAL], [
        'email',
      ]);
      expect(internalFieldStore.elements).toHaveLength(2);

      // Remove the first element while the second stays mounted, so exactly
      // the detached element must be unregistered
      act(() => {
        fireEvent.click(screen.getByText('hide'));
      });
      expect(internalFieldStore.elements).toHaveLength(1);
      expect(internalFieldStore.elements[0]).toBe(
        screen.getByTestId('input-second')
      );
    });

    test('should only keep the live element registered after removing an array item', () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });

      let capturedForm: FormStore<typeof schema> | undefined;

      function TodoField({
        form,
        index,
      }: {
        form: FormStore<typeof schema>;
        index: number;
      }): ReactElement {
        const field = useField(form, { path: ['todos', index, 'label'] });
        return (
          <TextInput
            testID={`input-${index}`}
            {...field.props}
            value={field.input ?? ''}
          />
        );
      }

      function Test(): ReactElement {
        const form = useForm({
          schema,
          initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
        });
        useEffect(() => {
          capturedForm = form;
        }, [form]);
        const fieldArray = useFieldArray(form, { path: ['todos'] });
        return (
          <>
            {fieldArray.items.map((item, index) => (
              <TodoField key={item} form={form} index={index} />
            ))}
          </>
        );
      }

      render(<Test />);

      // Remove the first item so `copyItemState` moves the second item's
      // element array into the first item's store
      act(() => {
        remove(capturedForm!, { path: ['todos'], at: 0 });
      });

      // The first item's store must only reference the live element
      const internalFieldStore = getFieldStore(capturedForm![INTERNAL], [
        'todos',
        0,
        'label',
      ]);
      expect(internalFieldStore.elements).toHaveLength(1);
      expect(internalFieldStore.elements[0]).toBe(
        screen.getByTestId('input-0')
      );
    });

    test('should keep live elements in the reset baseline after an array reorder', async () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });

      let capturedForm: FormStore<typeof schema> | undefined;

      function TodoField({
        form,
        index,
      }: {
        form: FormStore<typeof schema>;
        index: number;
      }): ReactElement {
        const field = useField(form, { path: ['todos', index, 'label'] });
        return (
          <TextInput
            testID={`input-${index}`}
            {...field.props}
            value={field.input ?? ''}
          />
        );
      }

      function Test(): ReactElement {
        const form = useForm({
          schema,
          initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
        });
        useEffect(() => {
          capturedForm = form;
        }, [form]);
        const fieldArray = useFieldArray(form, { path: ['todos'] });
        return (
          <>
            {fieldArray.items.map((item, index) => (
              <TodoField key={item} form={form} index={index} />
            ))}
          </>
        );
      }

      render(<Test />);
      const firstElement = screen.getByTestId('input-0');
      const secondElement = screen.getByTestId('input-1');

      // Swap the items so the element arrays move between the stores and the
      // refs re-register their live elements within the same commit
      await act(async () => {
        swap(capturedForm!, { path: ['todos'], at: 0, and: 1 });
      });

      // Both reset baselines must still contain their original live elements
      expect(
        getFieldStore(capturedForm![INTERNAL], ['todos', 0, 'label'])
          .initialElements
      ).toContain(firstElement);
      expect(
        getFieldStore(capturedForm![INTERNAL], ['todos', 1, 'label'])
          .initialElements
      ).toContain(secondElement);
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
