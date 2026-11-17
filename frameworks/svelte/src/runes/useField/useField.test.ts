import { getFieldStore, INTERNAL } from '@formisch/core/svelte';
import {
  insert,
  move,
  remove,
  replace,
  reset,
  setInput,
  swap,
} from '@formisch/methods/svelte';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { flushSync, tick } from 'svelte';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import type { FormStore } from '../../types/index.ts';
import FieldHost from '../../vitest/FieldHost.svelte';
import { renderHook } from '../../vitest/renderHook.ts';
import ReorderHost from '../../vitest/ReorderHost.svelte';
import UnmountHost from '../../vitest/UnmountHost.svelte';
import { createForm } from '../createForm/createForm.svelte.ts';
import { useField } from './useField.svelte.ts';

describe('useField', () => {
  describe('initialization', () => {
    test('should return field store with default state and props', () => {
      const { result } = renderHook(() => {
        const form = createForm({ schema: v.object({ name: v.string() }) });
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

      expect(result.current.input).toBe('John');
    });
  });

  describe('input updates', () => {
    test('should update input and isDirty via DOM input event', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({ name: v.string() }),
            initialInput: { name: 'initial' },
          },
          path: ['name'],
        },
      });

      const input = screen.getByTestId('input') as HTMLInputElement;
      const dirty = screen.getByTestId('dirty');
      expect(input.value).toBe('initial');
      expect(dirty).toHaveTextContent('false');

      await fireEvent.input(input, { target: { value: 'changed' } });
      flushSync();

      expect(input.value).toBe('changed');
      expect(dirty).toHaveTextContent('true');
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

      result.current.onInput('not-an-email');

      expect(result.current.input).toBe('not-an-email');

      await waitFor(() => {
        expect(result.current.errors).toEqual(['Invalid email']);
        expect(result.current.isValid).toBe(false);
      });
    });
  });

  describe('validation modes', () => {
    test('should run validate:"touch" on focus and flip isTouched', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({
              email: v.pipe(v.string(), v.nonEmpty('Required')),
            }),
            validate: 'touch',
            initialInput: { email: '' },
          },
          path: ['email'],
        },
      });

      const touched = screen.getByTestId('touched');
      const valid = screen.getByTestId('valid');
      expect(touched).toHaveTextContent('false');
      expect(valid).toHaveTextContent('true');

      await fireEvent.focus(screen.getByTestId('input'));

      await waitFor(() => {
        expect(touched).toHaveTextContent('true');
        expect(valid).toHaveTextContent('false');
      });
    });

    test('should run validate:"input" on input and surface errors', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({
              email: v.pipe(v.string(), v.email('Invalid email')),
            }),
            validate: 'input',
            initialInput: { email: '' },
          },
          path: ['email'],
        },
      });

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      await fireEvent.input(screen.getByTestId('input'), {
        target: { value: 'bad' },
      });

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid email');
      });
    });

    // Svelte (and Preact, Solid, Vue) fire validation through a separate
    // `onchange` handler in `field.props`; React folds it into the same
    // handler that updates the input value.
    test('should run validate:"change" on change event', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({
              email: v.pipe(v.string(), v.email('Invalid email')),
            }),
            validate: 'change',
            initialInput: { email: 'invalid' },
          },
          path: ['email'],
        },
      });

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      await fireEvent.change(screen.getByTestId('input'));

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
      });
    });

    test('should run validate:"blur" on blur and surface errors', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({
              email: v.pipe(v.string(), v.email('Invalid email')),
            }),
            validate: 'blur',
            initialInput: { email: 'invalid' },
          },
          path: ['email'],
        },
      });

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      await fireEvent.blur(screen.getByTestId('input'));

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
      });
    });
  });

  describe('edited state', () => {
    test('focus does not set isEdited but sets isTouched', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({ name: v.string() }),
            initialInput: { name: 'initial' },
          },
          path: ['name'],
        },
      });

      const touched = screen.getByTestId('touched');
      const edited = screen.getByTestId('edited');
      expect(touched).toHaveTextContent('false');
      expect(edited).toHaveTextContent('false');

      await fireEvent.focus(screen.getByTestId('input'));

      await waitFor(() => {
        expect(touched).toHaveTextContent('true');
        expect(edited).toHaveTextContent('false');
      });
    });

    test('input sets isEdited', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({ name: v.string() }),
            initialInput: { name: 'initial' },
          },
          path: ['name'],
        },
      });

      const input = screen.getByTestId('input') as HTMLInputElement;
      const edited = screen.getByTestId('edited');
      expect(edited).toHaveTextContent('false');

      await fireEvent.input(input, { target: { value: 'changed' } });
      flushSync();

      await waitFor(() => {
        expect(edited).toHaveTextContent('true');
      });
    });

    test('reverting to initial keeps isEdited', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({ name: v.string() }),
            initialInput: { name: 'initial' },
          },
          path: ['name'],
        },
      });

      const input = screen.getByTestId('input') as HTMLInputElement;
      const edited = screen.getByTestId('edited');
      const dirty = screen.getByTestId('dirty');

      await fireEvent.input(input, { target: { value: 'changed' } });
      flushSync();

      await waitFor(() => {
        expect(edited).toHaveTextContent('true');
        expect(dirty).toHaveTextContent('true');
      });

      await fireEvent.input(input, { target: { value: 'initial' } });
      flushSync();

      await waitFor(() => {
        expect(dirty).toHaveTextContent('false');
        expect(edited).toHaveTextContent('true');
      });
    });
  });

  // Note: React's `store stability` test (memoization across re-renders) is
  // omitted — Svelte runes run once per component, so reference identity is
  // structural, not a runtime contract worth asserting.

  describe('element registration', () => {
    test('should focus the registered element when validation fails on submit', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({
              email: v.pipe(v.string(), v.nonEmpty('Required')),
            }),
            initialInput: { email: '' },
          },
          path: ['email'],
          onsubmit: vi.fn(),
        },
      });

      const input = screen.getByTestId('input');
      expect(document.activeElement).not.toBe(input);

      await fireEvent.submit(screen.getByRole('form', { name: 'Test' }));
      await tick();
      flushSync();

      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });
    });

    test('should unmount cleanly when the registered element is removed', () => {
      const { unmount } = render(UnmountHost, {
        props: {
          config: { schema: v.object({ name: v.string() }) },
          path: ['name'],
        },
      });
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
      const internalFieldStore = getFieldStore(result.current.form[INTERNAL], [
        'name',
      ])!;
      const element = document.createElement('input');
      // Simulate an array reorder having already transferred the element
      internalFieldStore.elements.push(element);
      // The element attachment is keyed by a private symbol
      const [attachmentKey] = Object.getOwnPropertySymbols(
        result.current.field.props
      );
      (
        (result.current.field.props as unknown as Record<symbol, unknown>)[
          attachmentKey
        ] as (element: HTMLElement) => void
      )(element);
      expect(internalFieldStore.elements).toEqual([element]);
    });

    test('should not duplicate element registration after an array reorder', async () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });
      let formStore: FormStore<typeof schema> | undefined;

      render(ReorderHost, {
        props: {
          config: {
            schema,
            initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
          },
          onMounted: (form: FormStore<typeof schema>) => {
            formStore = form;
          },
        },
      });

      expect(
        getFieldStore(formStore![INTERNAL], ['todos', 0, 'label'])!.elements
      ).toHaveLength(1);

      swap(formStore!, { path: ['todos'], at: 0, and: 1 });
      flushSync();

      await vi.waitFor(() => {
        expect(
          getFieldStore(formStore![INTERNAL], ['todos', 0, 'label'])!.elements
        ).toHaveLength(1);
        expect(
          getFieldStore(formStore![INTERNAL], ['todos', 1, 'label'])!.elements
        ).toHaveLength(1);
      });
    });

    // Note: Svelte applies the changes made before a flush in one update, so
    // both `setInput` calls are made before `flushSync` is called
    test('should register the elements of rows when an array is shrunk and regrown in one batch', async () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });
      let formStore: FormStore<typeof schema> | undefined;

      render(ReorderHost, {
        props: {
          config: {
            schema,
            initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
          },
          onMounted: (form: FormStore<typeof schema>) => {
            formStore = form;
          },
        },
      });

      expect(
        getFieldStore(formStore![INTERNAL], ['todos', 1, 'label'])!.elements
      ).toHaveLength(1);

      // The second row gets a new item, so it is rendered anew and registers
      // its element again
      setInput(formStore!, { path: ['todos'], input: [{ label: 'a' }] });
      setInput(formStore!, {
        path: ['todos'],
        input: [{ label: 'a' }, { label: 'b' }],
      });
      flushSync();

      await vi.waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(2);
        inputs.forEach((input, index) => {
          const { elements } = getFieldStore(formStore![INTERNAL], [
            'todos',
            index,
            'label',
          ])!;
          expect(elements).toHaveLength(1);
          expect(elements[0]).toBe(input);
        });
      });
    });

    // Note: Svelte applies the changes made before a flush in one update, so
    // the `setInput` calls of the tests with one batch are made before
    // `flushSync` is called
    describe('elements of rows after an array is shrunk and regrown', () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });

      function setup(): FormStore<typeof schema> {
        let formStore: FormStore<typeof schema> | undefined;

        render(ReorderHost, {
          props: {
            config: {
              schema,
              initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
            },
            onMounted: (form: FormStore<typeof schema>) => {
              formStore = form;
            },
          },
        });

        return formStore!;
      }

      async function expectElementsOfRenderedRows(
        form: FormStore<typeof schema>
      ): Promise<void> {
        await vi.waitFor(() => {
          const inputs = screen.getAllByRole('textbox');
          expect(inputs).toHaveLength(2);
          inputs.forEach((input, index) => {
            const { elements } = getFieldStore(form[INTERNAL], [
              'todos',
              index,
              'label',
            ])!;
            expect(elements).toHaveLength(1);
            expect(elements[0]).toBe(input);
          });
        });
      }

      // Note: The rune removes an element only from the field store it was
      // registered in, so after an array operation moved the elements, a
      // detached element may survive in the reset baseline. `reset` puts it
      // back, so after such a `reset` a row's store is only checked for the
      // row's own element
      async function expectRenderedRowsToContainTheirElements(
        form: FormStore<typeof schema>
      ): Promise<void> {
        await vi.waitFor(() => {
          const inputs = screen.getAllByRole('textbox');
          expect(inputs).toHaveLength(2);
          inputs.forEach((input, index) => {
            const { elements } = getFieldStore(form[INTERNAL], [
              'todos',
              index,
              'label',
            ])!;
            expect(elements).toContain(input);
          });
        });
      }

      test('should keep elements after swap and a regrowing setInput in one batch', async () => {
        const form = setup();
        swap(form, { path: ['todos'], at: 0, and: 1 });
        flushSync();
        await expectElementsOfRenderedRows(form);

        setInput(form, { path: ['todos'], input: [] });
        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });
        flushSync();

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after swap, remove and a regrowing setInput', async () => {
        const form = setup();
        swap(form, { path: ['todos'], at: 0, and: 1 });
        flushSync();
        await expectElementsOfRenderedRows(form);
        remove(form, { path: ['todos'], at: 0 });
        flushSync();
        await vi.waitFor(() => {
          expect(screen.getAllByRole('textbox')).toHaveLength(1);
        });

        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });
        flushSync();

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after swap, a shrinking and a regrowing setInput and reset', async () => {
        const form = setup();
        swap(form, { path: ['todos'], at: 0, and: 1 });
        flushSync();
        await expectElementsOfRenderedRows(form);
        setInput(form, { path: ['todos'], input: [] });
        flushSync();
        await vi.waitFor(() => {
          expect(screen.queryAllByRole('textbox')).toHaveLength(0);
        });
        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });
        flushSync();
        await expectElementsOfRenderedRows(form);

        reset(form);
        flushSync();

        await expectRenderedRowsToContainTheirElements(form);
      });

      test('should keep elements after replace, remove and a regrowing setInput', async () => {
        const form = setup();
        replace(form, {
          path: ['todos'],
          at: 1,
          initialInput: { label: 'z' },
        });
        flushSync();
        await expectElementsOfRenderedRows(form);
        remove(form, { path: ['todos'], at: 0 });
        flushSync();
        await vi.waitFor(() => {
          expect(screen.getAllByRole('textbox')).toHaveLength(1);
        });

        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });
        flushSync();

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after insert, a shrinking and a regrowing setInput and reset', async () => {
        const form = setup();
        insert(form, { path: ['todos'], at: 0, initialInput: { label: 'z' } });
        flushSync();
        await vi.waitFor(() => {
          expect(screen.getAllByRole('textbox')).toHaveLength(3);
        });
        setInput(form, { path: ['todos'], input: [] });
        flushSync();
        await vi.waitFor(() => {
          expect(screen.queryAllByRole('textbox')).toHaveLength(0);
        });
        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });
        flushSync();
        await expectElementsOfRenderedRows(form);

        reset(form);
        flushSync();

        await expectRenderedRowsToContainTheirElements(form);
      });

      test('should keep elements after move and a regrowing setInput in one batch', async () => {
        const form = setup();
        move(form, { path: ['todos'], from: 0, to: 1 });
        flushSync();
        await expectElementsOfRenderedRows(form);

        setInput(form, { path: ['todos'], input: [{ label: 'a' }] });
        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });
        flushSync();

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after a shrinking and a regrowing setInput and reset', async () => {
        const form = setup();
        setInput(form, { path: ['todos'], input: [] });
        flushSync();
        await vi.waitFor(() => {
          expect(screen.queryAllByRole('textbox')).toHaveLength(0);
        });
        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });
        flushSync();
        await expectElementsOfRenderedRows(form);

        reset(form);
        flushSync();

        await expectElementsOfRenderedRows(form);
      });

      // Note: The rune removes an element only from the field store it was
      // registered in, so after an array operation moved the elements, a
      // detached element may survive in the reset baseline. `reset` puts it
      // back, so after such a `reset` a row's store is only checked for the
      // row's own element
      test('should register the element of the row of the kept item after remove and reset with keepInput', async () => {
        const form = setup();
        remove(form, { path: ['todos'], at: 0 });
        flushSync();
        await vi.waitFor(() => {
          expect(screen.getAllByRole('textbox')).toHaveLength(1);
        });

        reset(form, { keepInput: true });
        flushSync();

        // The kept row gets the start item of its index, so it is rendered
        // anew and registers its element in the store of that index
        await vi.waitFor(() => {
          const inputs = screen.getAllByRole('textbox');
          expect(inputs).toHaveLength(1);
          inputs.forEach((input, index) => {
            const { elements } = getFieldStore(form[INTERNAL], [
              'todos',
              index,
              'label',
            ])!;
            expect(elements).toContain(input);
          });
        });
      });
    });
  });
});
