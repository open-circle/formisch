import { getFieldStore, INTERNAL } from '@formisch/core/solid';
import { getInput, insert, remove, reset, swap } from '@formisch/methods/solid';
import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@solidjs/testing-library';
import type { JSX } from '@solidjs/web';
import { createSignal, For } from 'solid-js';
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
      const internalFieldStore = getFieldStore(result.form[INTERNAL], [
        'name',
      ])!;
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
        itemId: string;
      }): JSX.Element {
        const field = useField(props.form, () => ({
          path: ['todos', props.index, 'label'],
        }));
        return <input {...field.props} data-item={props.itemId} />;
      }

      function Test(): JSX.Element {
        const form = createForm({
          schema,
          initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
        });
        formStore = form;
        const fieldArray = useFieldArray(form, { path: ['todos'] });
        return (
          <For each={fieldArray.items} keyed={(id) => id}>
            {(id, index) => <Row form={form} index={index()} itemId={id()} />}
          </For>
        );
      }

      render(() => <Test />);
      const rows = Array.from(document.querySelectorAll('input'));
      expect(
        getFieldStore(formStore![INTERNAL], ['todos', 0, 'label'])!.elements
      ).toHaveLength(1);

      swap(formStore!, { path: ['todos'], at: 0, and: 1 });

      await vi.waitFor(() => {
        expect(document.querySelectorAll('input')[0]).toBe(rows[1]);
        expect(document.querySelectorAll('input')[1]).toBe(rows[0]);
        expect(
          getFieldStore(formStore![INTERNAL], ['todos', 0, 'label'])!.elements
        ).toHaveLength(1);
        expect(
          getFieldStore(formStore![INTERNAL], ['todos', 1, 'label'])!.elements
        ).toHaveLength(1);
      });
    });

    test('should unregister an element when a batched conditional removes it', async () => {
      const schema = v.object({ name: v.string() });
      const [visible, setVisible] = createSignal(true);
      let form: FormStore<typeof schema> | undefined;

      function Test(): JSX.Element {
        form = createForm({ schema });
        const field = useField(form, { path: ['name'] });
        return <div>{visible() && <input {...field.props} />}</div>;
      }

      render(() => <Test />);
      const internal = getFieldStore(form![INTERNAL], ['name'])!;
      expect(internal.elements).toHaveLength(1);
      setVisible(false);
      await vi.waitFor(() => {
        expect(internal.elements).toHaveLength(0);
        expect(internal.initialElements).toHaveLength(0);
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
      ])!;
      expect(internalFieldStore.initialElements).toContain(element);

      // Simulate an array operation moving the elements to another store
      internalFieldStore.elements = [];

      // The detached element must not survive in the reset baseline
      unmount();
      expect(internalFieldStore.initialElements).not.toContain(element);
    });

    // Array methods transfer refs synchronously, before batched JSX updates.
    describe('interrupted array updates', () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });

      interface RowProps {
        form: FormStore<typeof schema>;
        index: number;
        mirrored: boolean;
      }

      function Row(props: RowProps): JSX.Element {
        const field = useField(props.form, () => ({
          path: ['todos', props.index, 'label'],
        }));
        return (
          <>
            <input {...field.props} value={field.input} />
            {props.mirrored && <input {...field.props} value={field.input} />}
          </>
        );
      }

      function mountArray(mirrored = false) {
        let form!: FormStore<typeof schema>;
        const [visible, setVisible] = createSignal(true);
        const view = render(() => {
          form = createForm({
            schema,
            initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
          });
          const array = useFieldArray(form, { path: ['todos'] });
          return (
            <div>
              {visible() && (
                <For each={array.items} keyed={(id) => id}>
                  {(_id, index) => (
                    <Row form={form} index={index()} mirrored={mirrored} />
                  )}
                </For>
              )}
            </div>
          );
        });
        return { form, setVisible, ...view };
      }

      function mutateArray(
        form: FormStore<typeof schema>,
        operation: 'swap' | 'remove' | 'insert'
      ) {
        const fields = [0, 1].map(
          (index) => getFieldStore(form[INTERNAL], ['todos', index, 'label'])!
        );
        if (operation === 'swap') {
          swap(form, { path: ['todos'], at: 0, and: 1 });
        } else if (operation === 'remove') {
          remove(form, { path: ['todos'], at: 0 });
        } else {
          insert(form, {
            path: ['todos'],
            at: 0,
            initialInput: { label: 'c' },
          });
          fields.push(getFieldStore(form[INTERNAL], ['todos', 2, 'label'])!);
        }
        return fields;
      }

      test.each(['swap', 'remove', 'insert'] as const)(
        'should unregister transferred elements when unmounted immediately after %s',
        (operation) => {
          const { form, container, unmount } = mountArray();
          const oldElements = Array.from(container.querySelectorAll('input'));
          expect(oldElements).toHaveLength(2);
          const fields = mutateArray(form, operation);

          // Verify the transfer before disposal or any batched JSX update.
          const labels =
            operation === 'swap'
              ? ['b', 'a']
              : operation === 'remove'
                ? ['b']
                : ['c', 'a', 'b'];
          expect(getInput(form)).toEqual({
            todos: labels.map((label) => ({ label })),
          });
          const destinationElements =
            operation === 'swap'
              ? [oldElements[1], oldElements[0]]
              : operation === 'remove'
                ? [oldElements[1]]
                : [undefined, ...oldElements];
          for (const [index, element] of destinationElements.entries()) {
            const destination = getFieldStore(form[INTERNAL], [
              'todos',
              index,
              'label',
            ])!;
            expect(destination.elements).toHaveLength(element ? 1 : 0);
            if (element) {
              expect(destination.elements[0]).toBe(element);
            }
          }
          expect(Array.from(container.querySelectorAll('input'))).toEqual(
            oldElements
          );

          // Do not flush between the mutation and disposal.
          unmount();

          expect(container.querySelectorAll('input')).toHaveLength(0);
          for (const field of fields) {
            expect(field.elements).toEqual([]);
            expect(field.initialElements).toEqual([]);
          }
        }
      );

      test('should preserve multiple elements per field after a row shifts to a new index', async () => {
        const { form, container, unmount } = mountArray(true);
        expect(container.querySelectorAll('input')).toHaveLength(4);
        const fields = mutateArray(form, 'remove');

        await vi.waitFor(() => {
          const elements = Array.from(container.querySelectorAll('input'));
          expect(elements.map((element) => element.value)).toEqual(['b', 'b']);
          expect(fields[0].elements).toEqual(elements);
          expect(fields[1].elements).toEqual([]);
          expect(fields[1].initialElements).toEqual(elements);
        });
        reset(form);
        await vi.waitFor(() => {
          const elements = Array.from(container.querySelectorAll('input'));
          expect(elements.map((element) => element.value)).toEqual([
            'a',
            'a',
            'b',
            'b',
          ]);
          for (const field of fields) {
            expect(field.elements).toEqual(
              elements.filter((element) => element.name === field.name)
            );
          }
        });
        unmount();
        for (const field of fields) {
          expect(field.elements).toEqual([]);
          expect(field.initialElements).toEqual([]);
        }
      });

      test.each(['swap', 'remove', 'insert'] as const)(
        'should unregister transferred elements and remount without stale refs after %s',
        async (operation) => {
          const { form, container, setVisible, unmount } = mountArray();
          const oldElements = Array.from(container.querySelectorAll('input'));
          expect(oldElements).toHaveLength(2);
          const fields = mutateArray(form, operation);

          // Remove the fields before JSX can re-register the transferred refs.
          setVisible(false);
          await vi.waitFor(() => {
            expect(container.querySelectorAll('input')).toHaveLength(0);
            for (const field of fields) {
              expect(field.elements).toEqual([]);
              expect(field.initialElements).toEqual([]);
            }
          });

          setVisible(true);
          await vi.waitFor(() => {
            const elements = Array.from(container.querySelectorAll('input'));
            expect(elements).toHaveLength(
              operation === 'remove' ? 1 : operation === 'insert' ? 3 : 2
            );
            for (const field of fields) {
              expect(field.elements).toEqual(
                elements.filter((element) => element.name === field.name)
              );
              for (const element of oldElements) {
                expect(field.initialElements).not.toContain(element);
              }
              for (const element of field.initialElements) {
                expect(element.isConnected).toBe(true);
              }
            }
          });

          reset(form);
          await vi.waitFor(() => {
            const elements = Array.from(container.querySelectorAll('input'));
            expect(elements.map((element) => element.value)).toEqual([
              'a',
              'b',
            ]);
            for (const field of fields) {
              expect(field.elements).toEqual(
                elements.filter((element) => element.name === field.name)
              );
            }
          });
          unmount();
          for (const field of fields) {
            expect(field.elements).toEqual([]);
            expect(field.initialElements).toEqual([]);
          }
        }
      );
    });

    test('should preserve other elements and their reset baseline when one element unmounts', async () => {
      const schema = v.object({ name: v.string() });
      const [visible, setVisible] = createSignal(true);
      let form!: FormStore<typeof schema>;

      const { container, unmount } = render(() => {
        form = createForm({ schema, initialInput: { name: 'initial' } });
        const field = useField(form, { path: ['name'] });
        return (
          <div>
            <input {...field.props} value={field.input} />
            {visible() && <input {...field.props} value={field.input} />}
          </div>
        );
      });
      const persistent = container.querySelector('input')!;
      const field = getFieldStore(form[INTERNAL], ['name'])!;
      expect(field.elements).toHaveLength(2);
      fireEvent.input(persistent, { target: { value: 'changed' } });
      setVisible(false);

      await vi.waitFor(() => {
        expect(container.querySelectorAll('input')).toHaveLength(1);
        expect(field.elements).toEqual([persistent]);
        expect(field.initialElements).toBe(field.elements);
        expect(persistent.value).toBe('changed');
      });
      reset(form);
      await vi.waitFor(() => {
        expect(persistent.value).toBe('initial');
        expect(field.elements).toEqual([persistent]);
      });
      setVisible(true);
      await vi.waitFor(() => {
        expect(container.querySelectorAll('input')).toHaveLength(2);
        expect(field.elements).toHaveLength(2);
        expect(field.initialElements).toBe(field.elements);
      });
      unmount();
      expect(field.elements).toEqual([]);
      expect(field.initialElements).toEqual([]);
    });
  });
});
