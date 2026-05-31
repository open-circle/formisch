import {
  Component,
  provideZonelessChangeDetection,
  type Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getFieldStore, INTERNAL } from '@formisch/core/angular';
import * as v from 'valibot';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { injectField, injectForm } from '../../functions/index.ts';
import type { FieldStore, FormStore } from '../../types/index.ts';
import { loadDistComponent } from '../../vitest/loadDistComponent.ts';

const Schema = v.object({ email: v.pipe(v.string(), v.email()) });

let TestHost: Type<{
  form: FormStore<typeof Schema>;
  field: FieldStore<typeof Schema, ['email']>;
}>;

describe('FormischControl', () => {
  beforeAll(async () => {
    const FormischControl = await loadDistComponent('FormischControl');

    @Component({
      standalone: true,
      imports: [FormischControl],
      template: `<input
        data-testid="input"
        [value]="field.input() ?? ''"
        [formischControl]="field"
      />`,
    })
    class TestHostComponent {
      readonly form = injectForm({ schema: Schema });
      readonly field = injectField(this.form, { path: ['email'] });
    }

    TestHost = TestHostComponent as Type<{
      form: FormStore<typeof Schema>;
      field: FieldStore<typeof Schema, ['email']>;
    }>;
  });

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

  it('updates the field value on input', () => {
    const { fixture, input } = render();
    input.value = 'test@example.com';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.field.input()).toBe('test@example.com');
  });
});
