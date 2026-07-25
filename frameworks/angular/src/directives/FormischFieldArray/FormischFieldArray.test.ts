import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { insert, move, remove } from '@formisch/methods/angular';
import * as v from 'valibot';
import { beforeEach, describe, expect, it } from 'vitest';
import { injectForm } from '../../functions/index.ts';
import { FormischFieldArray } from './FormischFieldArray.ts';

const Schema = v.object({ items: v.array(v.string()) });

@Component({
  standalone: true,
  imports: [FormischFieldArray],
  template: `<ng-container
    *formischFieldArray="['items'] of form; let fieldArray"
  >
    @for (item of fieldArray.items(); track item) {
      <span data-testid="item">{{ item }}</span>
    }
    <span data-testid="dirty">{{ fieldArray.isDirty() }}</span>
  </ng-container>`,
})
class TestHost {
  readonly form = injectForm({
    schema: Schema,
    initialInput: { items: ['a', 'b', 'c'] },
  });
}

describe('FormischFieldArray', () => {
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
      items: () => root.querySelectorAll('[data-testid="item"]'),
      dirty: () => root.querySelector('[data-testid="dirty"]')!.textContent,
    };
  }

  it('renders one item per array entry from the field array context', () => {
    const { items } = render();
    expect(items().length).toBe(3);
  });

  it('renders a stable item id per entry', () => {
    const { items } = render();
    const ids = [...items()].map((item) => item.textContent);
    expect(new Set(ids).size).toBe(3);
  });

  it('re-renders when an item is inserted', () => {
    const { fixture, items } = render();
    insert(fixture.componentInstance.form, {
      path: ['items'],
      initialInput: 'd',
    });
    fixture.detectChanges();
    expect(items().length).toBe(4);
  });

  it('re-renders when an item is removed', () => {
    const { fixture, items } = render();
    remove(fixture.componentInstance.form, { path: ['items'], at: 0 });
    fixture.detectChanges();
    expect(items().length).toBe(2);
  });

  it('reorders the rendered items when an item is moved', () => {
    const { fixture, items } = render();
    const [first, second] = [...items()].map((item) => item.textContent);

    move(fixture.componentInstance.form, { path: ['items'], from: 0, to: 1 });
    fixture.detectChanges();

    const reordered = [...items()].map((item) => item.textContent);
    expect(reordered[0]).toBe(second);
    expect(reordered[1]).toBe(first);
  });

  it('exposes the field array state reactively', () => {
    const { fixture, dirty } = render();
    expect(dirty()).toBe('false');

    insert(fixture.componentInstance.form, {
      path: ['items'],
      initialInput: 'd',
    });
    fixture.detectChanges();

    expect(dirty()).toBe('true');
  });

  it('narrows the template context through its type guard', () => {
    // The guard exists purely so the compiler types `let fieldArray`; it is
    // part of the public surface of the directive, so its runtime result is
    // asserted.
    expect(
      FormischFieldArray.ngTemplateContextGuard(
        null as unknown as FormischFieldArray<typeof Schema, ['items']>,
        {}
      )
    ).toBe(true);
  });
});
