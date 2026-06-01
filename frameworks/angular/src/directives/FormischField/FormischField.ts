import {
  Directive,
  inject,
  input,
  type InputSignal,
  type OnInit,
  TemplateRef,
  ViewContainerRef,
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
 * The template context exposed by the `*formischField` directive.
 */
export interface FormischFieldContext<
  TSchema extends FormSchema = FormSchema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  readonly $implicit: FieldStore<TSchema, TFieldPath>;
}

/**
 * Structural directive that creates a typed field store for a path and exposes
 * it as the template's implicit context. The form is passed explicitly via the
 * `of` keyword so the context guard can infer the field's value type.
 *
 * ```html
 * <ng-container *formischField="['todos', i, 'label'] of form; let field">
 *   <input [value]="field.input()" [formischControl]="field" />
 * </ng-container>
 * ```
 */
@Directive({
  selector: '[formischField]',
  standalone: true,
})
export class FormischField<
  TSchema extends FormSchema = FormSchema,
  TFieldPath extends RequiredPath = RequiredPath,
> implements OnInit
{
  /**
   * The path to the field within the form schema.
   */
  readonly formischField: InputSignal<
    ValidPath<v.InferInput<TSchema>, TFieldPath>
  > = input.required<ValidPath<v.InferInput<TSchema>, TFieldPath>>();
  /**
   * The form store the field belongs to.
   */
  readonly formischFieldOf: InputSignal<FormStore<TSchema>> =
    input.required<FormStore<TSchema>>();

  private readonly templateRef =
    inject<TemplateRef<FormischFieldContext<TSchema, TFieldPath>>>(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly field: FieldStore<TSchema, TFieldPath> = injectField<
    TSchema,
    TFieldPath
  >(this.formischFieldOf, { path: this.formischField });

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.templateRef, {
      $implicit: this.field,
    });
  }

  static ngTemplateContextGuard<
    TSchema extends FormSchema,
    TFieldPath extends RequiredPath,
  >(
    _directive: FormischField<TSchema, TFieldPath>,
    _context: unknown
  ): _context is FormischFieldContext<TSchema, TFieldPath> {
    return true;
  }
}
