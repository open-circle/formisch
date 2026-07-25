import {
  Component,
  provideZonelessChangeDetection,
  signal,
  type WritableSignal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getFieldStore, INTERNAL } from '@formisch/core/angular';
import * as v from 'valibot';
import { beforeEach, describe, expect, it } from 'vitest';
import { injectForm } from '../../functions/index.ts';
import { FormischControl } from '../FormischControl/index.ts';
import { FormischField } from './FormischField.ts';

const Schema = v.object({ email: v.pipe(v.string(), v.email()) });

@Component({
  standalone: true,
  imports: [FormischField, FormischControl],
  template: `<ng-container *formischField="['email'] of form; let field">
    <input
      data-testid="input"
      [value]="field.input() ?? ''"
      [formischControl]="field"
    />
    <span data-testid="dirty">{{ field.isDirty() }}</span>
  </ng-container>`,
})
class TestHost {
  readonly form = injectForm({
    schema: Schema,
    initialInput: { email: 'jane@example.com' },
  });
}

describe('FormischField', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  function render() {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      input: root.querySelector<HTMLInputElement>('[data-testid="input"]')!,
      dirty: root.querySelector('[data-testid="dirty"]')!,
    };
  }

  it('renders the template and provides the field as context', () => {
    const { input } = render();
    expect(input).not.toBeNull();
    // The name attribute is set by [formischControl] from the field name,
    // proving the field store flowed through the context.
    expect(input.getAttribute('name')).toBe('["email"]');
  });

  it('exposes the current field input through the context', () => {
    const { input } = render();
    expect(input.value).toBe('jane@example.com');
  });

  it('updates the context reactively when the field changes', async () => {
    const { fixture, input, dirty } = render();
    expect(dirty.textContent).toBe('false');

    input.value = 'john@example.com';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(dirty.textContent).toBe('true');
  });

  it('registers the field element so the form store can reach it', async () => {
    const { fixture, input } = render();
    await fixture.whenStable();
    const internalFieldStore = getFieldStore(
      fixture.componentInstance.form[INTERNAL],
      ['email']
    );
    expect(internalFieldStore.elements).toContain(input);
  });

  it('narrows the template context through its type guard', () => {
    // The guard exists purely so the compiler types `let field`; it is part of
    // the public surface of the directive, so its runtime result is asserted.
    expect(
      FormischField.ngTemplateContextGuard(
        null as unknown as FormischField<typeof Schema, ['email']>,
        {}
      )
    ).toBe(true);
  });
});

const ArraySchema = v.object({
  items: v.array(v.object({ label: v.string() })),
});

@Component({
  standalone: true,
  imports: [FormischField, FormischControl],
  template: `<ng-container
    *formischField="['items', index(), 'label'] of form; let field"
  >
    <input data-testid="input" [formischControl]="field" />
  </ng-container>`,
})
class DynamicPathHost {
  readonly form = injectForm({
    schema: ArraySchema,
    initialInput: { items: [{ label: 'first' }, { label: 'second' }] },
  });
  readonly index: WritableSignal<number> = signal(0);
}

describe('FormischField dynamic path', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DynamicPathHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('re-targets the field when the path input changes', async () => {
    const fixture = TestBed.createComponent(DynamicPathHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>('[data-testid="input"]')!;
    expect(input.getAttribute('name')).toBe('["items",0,"label"]');

    fixture.componentInstance.index.set(1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(input.getAttribute('name')).toBe('["items",1,"label"]');
  });
});
