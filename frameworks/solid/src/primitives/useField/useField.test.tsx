import { getFieldStore, INTERNAL } from '@formisch/core/solid';
import { swap } from '@formisch/methods/solid';
import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@solidjs/testing-library';
import { For, type JSX } from 'solid-js';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { Form } from '../../components/Form/index.ts';
import type { FormStore } from '../../types/index.ts';
import { createForm } from '../createForm/index.ts';
import { useFieldArray } from '../useFieldArray/index.ts';
import { useField } from './useField.ts';

describe('useField', () => {
  describe('initialization', () => {
    test('should return field store with default state and props', () => {
      const { result } = renderHook(() => {
        const form = createForm({ schema: v.object({ name: v.string() }) });
        return useField(form, { path: ['name'] });
      });

      const field = result;
      expect(field.path).toEqual(['name']);
      expect(field.input).toBe('');
      expect(field.errors).toBe(null);
      expect(field.isTouched).toBe(false);
      expect(field.isEdited).toBe(false);
      expect(field.isDirty).toBe(false);
      expect(field.isValid).toBe(true);
      expect(field.props.name).toBe('["name"]');
      expect(field.props.autofocus).toBe(false);
    });

    test('should reflect initialInput from form', () => {
      const { result } = renderHook(() => {
        const form = createForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'John' },
        });
        return useField(form, { path: ['name'] });
      });

      expect(result.input).toBe('John');
    });
  });

  describe('input updates', () => {
    test('should update input and isDirty via DOM onInput', async () => {
      function Test(): JSX.Element {
        const form = createForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'initial' },
        });
        const field = useField(form, { path: ['name'] });
        return (
          <div>
            <input
              data-testid="input"
              {...field.props}
              value={field.input ?? ''}
            />
            <span data-testid="dirty">{String(field.isDirty)}</span>
          </div>
        );
      }

      render(() => <Test />);

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
        const form = createForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'input',
          initialInput: { email: '' },
        });
        return useField(form, { path: ['email'] });
      });

      result.onInput('not-an-email');

      expect(result.input).toBe('not-an-email');

      await waitFor(() => {
        expect(result.errors).toEqual(['Invalid email']);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('edited state', () => {
    test('should not set isEdited on focus but should set isTouched', async () => {
      function Test(): JSX.Element {
        const form = createForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: '' },
        });
        const field = useField(form, { path: ['name'] });
        return (
          <div>
            <input data-testid="input" {...field.props} />
            <span data-testid="touched">{String(field.isTouched)}</span>
            <span data-testid="edited">{String(field.isEdited)}</span>
          </div>
        );
      }

      render(() => <Test />);

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
      function Test(): JSX.Element {
        const form = createForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: '' },
        });
        const field = useField(form, { path: ['name'] });
        return (
          <div>
            <input
              data-testid="input"
              {...field.props}
              value={field.input ?? ''}
            />
            <span data-testid="edited">{String(field.isEdited)}</span>
          </div>
        );
      }

      render(() => <Test />);

      const edited = screen.getByTestId('edited');
      expect(edited).toHaveTextContent('false');

      fireEvent.input(screen.getByTestId('input'), {
        target: { value: 'changed' },
      });

      await waitFor(() => {
        expect(edited).toHaveTextContent('true');
      });
    });

    test('should keep isEdited after reverting the value to its initial value', async () => {
      function Test(): JSX.Element {
        const form = createForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'initial' },
        });
        const field = useField(form, { path: ['name'] });
        return (
          <div>
            <input
              data-testid="input"
              {...field.props}
              value={field.input ?? ''}
            />
            <span data-testid="edited">{String(field.isEdited)}</span>
            <span data-testid="dirty">{String(field.isDirty)}</span>
          </div>
        );
      }

      render(() => <Test />);

      const input = screen.getByTestId('input') as HTMLInputElement;
      const edited = screen.getByTestId('edited');
      const dirty = screen.getByTestId('dirty');

      fireEvent.input(input, { target: { value: 'changed' } });
      await waitFor(() => {
        expect(edited).toHaveTextContent('true');
        expect(dirty).toHaveTextContent('true');
      });

      // Reverting to the initial value clears isDirty but keeps isEdited
      fireEvent.input(input, { target: { value: 'initial' } });
      await waitFor(() => {
        expect(dirty).toHaveTextContent('false');
      });
      expect(edited).toHaveTextContent('true');
    });
  });

  describe('validation modes', () => {
    test('should run validate:"touch" on focus and flip isTouched', async () => {
      function Test(): JSX.Element {
        const form = createForm({
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
            <span data-testid="touched">{String(field.isTouched)}</span>
            <span data-testid="valid">{String(field.isValid)}</span>
          </div>
        );
      }

      render(() => <Test />);

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
        const form = createForm({
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
              value={field.input ?? ''}
            />
            <span data-testid="valid">{String(field.isValid)}</span>
            {field.errors && <span data-testid="error">{field.errors[0]}</span>}
          </div>
        );
      }

      render(() => <Test />);

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

    // Solid (and Preact, Svelte, Vue) fire validation through a separate
    // `onchange` handler in `field.props`; React folds it into the same
    // handler that updates the input value.
    test('should run validate:"change" on change event', async () => {
      function Test(): JSX.Element {
        const form = createForm({
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
              value={field.input ?? ''}
            />
            <span data-testid="valid">{String(field.isValid)}</span>
          </div>
        );
      }

      render(() => <Test />);

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      fireEvent.change(screen.getByTestId('input'));

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
      });
    });

    test('should run validate:"blur" on blur and surface errors', async () => {
      function Test(): JSX.Element {
        const form = createForm({
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
          </div>
        );
      }

      render(() => <Test />);

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      fireEvent.blur(screen.getByTestId('input'));

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
      });
    });
  });

  // Note: React's `store stability` test (memoization across re-renders) is
  // omitted — Solid primitives run once per reactive root, so reference
  // identity is structural, not a runtime contract worth asserting.

  describe('element registration', () => {
    test('should focus the registered element when validation fails on submit', async () => {
      function Test(): JSX.Element {
        const form = createForm({
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
              value={field.input ?? ''}
            />
            <button type="submit">Submit</button>
          </Form>
        );
      }

      render(() => <Test />);

      const input = screen.getByTestId('input');
      expect(document.activeElement).not.toBe(input);

      fireEvent.submit(screen.getByRole('form', { name: 'Test' }));

      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });
    });

    test('should unmount cleanly when the registered element is removed', () => {
      function Test(): JSX.Element {
        const form = createForm({ schema: v.object({ name: v.string() }) });
        const field = useField(form, { path: ['name'] });
        return <input data-testid="input" {...field.props} />;
      }

      const { unmount } = render(() => <Test />);
      expect(screen.getByTestId('input')).toBeInTheDocument();

      unmount();

      expect(screen.queryByTestId('input')).toBeNull();
    });

    test('should not register an element that is already present', () => {
      const schema = v.object({ name: v.string() });
      const { result } = renderHook(() => {
        const form = createForm({ schema });
        return { form, field: useField(form, { path: ['name'] }) };
      });
      const internalFieldStore = getFieldStore(result.form[INTERNAL], ['name']);
      const element = document.createElement('input');
      // Simulate an array reorder having already transferred the element
      internalFieldStore.elements.push(element);
      result.field.props.ref(element);
      expect(internalFieldStore.elements).toEqual([element]);
    });

    test('should not duplicate element registration after an array reorder', async () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });
      let formStore: FormStore<typeof schema> | undefined;

      function Row(props: {
        form: FormStore<typeof schema>;
        index: number;
      }): JSX.Element {
        const field = useField(props.form, {
          // eslint-disable-next-line solid/reactivity
          path: ['todos', props.index, 'label'],
        });
        return <input {...field.props} />;
      }

      function Test(): JSX.Element {
        const form = createForm({
          schema,
          initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
        });
        formStore = form;
        const fieldArray = useFieldArray(form, { path: ['todos'] });
        return (
          <For each={fieldArray.items}>
            {(id, index) => <Row form={form} index={index()} />}
          </For>
        );
      }

      render(() => <Test />);
      expect(
        getFieldStore(formStore![INTERNAL], ['todos', 0, 'label']).elements
      ).toHaveLength(1);

      swap(formStore!, { path: ['todos'], at: 0, and: 1 });

      await vi.waitFor(() => {
        expect(
          getFieldStore(formStore![INTERNAL], ['todos', 0, 'label']).elements
        ).toHaveLength(1);
        expect(
          getFieldStore(formStore![INTERNAL], ['todos', 1, 'label']).elements
        ).toHaveLength(1);
      });
    });

    test('should drop a detached element from the reset baseline after the elements moved', () => {
      const schema = v.object({ name: v.string() });

      let capturedForm: FormStore<typeof schema> | undefined;

      function Test(): JSX.Element {
        const form = createForm({ schema, initialInput: { name: '' } });
        capturedForm = form;
        const field = useField(form, { path: ['name'] });
        return <input data-testid="input" {...field.props} />;
      }

      const { unmount } = render(() => <Test />);
      const element = screen.getByTestId('input');
      const internalFieldStore = getFieldStore(capturedForm![INTERNAL], [
        'name',
      ]);
      expect(internalFieldStore.initialElements).toContain(element);

      // Simulate an array operation moving the elements to another store
      internalFieldStore.elements = [];

      // The detached element must not survive in the reset baseline
      unmount();
      expect(internalFieldStore.initialElements).not.toContain(element);
    });
  });
});
