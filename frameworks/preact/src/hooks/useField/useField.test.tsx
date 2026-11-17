import { getFieldStore, INTERNAL } from '@formisch/core/preact';
import {
  insert,
  move,
  remove,
  replace,
  reset,
  setInput,
  swap,
} from '@formisch/methods/preact';
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
      expect(field.path.value).toEqual(['name']);
      expect(field.input.value).toBe('');
      expect(field.errors.value).toBe(null);
      expect(field.isTouched.value).toBe(false);
      expect(field.isDirty.value).toBe(false);
      expect(field.isEdited.value).toBe(false);
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

  describe('edited state', () => {
    test('should not set isEdited on focus but should set isTouched', async () => {
      function Test(): JSX.Element {
        const form = useForm({ schema: v.object({ name: v.string() }) });
        const field = useField(form, { path: ['name'] });
        return (
          <div>
            <input
              data-testid="input"
              {...field.props}
              value={field.input.value ?? ''}
            />
            <span data-testid="touched">{String(field.isTouched.value)}</span>
            <span data-testid="edited">{String(field.isEdited.value)}</span>
          </div>
        );
      }

      render(<Test />);

      const touched = screen.getByTestId('touched');
      const edited = screen.getByTestId('edited');
      expect(touched).toHaveTextContent('false');
      expect(edited).toHaveTextContent('false');

      fireEvent.focus(screen.getByTestId('input'));

      await waitFor(() => {
        expect(touched).toHaveTextContent('true');
        expect(edited).toHaveTextContent('false');
      });
    });

    test('should set isEdited on input', async () => {
      function Test(): JSX.Element {
        const form = useForm({ schema: v.object({ name: v.string() }) });
        const field = useField(form, { path: ['name'] });
        return (
          <div>
            <input
              data-testid="input"
              {...field.props}
              value={field.input.value ?? ''}
            />
            <span data-testid="edited">{String(field.isEdited.value)}</span>
          </div>
        );
      }

      render(<Test />);

      const input = screen.getByTestId('input') as HTMLInputElement;
      const edited = screen.getByTestId('edited');
      expect(edited).toHaveTextContent('false');

      fireEvent.input(input, { target: { value: 'changed' } });

      await waitFor(() => {
        expect(edited).toHaveTextContent('true');
      });
    });

    test('should keep isEdited after reverting the value to its initial value', async () => {
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
            <span data-testid="edited">{String(field.isEdited.value)}</span>
            <span data-testid="dirty">{String(field.isDirty.value)}</span>
          </div>
        );
      }

      render(<Test />);

      const input = screen.getByTestId('input') as HTMLInputElement;
      const edited = screen.getByTestId('edited');
      const dirty = screen.getByTestId('dirty');
      expect(edited).toHaveTextContent('false');
      expect(dirty).toHaveTextContent('false');

      fireEvent.input(input, { target: { value: 'changed' } });

      await waitFor(() => {
        expect(edited).toHaveTextContent('true');
        expect(dirty).toHaveTextContent('true');
      });

      fireEvent.input(input, { target: { value: 'initial' } });

      await waitFor(() => {
        expect(dirty).toHaveTextContent('false');
        expect(edited).toHaveTextContent('true');
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

    test('should not register an element that is already present', () => {
      const schema = v.object({ name: v.string() });
      const { result } = renderHook(() => {
        const form = useForm({ schema });
        return { form, field: useField(form, { path: ['name'] }) };
      });
      const internalFieldStore = getFieldStore(result.current.form[INTERNAL], [
        'name',
      ])!;
      const element = document.createElement('input');
      // Simulate an array reorder having already transferred the element
      internalFieldStore.elements.push(element);
      result.current.field.props.ref(element);
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
          path: ['todos', props.index, 'label'],
        });
        return <input {...field.props} />;
      }

      function Test(): JSX.Element {
        const form = useForm({
          schema,
          initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
        });
        formStore = form;
        const fieldArray = useFieldArray(form, { path: ['todos'] });
        return (
          <>
            {fieldArray.items.value.map((id, index) => (
              <Row key={id} form={form} index={index} />
            ))}
          </>
        );
      }

      render(<Test />);
      expect(
        getFieldStore(formStore![INTERNAL], ['todos', 0, 'label'])!.elements
      ).toHaveLength(1);

      act(() => {
        swap(formStore!, { path: ['todos'], at: 0, and: 1 });
      });

      await vi.waitFor(() => {
        expect(
          getFieldStore(formStore![INTERNAL], ['todos', 0, 'label'])!.elements
        ).toHaveLength(1);
        expect(
          getFieldStore(formStore![INTERNAL], ['todos', 1, 'label'])!.elements
        ).toHaveLength(1);
      });
    });

    test('should register the elements of rows when an array is shrunk and regrown in one batch', async () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });
      let formStore: FormStore<typeof schema> | undefined;

      function Row(props: {
        form: FormStore<typeof schema>;
        index: number;
      }): JSX.Element {
        const field = useField(props.form, {
          path: ['todos', props.index, 'label'],
        });
        return <input {...field.props} />;
      }

      function Test(): JSX.Element {
        const form = useForm({
          schema,
          initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
        });
        formStore = form;
        const fieldArray = useFieldArray(form, { path: ['todos'] });
        return (
          <>
            {fieldArray.items.value.map((id, index) => (
              <Row key={id} form={form} index={index} />
            ))}
          </>
        );
      }

      render(<Test />);
      expect(
        getFieldStore(formStore![INTERNAL], ['todos', 1, 'label'])!.elements
      ).toHaveLength(1);

      // The second row gets a new item, so it is rendered anew and registers
      // its element again
      act(() => {
        setInput(formStore!, { path: ['todos'], input: [{ label: 'a' }] });
        setInput(formStore!, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });
      });

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

    describe('elements of rows after an array is shrunk and regrown', () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });

      function setup(): FormStore<typeof schema> {
        let formStore: FormStore<typeof schema> | undefined;

        function Row(props: {
          form: FormStore<typeof schema>;
          index: number;
        }): JSX.Element {
          const field = useField(props.form, {
            path: ['todos', props.index, 'label'],
          });
          return <input {...field.props} />;
        }

        function Test(): JSX.Element {
          const form = useForm({
            schema,
            initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
          });
          formStore = form;
          const fieldArray = useFieldArray(form, { path: ['todos'] });
          return (
            <>
              {fieldArray.items.value.map((id, index) => (
                <Row key={id} form={form} index={index} />
              ))}
            </>
          );
        }

        render(<Test />);
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

      test('should keep elements after swap and a regrowing setInput in one batch', async () => {
        const form = setup();
        act(() => {
          swap(form, { path: ['todos'], at: 0, and: 1 });
        });
        await expectElementsOfRenderedRows(form);

        act(() => {
          setInput(form, { path: ['todos'], input: [] });
          setInput(form, {
            path: ['todos'],
            input: [{ label: 'a' }, { label: 'b' }],
          });
        });

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after swap, remove and a regrowing setInput', async () => {
        const form = setup();
        act(() => {
          swap(form, { path: ['todos'], at: 0, and: 1 });
        });
        await expectElementsOfRenderedRows(form);
        act(() => {
          remove(form, { path: ['todos'], at: 0 });
        });
        await vi.waitFor(() => {
          expect(screen.getAllByRole('textbox')).toHaveLength(1);
        });

        act(() => {
          setInput(form, {
            path: ['todos'],
            input: [{ label: 'a' }, { label: 'b' }],
          });
        });

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after swap, a shrinking and a regrowing setInput and reset', async () => {
        const form = setup();
        act(() => {
          swap(form, { path: ['todos'], at: 0, and: 1 });
        });
        await expectElementsOfRenderedRows(form);
        act(() => {
          setInput(form, { path: ['todos'], input: [] });
        });
        await vi.waitFor(() => {
          expect(screen.queryAllByRole('textbox')).toHaveLength(0);
        });
        act(() => {
          setInput(form, {
            path: ['todos'],
            input: [{ label: 'a' }, { label: 'b' }],
          });
        });
        await expectElementsOfRenderedRows(form);

        act(() => {
          reset(form);
        });

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after replace, remove and a regrowing setInput', async () => {
        const form = setup();
        act(() => {
          replace(form, {
            path: ['todos'],
            at: 1,
            initialInput: { label: 'z' },
          });
        });
        await expectElementsOfRenderedRows(form);
        act(() => {
          remove(form, { path: ['todos'], at: 0 });
        });
        await vi.waitFor(() => {
          expect(screen.getAllByRole('textbox')).toHaveLength(1);
        });

        act(() => {
          setInput(form, {
            path: ['todos'],
            input: [{ label: 'a' }, { label: 'b' }],
          });
        });

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after insert, a shrinking and a regrowing setInput and reset', async () => {
        const form = setup();
        act(() => {
          insert(form, {
            path: ['todos'],
            at: 0,
            initialInput: { label: 'z' },
          });
        });
        await vi.waitFor(() => {
          expect(screen.getAllByRole('textbox')).toHaveLength(3);
        });
        act(() => {
          setInput(form, { path: ['todos'], input: [] });
        });
        await vi.waitFor(() => {
          expect(screen.queryAllByRole('textbox')).toHaveLength(0);
        });
        act(() => {
          setInput(form, {
            path: ['todos'],
            input: [{ label: 'a' }, { label: 'b' }],
          });
        });
        await expectElementsOfRenderedRows(form);

        act(() => {
          reset(form);
        });

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after move and a regrowing setInput in one batch', async () => {
        const form = setup();
        act(() => {
          move(form, { path: ['todos'], from: 0, to: 1 });
        });
        await expectElementsOfRenderedRows(form);

        act(() => {
          setInput(form, { path: ['todos'], input: [{ label: 'a' }] });
          setInput(form, {
            path: ['todos'],
            input: [{ label: 'a' }, { label: 'b' }],
          });
        });

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after a shrinking and a regrowing setInput and reset', async () => {
        const form = setup();
        act(() => {
          setInput(form, { path: ['todos'], input: [] });
        });
        await vi.waitFor(() => {
          expect(screen.queryAllByRole('textbox')).toHaveLength(0);
        });
        act(() => {
          setInput(form, {
            path: ['todos'],
            input: [{ label: 'a' }, { label: 'b' }],
          });
        });
        await expectElementsOfRenderedRows(form);

        act(() => {
          reset(form);
        });

        await expectElementsOfRenderedRows(form);
      });

      test('should register the element of the row of the kept item after remove and reset with keepInput', async () => {
        const form = setup();
        act(() => {
          remove(form, { path: ['todos'], at: 0 });
        });
        await vi.waitFor(() => {
          expect(screen.getAllByRole('textbox')).toHaveLength(1);
        });

        act(() => {
          reset(form, { keepInput: true });
        });

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
            expect(elements).toHaveLength(1);
            expect(elements[0]).toBe(input);
          });
        });
      });
    });
  });
});
