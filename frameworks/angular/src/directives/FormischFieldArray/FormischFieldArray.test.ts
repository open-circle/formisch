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

const Schema = v.object({ items: v.array(v.string()) });

let TestHost: Type<{ form: FormStore<typeof Schema> }>;

describe('FormischFieldArray', () => {
  beforeAll(async () => {
    const FormischFieldArray = await loadDistComponent('FormischFieldArray');

    @Component({
      standalone: true,
      imports: [FormischFieldArray],
      template: `<ng-container
        *formischFieldArray="['items'] of form; let fieldArray"
      >
        @for (item of fieldArray.items(); track item) {
          <span data-testid="item">{{ item }}</span>
        }
      </ng-container>`,
    })
    class TestHostComponent {
      readonly form = injectForm({
        schema: Schema,
        initialInput: { items: ['a', 'b', 'c'] },
      });
    }

    TestHost = TestHostComponent as Type<{ form: FormStore<typeof Schema> }>;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders one item per array entry from the field array context', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const items = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '[data-testid="item"]'
    );
    expect(items.length).toBe(3);
  });
});
