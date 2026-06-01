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
  type ValidArrayPath,
} from '@formisch/core/angular';
import type * as v from 'valibot';
import { injectFieldArray } from '../../functions/index.ts';
import type { FieldArrayStore, FormStore } from '../../types/index.ts';

/**
 * The template context exposed by the `*formischFieldArray` directive.
 */
export interface FormischFieldArrayContext<
  TSchema extends FormSchema = FormSchema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> {
  readonly $implicit: FieldArrayStore<TSchema, TFieldArrayPath>;
}

/**
 * Structural directive that creates a typed field array store for a path and
 * exposes it as the template's implicit context. The form is passed explicitly
 * via the `of` keyword so the context guard can infer the array type.
 *
 * ```html
 * <ng-container *formischFieldArray="['todos'] of form; let fieldArray">
 *   &commat;for (item of fieldArray.items(); track item) { … }
 * </ng-container>
 * ```
 */
@Directive({
  selector: '[formischFieldArray]',
  standalone: true,
})
export class FormischFieldArray<
  TSchema extends FormSchema = FormSchema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> implements OnInit
{
  /**
   * The path to the field array within the form schema.
   */
  readonly formischFieldArray: InputSignal<
    ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>
  > = input.required<ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>>();
  /**
   * The form store the field array belongs to.
   */
  readonly formischFieldArrayOf: InputSignal<FormStore<TSchema>> =
    input.required<FormStore<TSchema>>();

  private readonly templateRef =
    inject<TemplateRef<FormischFieldArrayContext<TSchema, TFieldArrayPath>>>(
      TemplateRef
    );
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly fieldArray: FieldArrayStore<TSchema, TFieldArrayPath> =
    injectFieldArray<TSchema, TFieldArrayPath>(this.formischFieldArrayOf, {
      path: this.formischFieldArray,
    });

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.templateRef, {
      $implicit: this.fieldArray,
    });
  }

  static ngTemplateContextGuard<
    TSchema extends FormSchema,
    TFieldArrayPath extends RequiredPath,
  >(
    _directive: FormischFieldArray<TSchema, TFieldArrayPath>,
    _context: unknown
  ): _context is FormischFieldArrayContext<TSchema, TFieldArrayPath> {
    return true;
  }
}
