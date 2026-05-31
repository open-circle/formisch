import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  contentChild,
  input,
  type InputSignal,
  type Signal,
  TemplateRef,
} from '@angular/core';
import {
  type FormSchema,
  type RequiredPath,
  type ValidArrayPath,
} from '@formisch/core/angular';
import type * as v from 'valibot';
import { injectFieldArray } from '../../functions/index.ts';
import type { FieldArrayStore, FormStore } from '../../types/index.ts';

/**
 * Headless field array component that provides reactive field array state via an Angular template.
 * Uses ContentChild TemplateRef pattern to pass the FieldArrayStore as $implicit context.
 *
 * @example
 * ```html
 * <formisch-field-array [of]="form" [path]="['todos']">
 *   <ng-template let-fieldArray>
 *     @for (item of fieldArray.items(); track item) {
 *       ...
 *     }
 *   </ng-template>
 * </formisch-field-array>
 * ```
 */
@Component({
  selector: 'formisch-field-array',
  standalone: true,
  imports: [NgTemplateOutlet],
  // Render as a block-level box so the projected content participates in the
  // surrounding layout (flex and `space-y` spacing) like a plain element would.
  styles: ':host { display: block; }',
  template: `
    @if (template()) {
      <ng-container
        [ngTemplateOutlet]="template()!"
        [ngTemplateOutletContext]="{ $implicit: fieldArray }"
      />
    }
  `,
})
export class FormischFieldArray<
  TSchema extends FormSchema = FormSchema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> {
  readonly of: InputSignal<FormStore<TSchema>> =
    input.required<FormStore<TSchema>>();
  readonly path: InputSignal<
    ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>
  > = input.required<ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>>();

  protected readonly template: Signal<TemplateRef<unknown> | undefined> =
    contentChild(TemplateRef);
  protected readonly fieldArray: FieldArrayStore<TSchema, TFieldArrayPath> =
    injectFieldArray<TSchema, TFieldArrayPath>(this.of, {
      path: this.path,
    });
}
