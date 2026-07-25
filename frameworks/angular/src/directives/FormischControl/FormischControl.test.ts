import {
  ApplicationRef,
  Component,
  computed,
  provideZonelessChangeDetection,
  signal,
  type WritableSignal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getFieldStore, INTERNAL } from '@formisch/core/angular';
import { setErrors } from '@formisch/methods/angular';
import * as v from 'valibot';
import { beforeEach, describe, expect, it } from 'vitest';
import { injectField, injectForm } from '../../functions/index.ts';
import { FormischControl } from './FormischControl.ts';

const Schema = v.object({ email: v.pipe(v.string(), v.email()) });

@Component({
  standalone: true,
  imports: [FormischControl],
  template: `<input
    data-testid="input"
    [formischControl]="field"
    #directive="formischControl"
  />`,
})
class TestHost {
  readonly form = injectForm({ schema: Schema });
  readonly field = injectField(this.form, { path: ['email'] });
}

describe('FormischControl', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  function render() {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const input = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>('[data-testid="input"]')!;
    return { fixture, input };
  }

  it('sets the name attribute from the field name', () => {
    const { input } = render();
    expect(input.getAttribute('name')).toBe('["email"]');
  });

  it('registers the element with the field', async () => {
    const { fixture, input } = render();
    await fixture.whenStable();
    const internalFieldStore = getFieldStore(
      fixture.componentInstance.form[INTERNAL],
      ['email']
    );
    expect(internalFieldStore.elements).toContain(input);
  });

  it('unregisters the element on destroy', async () => {
    const { fixture, input } = render();
    await fixture.whenStable();
    const internalFieldStore = getFieldStore(
      fixture.componentInstance.form[INTERNAL],
      ['email']
    );
    expect(internalFieldStore.elements).toContain(input);

    fixture.destroy();

    expect(internalFieldStore.elements).not.toContain(input);
  });

  it('updates the field value on input', async () => {
    const { fixture, input } = render();
    input.value = 'test@example.com';
    input.dispatchEvent(new Event('input'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fixture.componentInstance.field.input()).toBe('test@example.com');
  });

  it('marks the field as touched on focus', () => {
    const { fixture, input } = render();
    expect(fixture.componentInstance.field.isTouched()).toBe(false);
    input.dispatchEvent(new Event('focus'));
    expect(fixture.componentInstance.field.isTouched()).toBe(true);
  });

  it('is exportable as formischControl in template references', () => {
    const { fixture } = render();
    const directive = fixture.debugElement.children[0].references[
      'directive'
    ] as { formischControl(): unknown };
    expect(directive.formischControl()).toBe(fixture.componentInstance.field);
  });

  it('sets the aria-invalid attribute from the field errors', () => {
    const { fixture, input } = render();
    expect(input.getAttribute('aria-invalid')).toBe('false');
    setErrors(fixture.componentInstance.form, {
      path: ['email'],
      errors: ['Custom error'],
    });
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('writes programmatic input updates into the element', () => {
    const { fixture, input } = render();
    // In TestBed, afterRenderEffect callbacks only run during an
    // ApplicationRef tick, which fixture.detectChanges() does not trigger
    const appRef = TestBed.inject(ApplicationRef);
    appRef.tick();
    fixture.componentInstance.field.setInput('test@example.com');
    appRef.tick();
    expect(input.value).toBe('test@example.com');
  });
});

@Component({
  standalone: true,
  imports: [FormischControl],
  template: `<input data-testid="input" [formischControl]="field" />`,
})
class InitialHost {
  readonly form = injectForm({
    schema: Schema,
    initialInput: { email: 'initial@example.com' },
  });
  readonly field = injectField(this.form, { path: ['email'] });
}

describe('FormischControl initial value', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InitialHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('writes the initial field input into the element', () => {
    const fixture = TestBed.createComponent(InitialHost);
    fixture.detectChanges();
    // In TestBed, afterRenderEffect callbacks only run during an
    // ApplicationRef tick, which fixture.detectChanges() does not trigger
    TestBed.inject(ApplicationRef).tick();
    const input = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>('[data-testid="input"]')!;
    expect(input.value).toBe('initial@example.com');
  });
});

@Component({
  standalone: true,
  imports: [FormischControl],
  template: `<input data-testid="input" [formischControl]="field" />`,
})
class ChangeHost {
  readonly form = injectForm({ schema: Schema, validate: 'change' });
  readonly field = injectField(this.form, { path: ['email'] });
}

@Component({
  standalone: true,
  imports: [FormischControl],
  template: `<input data-testid="input" [formischControl]="field" />`,
})
class BlurHost {
  readonly form = injectForm({ schema: Schema, validate: 'blur' });
  readonly field = injectField(this.form, { path: ['email'] });
}

describe('FormischControl validation events', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChangeHost, BlurHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it.each([
    ['change', ChangeHost],
    ['blur', BlurHost],
  ])('validates the form on %s', async (event, host) => {
    const fixture = TestBed.createComponent(host);
    fixture.detectChanges();
    const input = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>('[data-testid="input"]')!;
    expect(fixture.componentInstance.field.errors()).toBeNull();

    input.dispatchEvent(new Event(event));
    await fixture.whenStable();

    expect(fixture.componentInstance.field.errors()).not.toBeNull();
  });
});

const SelectSchema = v.object({ select: v.optional(v.string()) });

@Component({
  standalone: true,
  imports: [FormischControl],
  template: `<select data-testid="select" [formischControl]="field">
    @for (option of options(); track option) {
      <option [value]="option"></option>
    }
  </select>`,
})
class SelectHost {
  readonly form = injectForm({ schema: SelectSchema });
  readonly field = injectField(this.form, { path: ['select'] });
  readonly options: WritableSignal<string[]> = signal(['option_1']);
}

describe('FormischControl select resync', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SelectHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('re-applies the selection when the matching option renders later', async () => {
    const fixture = TestBed.createComponent(SelectHost);
    fixture.detectChanges();
    const appRef = TestBed.inject(ApplicationRef);
    appRef.tick();
    const select = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLSelectElement>('[data-testid="select"]')!;

    // The written value has no matching option yet
    fixture.componentInstance.field.setInput('option_2');
    appRef.tick();
    expect(select.value).toBe('');

    // Rendering the matching option must re-apply the selection
    fixture.componentInstance.options.set(['option_1', 'option_2']);
    appRef.tick();
    await new Promise((resolve) => setTimeout(resolve));
    expect(select.value).toBe('option_2');
  });
});

const SwapSchema = v.object({ a: v.string(), b: v.string() });

@Component({
  standalone: true,
  imports: [FormischControl],
  template: `<input
    data-testid="input"
    [formischControl]="useA() ? fieldA : fieldB"
  />`,
})
class SwapHost {
  readonly form = injectForm({ schema: SwapSchema });
  readonly fieldA = injectField(this.form, { path: ['a'] });
  readonly fieldB = injectField(this.form, { path: ['b'] });
  readonly useA: WritableSignal<boolean> = signal(true);
}

describe('FormischControl re-registration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SwapHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('re-registers the element when the bound field changes', async () => {
    const fixture = TestBed.createComponent(SwapHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>('[data-testid="input"]')!;
    const internalFormStore = fixture.componentInstance.form[INTERNAL];
    const fieldAStore = getFieldStore(internalFormStore, ['a']);
    const fieldBStore = getFieldStore(internalFormStore, ['b']);

    expect(fieldAStore.elements).toContain(input);
    expect(fieldBStore.elements).not.toContain(input);

    fixture.componentInstance.useA.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fieldAStore.elements).not.toContain(input);
    expect(fieldBStore.elements).toContain(input);
  });
});

const PathSchema = v.object({
  items: v.array(v.object({ label: v.string() })),
});

@Component({
  standalone: true,
  imports: [FormischControl],
  template: `<input data-testid="input" [formischControl]="field" />`,
})
class PathHost {
  readonly form = injectForm({
    schema: PathSchema,
    initialInput: { items: [{ label: 'first' }, { label: 'second' }] },
  });
  readonly index: WritableSignal<number> = signal(0);
  readonly field = injectField(this.form, {
    path: computed(() => ['items', this.index(), 'label'] as const),
  });
}

describe('FormischControl path changes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PathHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('re-registers the element when only the field path changes', async () => {
    const fixture = TestBed.createComponent(PathHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>('[data-testid="input"]')!;
    const internalFormStore = fixture.componentInstance.form[INTERNAL];
    const firstStore = getFieldStore(internalFormStore, ['items', 0, 'label']);
    const secondStore = getFieldStore(internalFormStore, ['items', 1, 'label']);

    expect(firstStore.elements).toContain(input);
    expect(secondStore.elements).not.toContain(input);

    // The bound field store object stays the same here — only the path it
    // resolves to changes. Re-registration therefore relies on the effect
    // tracking the resolved field store, not just the field store input.
    fixture.componentInstance.index.set(1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(firstStore.elements).not.toContain(input);
    expect(secondStore.elements).toContain(input);
  });
});
