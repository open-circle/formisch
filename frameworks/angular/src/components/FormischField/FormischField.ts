import {
  Component,
  computed,
  ContentChild,
  DestroyRef,
  inject,
  Input,
  input,
  type InputSignal,
  TemplateRef,
} from '@angular/core';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import {
  type FieldElement,
  getElementInput,
  getFieldBool,
  getFieldInput,
  getFieldStore,
  INTERNAL,
  type RequiredPath,
  type Schema,
  setFieldBool,
  setFieldInput,
  validateIfRequired,
  type ValidPath,
} from '@formisch/core/angular';
import type * as v from 'valibot';
import type { FieldStore, FormStore } from '../../types/index.ts';

/**
 * Headless field component that provides reactive field state via an Angular template.
 * Uses ContentChild TemplateRef pattern to pass the FieldStore as $implicit context.
 *
 * @example
 * ```html
 * <formisch-field [of]="form" [path]="['email']">
 *   <ng-template let-field>
 *     <input [name]="field.props.name" [value]="field.input()"
 *            (focus)="field.props.onFocus($event)"
 *            (change)="field.props.onChange($event)"
 *            (blur)="field.props.onBlur($event)" />
 *   </ng-template>
 * </formisch-field>
 * ```
 */
@Component({
  selector: 'formisch-field',
  standalone: true,
  imports: [NgIf, NgTemplateOutlet],
  template: `
    <ng-container
      *ngIf="template"
      [ngTemplateOutlet]="template"
      [ngTemplateOutletContext]="{ $implicit: field }"
    />
  `,
})
export class FormischField<
  TSchema extends Schema = Schema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input({ isSignal: true } as any) of: InputSignal<FormStore<TSchema>> = input.required<FormStore<TSchema>>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input({ isSignal: true } as any) path: InputSignal<ValidPath<v.InferInput<TSchema>, TFieldPath>> = input.required<ValidPath<v.InferInput<TSchema>, TFieldPath>>();

  @ContentChild(TemplateRef) protected template: TemplateRef<{ $implicit: FieldStore<TSchema, TFieldPath> }> | undefined;

  private readonly internalFormStore = computed(() => this.of()[INTERNAL]);
  private readonly internalFieldStore = computed(() =>
    getFieldStore(this.internalFormStore(), this.path())
  );
  private readonly destroyRef = inject(DestroyRef);

  protected readonly field: FieldStore<TSchema, TFieldPath> = (() => {
    const internalFormStore = this.internalFormStore;
    const internalFieldStore = this.internalFieldStore;
    const pathSignal = this.path;
    const destroyRef = this.destroyRef;

    destroyRef.onDestroy(() => {
      internalFieldStore().elements = internalFieldStore().elements.filter(
        (element) => element.isConnected
      );
    });

    return {
      get path() {
        return pathSignal();
      },
      input: computed(() => getFieldInput(internalFieldStore())),
      errors: computed(() => internalFieldStore().errors.value),
      isTouched: computed(() =>
        getFieldBool(internalFieldStore(), 'isTouched')
      ),
      isDirty: computed(() => getFieldBool(internalFieldStore(), 'isDirty')),
      isValid: computed(
        () => !getFieldBool(internalFieldStore(), 'errors')
      ),
      onInput(value) {
        setFieldInput(internalFormStore(), pathSignal(), value);
        validateIfRequired(
          internalFormStore(),
          internalFieldStore(),
          'input'
        );
      },
      props: {
        get name() {
          return internalFieldStore().name;
        },
        get autofocus() {
          return !!internalFieldStore().errors.value;
        },
        ref(element) {
          if (element) {
            internalFieldStore().elements.push(element as FieldElement);
          }
        },
        onFocus() {
          setFieldBool(internalFieldStore(), 'isTouched', true);
          validateIfRequired(
            internalFormStore(),
            internalFieldStore(),
            'touch'
          );
        },
        onChange(event) {
          setFieldInput(
            internalFormStore(),
            pathSignal(),
            getElementInput(
              event.currentTarget as FieldElement,
              internalFieldStore()
            )
          );
          validateIfRequired(
            internalFormStore(),
            internalFieldStore(),
            'input'
          );
          validateIfRequired(
            internalFormStore(),
            internalFieldStore(),
            'change'
          );
        },
        onBlur() {
          validateIfRequired(
            internalFormStore(),
            internalFieldStore(),
            'blur'
          );
        },
      },
    };
  })() as FieldStore<TSchema, TFieldPath>;
}
