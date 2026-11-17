import { getFieldStore, INTERNAL } from '@formisch/core/vue';
import {
  insert,
  move,
  remove,
  replace,
  reset,
  setInput,
  swap,
} from '@formisch/methods/vue';
import { mount } from '@vue/test-utils';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import Form from '../../components/Form/Form.vue';
import type { FormStore } from '../../types/index.ts';
import { renderHook } from '../../vitest/renderHook.ts';
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

      expect(result.current.input).toBe('John');
    });
  });

  describe('input updates', () => {
    test('should update input and isDirty via DOM input event (input setter)', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({ name: v.string() }),
            initialInput: { name: 'initial' },
          });
          const field = useField(form, { path: ['name'] });
          return () =>
            h('div', [
              h('input', {
                'data-testid': 'input',
                ...field.props,
                value: field.input ?? '',
                onInput: (e: Event) => {
                  field.input = (e.target as HTMLInputElement).value;
                },
              }),
              h('span', { 'data-testid': 'dirty' }, String(field.isDirty)),
            ]);
        },
      });

      const wrapper = mount(Test);
      const input = wrapper.get<HTMLInputElement>('[data-testid="input"]');
      const dirty = wrapper.get('[data-testid="dirty"]');
      expect(input.element.value).toBe('initial');
      expect(dirty.text()).toBe('false');

      await input.setValue('changed');

      expect(input.element.value).toBe('changed');
      expect(dirty.text()).toBe('true');
    });

    test('should update input and trigger validation via input setter', async () => {
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

      result.current.input = 'not-an-email';

      expect(result.current.input).toBe('not-an-email');

      await vi.waitFor(() => {
        expect(result.current.errors).toEqual(['Invalid email']);
        expect(result.current.isValid).toBe(false);
      });
    });
  });

  describe('validation modes', () => {
    test('should run validate:"touch" on focus and flip isTouched', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({
              email: v.pipe(v.string(), v.nonEmpty('Required')),
            }),
            validate: 'touch',
            initialInput: { email: '' },
          });
          const field = useField(form, { path: ['email'] });
          return () =>
            h('div', [
              h('input', { 'data-testid': 'input', ...field.props }),
              h('span', { 'data-testid': 'touched' }, String(field.isTouched)),
              h('span', { 'data-testid': 'valid' }, String(field.isValid)),
            ]);
        },
      });

      const wrapper = mount(Test);
      const touched = wrapper.get('[data-testid="touched"]');
      const valid = wrapper.get('[data-testid="valid"]');
      expect(touched.text()).toBe('false');
      expect(valid.text()).toBe('true');

      await wrapper.get('[data-testid="input"]').trigger('focus');

      await vi.waitFor(() => {
        expect(touched.text()).toBe('true');
        expect(valid.text()).toBe('false');
      });
    });

    // Vue, Preact, Solid, and Svelte fire validation through a separate
    // `onChange`/`onchange` handler in `field.props`; React folds it into
    // the same handler that updates the input value.
    test('should run validate:"change" on change event and surface errors', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({
              email: v.pipe(v.string(), v.email('Invalid email')),
            }),
            validate: 'change',
            initialInput: { email: 'invalid' },
          });
          const field = useField(form, { path: ['email'] });
          return () =>
            h('div', [
              h('input', {
                'data-testid': 'input',
                ...field.props,
                value: field.input ?? '',
              }),
              h('span', { 'data-testid': 'valid' }, String(field.isValid)),
            ]);
        },
      });

      const wrapper = mount(Test);
      const valid = wrapper.get('[data-testid="valid"]');
      expect(valid.text()).toBe('true');

      await wrapper.get('[data-testid="input"]').trigger('change');

      await vi.waitFor(() => {
        expect(valid.text()).toBe('false');
      });
    });

    test('should run validate:"blur" on blur and surface errors', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({
              email: v.pipe(v.string(), v.email('Invalid email')),
            }),
            validate: 'blur',
            initialInput: { email: 'invalid' },
          });
          const field = useField(form, { path: ['email'] });
          return () =>
            h('div', [
              h('input', {
                'data-testid': 'input',
                ...field.props,
                value: field.input ?? '',
              }),
              h('span', { 'data-testid': 'valid' }, String(field.isValid)),
            ]);
        },
      });

      const wrapper = mount(Test);
      const valid = wrapper.get('[data-testid="valid"]');
      expect(valid.text()).toBe('true');

      await wrapper.get('[data-testid="input"]').trigger('blur');

      await vi.waitFor(() => {
        expect(valid.text()).toBe('false');
      });
    });
  });

  describe('edited state', () => {
    test('should not set isEdited on focus but should set isTouched', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({ name: v.string() }),
            initialInput: { name: 'initial' },
          });
          const field = useField(form, { path: ['name'] });
          return () =>
            h('div', [
              h('input', {
                'data-testid': 'input',
                ...field.props,
                value: field.input ?? '',
              }),
              h('span', { 'data-testid': 'touched' }, String(field.isTouched)),
              h('span', { 'data-testid': 'edited' }, String(field.isEdited)),
            ]);
        },
      });

      const wrapper = mount(Test);
      const touched = wrapper.get('[data-testid="touched"]');
      const edited = wrapper.get('[data-testid="edited"]');
      expect(touched.text()).toBe('false');
      expect(edited.text()).toBe('false');

      await wrapper.get('[data-testid="input"]').trigger('focus');

      await vi.waitFor(() => {
        expect(touched.text()).toBe('true');
        expect(edited.text()).toBe('false');
      });
    });

    test('should set isEdited on input', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({ name: v.string() }),
            initialInput: { name: 'initial' },
          });
          const field = useField(form, { path: ['name'] });
          return () =>
            h('div', [
              h('input', {
                'data-testid': 'input',
                ...field.props,
                value: field.input ?? '',
                onInput: (e: Event) => {
                  field.input = (e.target as HTMLInputElement).value;
                },
              }),
              h('span', { 'data-testid': 'edited' }, String(field.isEdited)),
            ]);
        },
      });

      const wrapper = mount(Test);
      const input = wrapper.get<HTMLInputElement>('[data-testid="input"]');
      const edited = wrapper.get('[data-testid="edited"]');
      expect(edited.text()).toBe('false');

      await input.setValue('changed');

      await vi.waitFor(() => {
        expect(edited.text()).toBe('true');
      });
    });

    test('should keep isEdited after reverting the value to its initial value', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({ name: v.string() }),
            initialInput: { name: 'initial' },
          });
          const field = useField(form, { path: ['name'] });
          return () =>
            h('div', [
              h('input', {
                'data-testid': 'input',
                ...field.props,
                value: field.input ?? '',
                onInput: (e: Event) => {
                  field.input = (e.target as HTMLInputElement).value;
                },
              }),
              h('span', { 'data-testid': 'edited' }, String(field.isEdited)),
              h('span', { 'data-testid': 'dirty' }, String(field.isDirty)),
            ]);
        },
      });

      const wrapper = mount(Test);
      const input = wrapper.get<HTMLInputElement>('[data-testid="input"]');
      const edited = wrapper.get('[data-testid="edited"]');
      const dirty = wrapper.get('[data-testid="dirty"]');

      await input.setValue('changed');

      await vi.waitFor(() => {
        expect(edited.text()).toBe('true');
        expect(dirty.text()).toBe('true');
      });

      await input.setValue('initial');

      await vi.waitFor(() => {
        expect(dirty.text()).toBe('false');
        expect(edited.text()).toBe('true');
      });
    });
  });

  describe('element registration', () => {
    test('should focus the registered element when validation fails on submit', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({
              email: v.pipe(v.string(), v.nonEmpty('Required')),
            }),
            initialInput: { email: '' },
          });
          const field = useField(form, { path: ['email'] });
          return () =>
            h(
              Form,
              { of: form, onSubmit: vi.fn(), 'aria-label': 'Test' },
              {
                default: () => [
                  h('input', {
                    'data-testid': 'input',
                    ...field.props,
                    value: field.input ?? '',
                  }),
                  h('button', { type: 'submit' }, 'Submit'),
                ],
              }
            );
        },
      });

      const wrapper = mount(Test, { attachTo: document.body });
      const input = wrapper.get<HTMLInputElement>('[data-testid="input"]');
      expect(document.activeElement).not.toBe(input.element);

      await wrapper.get('form').trigger('submit');

      await vi.waitFor(() => {
        expect(document.activeElement).toBe(input.element);
      });
    });

    // Vue passes the component instance instead of a DOM element to the ref
    // callback when `field.props` is bound to a component, so the adapter has
    // to resolve the wrapped form control itself
    test('should focus the input of a component when validation fails on submit', async () => {
      const Input = defineComponent({
        setup() {
          return () => h('input', { 'data-testid': 'input' });
        },
      });

      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({
              email: v.pipe(v.string(), v.nonEmpty('Required')),
            }),
            initialInput: { email: '' },
          });
          const field = useField(form, { path: ['email'] });
          return () =>
            h(
              Form,
              { of: form, onSubmit: vi.fn(), 'aria-label': 'Test' },
              {
                default: () => [
                  h(Input, field.props),
                  h('button', { type: 'submit' }, 'Submit'),
                ],
              }
            );
        },
      });

      const wrapper = mount(Test, { attachTo: document.body });
      const input = wrapper.get<HTMLInputElement>('[data-testid="input"]');
      expect(document.activeElement).not.toBe(input.element);

      await wrapper.get('form').trigger('submit');

      await vi.waitFor(() => {
        expect(document.activeElement).toBe(input.element);
      });
    });

    // A component with a fragment root has no single root element to resolve
    // the form control from, so the component instance must not be registered
    test('should not register a component without a root element', () => {
      const schema = v.object({ name: v.string() });

      let capturedForm: FormStore<typeof schema> | undefined;

      const FragmentInput = defineComponent({
        inheritAttrs: false,
        setup() {
          return () => [h('label', 'Name'), h('input')];
        },
      });

      const Test = defineComponent({
        setup() {
          const form = useForm({ schema });
          capturedForm = form;
          const field = useField(form, { path: ['name'] });
          return () => h(FragmentInput, field.props);
        },
      });

      mount(Test, { attachTo: document.body });
      expect(
        getFieldStore(capturedForm![INTERNAL], ['name'])!.elements
      ).toEqual([]);
    });

    test('should unmount cleanly when the registered element is removed', () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({ schema: v.object({ name: v.string() }) });
          const field = useField(form, { path: ['name'] });
          return () => h('input', { 'data-testid': 'input', ...field.props });
        },
      });

      const wrapper = mount(Test, { attachTo: document.body });
      expect(document.querySelector('[data-testid="input"]')).not.toBeNull();

      wrapper.unmount();

      expect(document.querySelector('[data-testid="input"]')).toBeNull();
    });

    test('should clean up a dynamic array field when its item is removed', async () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });
      let formStore: FormStore<typeof schema> | undefined;

      const Row = defineComponent({
        props: {
          form: { type: Object, required: true },
          index: { type: Number, required: true },
        },
        setup(props) {
          const field = useField(
            props.form as FormStore<typeof schema>,
            () => ({ path: ['todos', props.index, 'label'] as const })
          );
          return () => h('input', { 'data-testid': 'input', ...field.props });
        },
      });

      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema,
            initialInput: { todos: [{ label: 'a' }] },
          });
          formStore = form;
          const fieldArray = useFieldArray(form, { path: ['todos'] });
          return () =>
            fieldArray.items.map((id, index) =>
              h(Row, { key: id, form, index })
            );
        },
      });

      const wrapper = mount(Test, { attachTo: document.body });
      const removedFieldStore = getFieldStore(formStore![INTERNAL], [
        'todos',
        0,
        'label',
      ])!;
      expect(removedFieldStore.elements).toHaveLength(1);

      remove(formStore!, { path: ['todos'], at: 0 });
      await wrapper.vm.$nextTick();

      expect(document.querySelector('[data-testid="input"]')).toBeNull();
      expect(removedFieldStore.elements).toEqual([]);
      expect(removedFieldStore.initialElements).toEqual([]);
      expect(
        getFieldStore(formStore![INTERNAL], ['todos', 0, 'label'])
      ).toBeUndefined();
    });

    // Since Vue 3.6, a computed re-evaluates when read after its component
    // unmounted. Changing a dependency of the path getter after the removal
    // forces the same re-evaluation in older Vue versions.
    test('should clean up a removed array item field when its store is re-resolved', async () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });
      let formStore: FormStore<typeof schema> | undefined;
      const version = ref(0);

      const Row = defineComponent({
        props: {
          form: { type: Object, required: true },
          index: { type: Number, required: true },
        },
        setup(props) {
          const field = useField(props.form as FormStore<typeof schema>, () => {
            void version.value;
            return { path: ['todos', props.index, 'label'] as const };
          });
          return () => h('input', { 'data-testid': 'input', ...field.props });
        },
      });

      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema,
            initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
          });
          formStore = form;
          const fieldArray = useFieldArray(form, { path: ['todos'] });
          return () =>
            fieldArray.items.map((id, index) =>
              h(Row, { key: id, form, index })
            );
        },
      });

      const wrapper = mount(Test, { attachTo: document.body });
      const removedFieldStore = getFieldStore(formStore![INTERNAL], [
        'todos',
        1,
        'label',
      ])!;
      expect(removedFieldStore.elements).toHaveLength(1);

      remove(formStore!, { path: ['todos'], at: 1 });
      version.value++;
      await wrapper.vm.$nextTick();

      expect(document.querySelectorAll('[data-testid="input"]')).toHaveLength(
        1
      );
      expect(removedFieldStore.elements).toEqual([]);
      expect(removedFieldStore.initialElements).toEqual([]);
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
      (result.current.field.props.ref as (element: unknown) => void)(element);
      expect(internalFieldStore.elements).toEqual([element]);
    });

    test('should not duplicate element registration after an array reorder', async () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });
      let formStore: FormStore<typeof schema> | undefined;

      const Row = defineComponent({
        props: {
          form: { type: Object, required: true },
          index: { type: Number, required: true },
        },
        setup(props) {
          const field = useField(
            props.form as FormStore<typeof schema>,
            () => ({ path: ['todos', props.index, 'label'] as const })
          );
          return () => h('input', { ...field.props });
        },
      });

      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema,
            initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
          });
          formStore = form;
          const fieldArray = useFieldArray(form, { path: ['todos'] });
          return () =>
            fieldArray.items.map((id, index) =>
              h(Row, { key: id, form, index })
            );
        },
      });

      mount(Test, { attachTo: document.body });
      expect(
        getFieldStore(formStore![INTERNAL], ['todos', 0, 'label'])!.elements
      ).toHaveLength(1);

      swap(formStore!, { path: ['todos'], at: 0, and: 1 });

      await vi.waitFor(() => {
        expect(
          getFieldStore(formStore![INTERNAL], ['todos', 0, 'label'])!.elements
        ).toHaveLength(1);
        expect(
          getFieldStore(formStore![INTERNAL], ['todos', 1, 'label'])!.elements
        ).toHaveLength(1);
      });
    });

    // Note: Vue applies the changes of one tick in one update, so both
    // `setInput` calls are made without waiting for the next tick in between
    test('should register the elements of rows when an array is shrunk and regrown in one batch', async () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });
      let formStore: FormStore<typeof schema> | undefined;

      const Row = defineComponent({
        props: {
          form: { type: Object, required: true },
          index: { type: Number, required: true },
        },
        setup(props) {
          const field = useField(
            props.form as FormStore<typeof schema>,
            () => ({ path: ['todos', props.index, 'label'] as const })
          );
          return () => h('input', { ...field.props });
        },
      });

      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema,
            initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
          });
          formStore = form;
          const fieldArray = useFieldArray(form, { path: ['todos'] });
          return () =>
            fieldArray.items.map((id, index) =>
              h(Row, { key: id, form, index })
            );
        },
      });

      mount(Test, { attachTo: document.body });
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
      await nextTick();

      await vi.waitFor(() => {
        const inputs = [...document.querySelectorAll('input')];
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

    // Note: Vue applies the changes of one tick in one update, so the
    // `setInput` calls of the tests with one batch are made without waiting
    // for the next tick in between
    describe('elements of rows after an array is shrunk and regrown', () => {
      const schema = v.object({
        todos: v.array(v.object({ label: v.string() })),
      });

      function setup(): FormStore<typeof schema> {
        let formStore: FormStore<typeof schema> | undefined;

        const Row = defineComponent({
          props: {
            form: { type: Object, required: true },
            index: { type: Number, required: true },
          },
          setup(props) {
            const field = useField(
              props.form as FormStore<typeof schema>,
              () => ({ path: ['todos', props.index, 'label'] as const })
            );
            return () => h('input', { ...field.props });
          },
        });

        const Test = defineComponent({
          setup() {
            const form = useForm({
              schema,
              initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
            });
            formStore = form;
            const fieldArray = useFieldArray(form, { path: ['todos'] });
            return () =>
              fieldArray.items.map((id, index) =>
                h(Row, { key: id, form, index })
              );
          },
        });

        mount(Test, { attachTo: document.body });
        return formStore!;
      }

      function getInputs(): HTMLInputElement[] {
        return [...document.querySelectorAll('input')];
      }

      async function expectElementsOfRenderedRows(
        form: FormStore<typeof schema>
      ): Promise<void> {
        await nextTick();
        await vi.waitFor(() => {
          const inputs = getInputs();
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
        swap(form, { path: ['todos'], at: 0, and: 1 });
        await expectElementsOfRenderedRows(form);

        setInput(form, { path: ['todos'], input: [] });
        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after swap, remove and a regrowing setInput', async () => {
        const form = setup();
        swap(form, { path: ['todos'], at: 0, and: 1 });
        await expectElementsOfRenderedRows(form);
        remove(form, { path: ['todos'], at: 0 });
        await vi.waitFor(() => {
          expect(getInputs()).toHaveLength(1);
        });

        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after swap, a shrinking and a regrowing setInput and reset', async () => {
        const form = setup();
        swap(form, { path: ['todos'], at: 0, and: 1 });
        await expectElementsOfRenderedRows(form);
        setInput(form, { path: ['todos'], input: [] });
        await vi.waitFor(() => {
          expect(getInputs()).toHaveLength(0);
        });
        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });
        await expectElementsOfRenderedRows(form);

        reset(form);

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after replace, remove and a regrowing setInput', async () => {
        const form = setup();
        replace(form, {
          path: ['todos'],
          at: 1,
          initialInput: { label: 'z' },
        });
        await expectElementsOfRenderedRows(form);
        remove(form, { path: ['todos'], at: 0 });
        await vi.waitFor(() => {
          expect(getInputs()).toHaveLength(1);
        });

        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after insert, a shrinking and a regrowing setInput and reset', async () => {
        const form = setup();
        insert(form, { path: ['todos'], at: 0, initialInput: { label: 'z' } });
        await vi.waitFor(() => {
          expect(getInputs()).toHaveLength(3);
        });
        setInput(form, { path: ['todos'], input: [] });
        await vi.waitFor(() => {
          expect(getInputs()).toHaveLength(0);
        });
        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });
        await expectElementsOfRenderedRows(form);

        reset(form);

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after move and a regrowing setInput in one batch', async () => {
        const form = setup();
        move(form, { path: ['todos'], from: 0, to: 1 });
        await expectElementsOfRenderedRows(form);

        setInput(form, { path: ['todos'], input: [{ label: 'a' }] });
        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });

        await expectElementsOfRenderedRows(form);
      });

      test('should keep elements after a shrinking and a regrowing setInput and reset', async () => {
        const form = setup();
        setInput(form, { path: ['todos'], input: [] });
        await vi.waitFor(() => {
          expect(getInputs()).toHaveLength(0);
        });
        setInput(form, {
          path: ['todos'],
          input: [{ label: 'a' }, { label: 'b' }],
        });
        await expectElementsOfRenderedRows(form);

        reset(form);

        await expectElementsOfRenderedRows(form);
      });

      test('should register the element of the row of the kept item after remove and reset with keepInput', async () => {
        const form = setup();
        remove(form, { path: ['todos'], at: 0 });
        await nextTick();
        await vi.waitFor(() => {
          expect(getInputs()).toHaveLength(1);
        });

        reset(form, { keepInput: true });
        await nextTick();

        // The kept row gets the start item of its index, so it is rendered
        // anew and registers its element in the store of that index
        await vi.waitFor(() => {
          const inputs = getInputs();
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

    test('should drop a detached element from the reset baseline after the elements moved', () => {
      const schema = v.object({ name: v.string() });

      let capturedForm: FormStore<typeof schema> | undefined;

      const Test = defineComponent({
        setup() {
          const form = useForm({ schema, initialInput: { name: '' } });
          capturedForm = form;
          const field = useField(form, { path: ['name'] });
          return () => h('input', { 'data-testid': 'input', ...field.props });
        },
      });

      const wrapper = mount(Test, { attachTo: document.body });
      const element = document.querySelector('[data-testid="input"]');
      const internalFieldStore = getFieldStore(capturedForm![INTERNAL], [
        'name',
      ])!;
      expect(internalFieldStore.initialElements).toContain(element);

      // Simulate an array operation moving the elements to another store
      internalFieldStore.elements = [];

      // The detached element must not survive in the reset baseline
      wrapper.unmount();
      expect(internalFieldStore.initialElements).not.toContain(element);
    });
  });
});
