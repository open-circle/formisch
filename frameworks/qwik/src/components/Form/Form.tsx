import { INTERNAL, type Schema, type SubmitHandler } from '@formisch/core/qwik';
import { handleSubmit } from '@formisch/methods/qwik';
import type { JSXOutput, PropsOf, QRL } from '@qwik.dev/core';
import { component$, Slot } from '@qwik.dev/core';
import type { FormStore } from '../../types/index.ts';

/**
 * Form component props type.
 */
export type FormProps<TSchema extends Schema = Schema> = Omit<
  PropsOf<'form'>,
  'onSubmit$' | 'noValidate'
> & {
  /**
   * The form store instance.
   */
  readonly of: FormStore<TSchema>;
  /**
   * The submit handler called when the form is submitted and validation succeeds.
   */
  readonly onSubmit$: QRL<SubmitHandler<TSchema>>;
};

/**
 * Form component that manages form submission and applies internal state.
 * Wraps form element and passes submission events to the provided handler.
 *
 * @returns The a native form element.
 */
export const Form = component$(
  <TSchema extends Schema>({
    of,
    onSubmit$,
    ...other
  }: FormProps<TSchema>): JSXOutput => {
    return (
      <form
        {...other}
        noValidate
        preventdefault:submit
        ref={(element) => {
          of[INTERNAL].element = element;
        }}
        onSubmit$={(event) => handleSubmit(of, onSubmit$)(event)}
      >
        <Slot />
      </form>
    );
  }
);
