import {
  Component,
  provideZonelessChangeDetection,
  type Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { INTERNAL } from '@formisch/core/angular';
import * as v from 'valibot';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { injectForm } from '../../functions/index.ts';
import type { FormStore } from '../../types/index.ts';
import { loadDistComponent } from '../../vitest/loadDistComponent.ts';

const Schema = v.object({
  email: v.pipe(v.string(), v.nonEmpty(), v.email()),
});

let TestHost: Type<{
  form: FormStore<typeof Schema>;
  submitted: v.InferOutput<typeof Schema> | undefined;
}>;

describe('FormischForm', () => {
  beforeAll(async () => {
    const FormischForm = await loadDistComponent('FormischForm');

    @Component({
      standalone: true,
      imports: [FormischForm],
      template: `<form
        [formischForm]="form"
        (formischSubmit)="submitted = $event"
      >
        <button type="submit" data-testid="submit">Submit</button>
      </form>`,
    })
    class TestHostComponent {
      readonly form = injectForm({
        schema: Schema,
        initialInput: { email: 'jane@example.com' },
      });
      submitted: v.InferOutput<typeof Schema> | undefined = undefined;
    }

    TestHost = TestHostComponent as Type<{
      form: FormStore<typeof Schema>;
      submitted: v.InferOutput<typeof Schema> | undefined;
    }>;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('sets novalidate on the form element', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    expect(form?.hasAttribute('novalidate')).toBe(true);
  });

  it('registers the form element on the store', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    expect(fixture.componentInstance.form[INTERNAL].element).toBe(form);
  });

  it('emits the validated output when a valid form is submitted', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.submitted).toEqual({
      email: 'jane@example.com',
    });
  });
});
