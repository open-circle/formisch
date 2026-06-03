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
  type ValidPath,
} from '@formisch/core/angular';
import type * as v from 'valibot';
import { injectField } from '../../functions/index.ts';
import type { FieldStore, FormStore } from '../../types/index.ts';

/**
 * Template context type for the FormischField content template.
 * Provides type information for the `let-field` template variable.
 */
export interface FormischFieldContext<
  TSchema extends FormSchema = FormSchema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  $implicit: FieldStore<TSchema, TFieldPath>;
}

/**
 * Headless field component that provides reactive field state via an Angular template.
 * Uses ContentChild TemplateRef pattern to pass the FieldStore as $implicit context.
 *
 * @example
 * ```html
 * <formisch-field [of]="form" [path]="['email']">
 *   <ng-template let-field>
 *     <input [formischFieldElement]="field" [value]="field.input()" />
 *   </ng-template>
 * </formisch-field>
 * ```
 */
@Component({
  selector: 'formisch-field',
  standalone: true,
  imports: [NgTemplateOutlet],
  // Render as a block-level box so the projected field participates in the
  // surrounding layout (flex and `space-y` spacing) like a plain element would.
  styles: ':host { display: block; }',
  template: `
    @if (template()) {
      <ng-container
        [ngTemplateOutlet]="template()!"
        [ngTemplateOutletContext]="{ $implicit: field }"
      />
    }
  `,
})
export class FormischField<
  TSchema extends FormSchema = FormSchema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  readonly of: InputSignal<FormStore<TSchema>> =
    input.required<FormStore<TSchema>>();
  readonly path: InputSignal<ValidPath<v.InferInput<TSchema>, TFieldPath>> =
    input.required<ValidPath<v.InferInput<TSchema>, TFieldPath>>();

  protected readonly template: Signal<TemplateRef<unknown> | undefined> =
    contentChild(TemplateRef);
  protected readonly field: FieldStore<TSchema, TFieldPath> = injectField<
    TSchema,
    TFieldPath
  >(this.of, { path: this.path });

  static ngTemplateContextGuard<
    TSchema extends FormSchema,
    TFieldPath extends RequiredPath,
  >(
    _dir: FormischField<TSchema, TFieldPath>,
    ctx: unknown
  ): ctx is FormischFieldContext<TSchema, TFieldPath> {
    return true;
  }
}
