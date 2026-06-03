import {
  Component,
  provideExperimentalZonelessChangeDetection,
  type Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as v from 'valibot';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { injectField, injectForm } from '../../functions/index.ts';
import { loadDistComponent } from '../../vitest/loadDistComponent.ts';

const Schema = v.object({ email: v.pipe(v.string(), v.email()) });

let TestHost: Type<unknown>;

describe('FormischFieldElementDirective', () => {
  beforeAll(async () => {
    const FormischFieldElementDirective = await loadDistComponent(
      'FormischFieldElementDirective'
    );

    @Component({
      standalone: true,
      imports: [FormischFieldElementDirective],
      template: `<input [formischFieldElement]="field" data-testid="input" />`,
    })
    class TestHostComponent {
      readonly form = injectForm({ schema: Schema });
      readonly field = injectField(this.form, { path: ['email'] });
    }

    TestHost = TestHostComponent;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
  });

  function getInput(fixture: ReturnType<typeof TestBed.createComponent>): HTMLInputElement {
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '[data-testid="input"]'
    );
    if (!input) throw new Error('Expected input element to render.');
    return input;
  }

  function getField(fixture: ReturnType<typeof TestBed.createComponent>) {
    return (fixture.componentInstance as { field: ReturnType<typeof injectField<typeof Schema, ['email']>> }).field;
  }

  it('sets the name attribute derived from the field path', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getInput(fixture).getAttribute('name')).not.toBeNull();
  });

  it('marks the field as touched when the element receives focus', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();

    getInput(fixture).dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(getField(fixture).isTouched()).toBe(true);
  });

  it('updates the field value when the element receives an input event', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = getInput(fixture);

    input.value = 'test@example.com';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(getField(fixture).input()).toBe('test@example.com');
  });

  it('updates the field value when the element receives a change event', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = getInput(fixture);

    input.value = 'change@example.com';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(getField(fixture).input()).toBe('change@example.com');
  });
});
