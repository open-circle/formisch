import {
  Component,
  computed,
  createEnvironmentInjector,
  EnvironmentInjector,
  input,
  provideZonelessChangeDetection,
  runInInjectionContext,
} from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFieldStore, INTERNAL } from '@formisch/core/angular';
import {
  insert,
  move,
  remove,
  replace,
  reset,
  setInput,
  swap,
} from '@formisch/methods/angular';
import * as v from 'valibot';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormischControl } from '../../directives/index.ts';
import { CONTROL } from '../../types/control.ts';
import type { FormStore } from '../../types/index.ts';
import { injectFieldArray } from '../injectFieldArray/index.ts';
import { injectForm } from '../injectForm/index.ts';
import { injectField } from './injectField.ts';

const Schema = v.object({
  email: v.pipe(v.string(), v.email()),
});

const TodosSchema = v.object({
  todos: v.array(v.object({ label: v.string() })),
});

@Component({
  selector: 'inject-field-row',
  standalone: true,
  imports: [FormischControl],
  template: `<input [formischControl]="field" />`,
})
class Row {
  readonly form = input.required<FormStore<typeof TodosSchema>>();
  readonly index = input.required<number>();
  readonly field = injectField(this.form, {
    path: computed(() => ['todos', this.index(), 'label'] as const),
  });
}

@Component({
  standalone: true,
  imports: [Row],
  template: `@for (id of fieldArray.items(); track id; let index = $index) {
    <inject-field-row [form]="form" [index]="index" />
  }`,
})
class RowsHost {
  readonly form = injectForm({
    schema: TodosSchema,
    initialInput: { todos: [{ label: 'a' }, { label: 'b' }] },
  });
  readonly fieldArray = injectFieldArray(this.form, { path: ['todos'] });
}

describe('injectField', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function setup() {
    return TestBed.runInInjectionContext(() => {
      const form = injectForm({ schema: Schema });
      const field = injectField(form, { path: ['email'] });
      return { form, field };
    });
  }

  it('returns the correct path', () => {
    const { field } = setup();
    expect(field.path).toEqual(['email']);
  });

  it('initializes input as a signal with an empty string', () => {
    const { field } = setup();
    expect(field.input()).toBe('');
  });

  it('initializes errors to null', () => {
    const { field } = setup();
    expect(field.errors()).toBeNull();
  });

  it('initializes isTouched to false', () => {
    const { field } = setup();
    expect(field.isTouched()).toBe(false);
  });

  it('initializes isEdited to false', () => {
    const { field } = setup();
    expect(field.isEdited()).toBe(false);
  });

  it('initializes isDirty to false', () => {
    const { field } = setup();
    expect(field.isDirty()).toBe(false);
  });

  it('marks the field as edited when setInput is called', () => {
    const { field } = setup();
    field.setInput('test@example.com');
    expect(field.isEdited()).toBe(true);
  });

  it('initializes isValid to true', () => {
    const { field } = setup();
    expect(field.isValid()).toBe(true);
  });

  it('exposes the name as a JSON-stringified path signal', () => {
    const { field } = setup();
    expect(field.name()).toBe('["email"]');
  });

  it('updates the input signal when setInput is called', () => {
    const { field } = setup();
    field.setInput('test@example.com');
    expect(field.input()).toBe('test@example.com');
  });

  it('updates the input value when the control onInput is called', () => {
    const { field } = setup();
    const element = document.createElement('input');
    element.value = 'test@example.com';
    field[CONTROL].onInput({ target: element } as unknown as Event);
    expect(field.input()).toBe('test@example.com');
  });

  it('does not change the input value when the control onChange is called', () => {
    const { field } = setup();
    field[CONTROL].onChange();
    expect(field.input()).toBe('');
  });

  it('registers and unregisters the element via the control ref', () => {
    const { form, field } = setup();
    const internalFieldStore = getFieldStore(form[INTERNAL], ['email'])!;
    const element = document.createElement('input');
    const cleanup = field[CONTROL].ref(element);
    expect(internalFieldStore.elements).toContain(element);
    expect(typeof cleanup).toBe('function');
    cleanup?.();
    expect(internalFieldStore.elements).not.toContain(element);
  });

  it('does not register an element that is already present', () => {
    const { form, field } = setup();
    const internalFieldStore = getFieldStore(form[INTERNAL], ['email'])!;
    const element = document.createElement('input');
    // Simulate an array reorder having already transferred the element
    internalFieldStore.elements.push(element);
    field[CONTROL].ref(element);
    expect(internalFieldStore.elements).toEqual([element]);
  });

  it('ignores a null element passed to the control ref', () => {
    const { form, field } = setup();
    const internalFieldStore = getFieldStore(form[INTERNAL], ['email'])!;
    expect(field[CONTROL].ref(null)).toBeUndefined();
    expect(internalFieldStore.elements).toHaveLength(0);
  });

  it('keeps initialElements in sync when unregistering the element', () => {
    const { form, field } = setup();
    const internalFieldStore = getFieldStore(form[INTERNAL], ['email'])!;
    const element = document.createElement('input');
    const cleanup = field[CONTROL].ref(element);
    expect(internalFieldStore.initialElements).toContain(element);
    cleanup?.();
    expect(internalFieldStore.initialElements).not.toContain(element);
    expect(internalFieldStore.elements).toBe(
      internalFieldStore.initialElements
    );
  });

  it('drops disconnected elements from the field store on destroy', () => {
    const injector = createEnvironmentInjector(
      [],
      TestBed.inject(EnvironmentInjector)
    );
    const { form, field } = runInInjectionContext(injector, () => {
      const form = injectForm({ schema: Schema });
      return { form, field: injectField(form, { path: ['email'] }) };
    });
    const internalFieldStore = getFieldStore(form[INTERNAL], ['email'])!;

    const connected = document.createElement('input');
    document.body.append(connected);
    const disconnected = document.createElement('input');
    field[CONTROL].ref(connected);
    field[CONTROL].ref(disconnected);
    expect(internalFieldStore.elements).toEqual([connected, disconnected]);

    injector.destroy();

    // Only the element still in the document survives, so resetting a
    // remounted field restores its live element instead of a stale one
    expect(internalFieldStore.elements).toEqual([connected]);
    expect(internalFieldStore.initialElements).toEqual([connected]);
    connected.remove();
  });

  it('does not touch initialElements when a reorder moved the elements', () => {
    const { form, field } = setup();
    const internalFieldStore = getFieldStore(form[INTERNAL], ['email'])!;
    const element = document.createElement('input');
    const cleanup = field[CONTROL].ref(element);
    const initialElements = internalFieldStore.initialElements;
    // Simulate a reorder having moved the elements to a new array
    internalFieldStore.elements = [...internalFieldStore.elements];
    cleanup?.();
    expect(internalFieldStore.initialElements).toBe(initialElements);
    expect(internalFieldStore.initialElements).toContain(element);
  });

  it('drops a detached element from the reset baseline on destroy', () => {
    const injector = createEnvironmentInjector(
      [],
      TestBed.inject(EnvironmentInjector)
    );
    const { form, field } = runInInjectionContext(injector, () => {
      const form = injectForm({ schema: Schema });
      return { form, field: injectField(form, { path: ['email'] }) };
    });
    const internalFieldStore = getFieldStore(form[INTERNAL], ['email'])!;

    const element = document.createElement('input');
    field[CONTROL].ref(element);
    expect(internalFieldStore.initialElements).toContain(element);

    // Simulate an array operation moving the elements to another store
    internalFieldStore.elements = [];

    // The detached element must not survive in the reset baseline
    injector.destroy();
    expect(internalFieldStore.initialElements).not.toContain(element);
  });

  // Note: Angular has no element props, so the rows bind their input with the
  // `formischControl` directive, which registers it through the control of
  // the field. Angular applies the changes made before a change detection in
  // one update, so both `setInput` calls are made before it runs
  it('should register the elements of rows when an array is shrunk and regrown in one batch', async () => {
    const fixture = TestBed.createComponent(RowsHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const formStore = fixture.componentInstance.form;
    expect(
      getFieldStore(formStore[INTERNAL], ['todos', 1, 'label'])!.elements
    ).toHaveLength(1);

    // The second row gets a new item, so it is rendered anew and registers
    // its element again
    setInput(formStore, { path: ['todos'], input: [{ label: 'a' }] });
    setInput(formStore, {
      path: ['todos'],
      input: [{ label: 'a' }, { label: 'b' }],
    });
    fixture.detectChanges();
    await fixture.whenStable();

    await vi.waitFor(() => {
      const inputs = [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll('input'),
      ];
      expect(inputs).toHaveLength(2);
      inputs.forEach((input, index) => {
        const { elements } = getFieldStore(formStore[INTERNAL], [
          'todos',
          index,
          'label',
        ])!;
        expect(elements).toHaveLength(1);
        expect(elements[0]).toBe(input);
      });
    });
  });

  // Note: The rows bind their input with the `formischControl` directive,
  // and the `setInput` calls of the tests with one batch are made before the
  // change detection runs (see the test above)
  describe('elements of rows after an array is shrunk and regrown', () => {
    let fixture: ComponentFixture<RowsHost>;

    async function setup(): Promise<FormStore<typeof TodosSchema>> {
      fixture = TestBed.createComponent(RowsHost);
      await update();
      return fixture.componentInstance.form;
    }

    async function update(): Promise<void> {
      fixture.detectChanges();
      await fixture.whenStable();
    }

    function getInputs(): HTMLInputElement[] {
      return [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll('input'),
      ];
    }

    async function expectElementsOfRenderedRows(
      form: FormStore<typeof TodosSchema>
    ): Promise<void> {
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

    it('should keep elements after swap and a regrowing setInput in one batch', async () => {
      const form = await setup();
      swap(form, { path: ['todos'], at: 0, and: 1 });
      await update();
      await expectElementsOfRenderedRows(form);

      setInput(form, { path: ['todos'], input: [] });
      setInput(form, {
        path: ['todos'],
        input: [{ label: 'a' }, { label: 'b' }],
      });
      await update();

      await expectElementsOfRenderedRows(form);
    });

    it('should keep elements after swap, remove and a regrowing setInput', async () => {
      const form = await setup();
      swap(form, { path: ['todos'], at: 0, and: 1 });
      await update();
      await expectElementsOfRenderedRows(form);
      remove(form, { path: ['todos'], at: 0 });
      await update();
      await vi.waitFor(() => {
        expect(getInputs()).toHaveLength(1);
      });

      setInput(form, {
        path: ['todos'],
        input: [{ label: 'a' }, { label: 'b' }],
      });
      await update();

      await expectElementsOfRenderedRows(form);
    });

    it('should keep elements after swap, a shrinking and a regrowing setInput and reset', async () => {
      const form = await setup();
      swap(form, { path: ['todos'], at: 0, and: 1 });
      await update();
      await expectElementsOfRenderedRows(form);
      setInput(form, { path: ['todos'], input: [] });
      await update();
      await vi.waitFor(() => {
        expect(getInputs()).toHaveLength(0);
      });
      setInput(form, {
        path: ['todos'],
        input: [{ label: 'a' }, { label: 'b' }],
      });
      await update();
      await expectElementsOfRenderedRows(form);

      reset(form);
      await update();

      await expectElementsOfRenderedRows(form);
    });

    it('should keep elements after replace, remove and a regrowing setInput', async () => {
      const form = await setup();
      replace(form, {
        path: ['todos'],
        at: 1,
        initialInput: { label: 'z' },
      });
      await update();
      await expectElementsOfRenderedRows(form);
      remove(form, { path: ['todos'], at: 0 });
      await update();
      await vi.waitFor(() => {
        expect(getInputs()).toHaveLength(1);
      });

      setInput(form, {
        path: ['todos'],
        input: [{ label: 'a' }, { label: 'b' }],
      });
      await update();

      await expectElementsOfRenderedRows(form);
    });

    it('should keep elements after insert, a shrinking and a regrowing setInput and reset', async () => {
      const form = await setup();
      insert(form, { path: ['todos'], at: 0, initialInput: { label: 'z' } });
      await update();
      await vi.waitFor(() => {
        expect(getInputs()).toHaveLength(3);
      });
      setInput(form, { path: ['todos'], input: [] });
      await update();
      await vi.waitFor(() => {
        expect(getInputs()).toHaveLength(0);
      });
      setInput(form, {
        path: ['todos'],
        input: [{ label: 'a' }, { label: 'b' }],
      });
      await update();
      await expectElementsOfRenderedRows(form);

      reset(form);
      await update();

      await expectElementsOfRenderedRows(form);
    });

    it('should keep elements after move and a regrowing setInput in one batch', async () => {
      const form = await setup();
      move(form, { path: ['todos'], from: 0, to: 1 });
      await update();
      await expectElementsOfRenderedRows(form);

      setInput(form, { path: ['todos'], input: [{ label: 'a' }] });
      setInput(form, {
        path: ['todos'],
        input: [{ label: 'a' }, { label: 'b' }],
      });
      await update();

      await expectElementsOfRenderedRows(form);
    });

    it('should keep elements after a shrinking and a regrowing setInput and reset', async () => {
      const form = await setup();
      setInput(form, { path: ['todos'], input: [] });
      await update();
      await vi.waitFor(() => {
        expect(getInputs()).toHaveLength(0);
      });
      setInput(form, {
        path: ['todos'],
        input: [{ label: 'a' }, { label: 'b' }],
      });
      await update();
      await expectElementsOfRenderedRows(form);

      reset(form);
      await update();

      await expectElementsOfRenderedRows(form);
    });

    it('should register the element of the row of the kept item after remove and reset with keepInput', async () => {
      const form = await setup();
      remove(form, { path: ['todos'], at: 0 });
      await update();
      await vi.waitFor(() => {
        expect(getInputs()).toHaveLength(1);
      });

      reset(form, { keepInput: true });
      await update();

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
});
