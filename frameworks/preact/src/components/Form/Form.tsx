import {
  INTERNAL,
  type Schema,
  type SubmitEventHandler,
  type SubmitHandler,
} from '@formisch/core/preact';
import { handleSubmit } from '@formisch/methods/preact';
import type { JSX } from 'preact';
import type { FormStore } from '../../types/index.ts';

/**
 * Form component props type.
 */
export type FormProps<TSchema extends Schema = Schema> = Omit<
  JSX.FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'novalidate' | 'noValidate'
> & {
  /**
   * The form store instance.
   */
  readonly of: FormStore<TSchema>;
  /**
   * The submit handler called when the form is submitted and validation succeeds.
   */
  readonly onSubmit: SubmitHandler<TSchema> | SubmitEventHandler<TSchema>;
};

/**
 * Form component that manages form submission and applies internal state.
 * Wraps form element and passes submission events to the provided handler.
 *
 * @param props The form component props.
 *
 * @returns The a native form element.
 */
export function Form<TSchema extends Schema>(
  props: FormProps<TSchema>
): JSX.Element;

// @__NO_SIDE_EFFECTS__
export function Form({ of, onSubmit, ...other }: FormProps): JSX.Element {
  return (
    <form
      {...other}
      novalidate
      ref={(element) => {
        of[INTERNAL].element = element;
      }}
      onSubmit={handleSubmit(of, onSubmit)}
    />
  );
}
