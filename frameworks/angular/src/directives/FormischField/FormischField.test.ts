import {
  Component,
  provideZonelessChangeDetection,
  type Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as v from 'valibot';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { injectForm } from '../../functions/index.ts';
import type { FormStore } from '../../types/index.ts';
import { loadDistComponent } from '../../vitest/loadDistComponent.ts';

const Schema = v.object({ email: v.pipe(v.string(), v.email()) });

let TestHost: Type<{ form: FormStore<typeof Schema> }>;

describe('FormischField', () => {
  beforeAll(async () => {
    const FormischField = await loadDistComponent('FormischField');
    const FormischControl = await loadDistComponent('FormischControl');

    @Component({
      standalone: true,
      imports: [FormischField, FormischControl],
      template: `<ng-container *formischField="['email'] of form; let field">
        <input
          data-testid="input"
          [value]="field.input() ?? ''"
          [formischControl]="field"
        />
      </ng-container>`,
    })
    class TestHostComponent {
      readonly form = injectForm({ schema: Schema });
    }

    TestHost = TestHostComponent as Type<{ form: FormStore<typeof Schema> }>;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders the template and provides the field as context', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="input"]'
    );
    expect(input).not.toBeNull();
    // The name attribute is set by [formischControl] from the field name,
    // proving the field store flowed through the context.
    expect(input?.getAttribute('name')).toBe('["email"]');
  });
});
