import {
  type FormSchema,
  INTERNAL,
  type SubmitEventHandler,
} from '@formisch/core/solid';
import { handleSubmit } from '@formisch/methods/solid';
import { type JSX, splitProps } from 'solid-js';
import type { FormStore } from '../../types/index.ts';

/**
 * Form component props type.
 */
export type FormProps<TSchema extends FormSchema = FormSchema> = Omit<
  JSX.FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'novalidate' | 'noValidate'
> & {
  /**
   * The form store instance.
   */
  readonly of: FormStore<TSchema>;
  /**
   * The child elements to render within the form.
   */
  readonly children: JSX.Element;
  /**
   * The submit handler called when the form is submitted and validation succeeds.
   */
  readonly onSubmit: SubmitEventHandler<TSchema>;
};

/**
 * Form component that manages form submission and applies internal state.
 * Wraps a native form element and calls the provided handler with the validated
 * form output and the submit event.
 *
 * @param props The form component props.
 *
 * @returns A native form element.
 */
export function Form<TSchema extends FormSchema>(
  props: FormProps<TSchema>
): JSX.Element;

// @__NO_SIDE_EFFECTS__
export function Form(props: FormProps): JSX.Element {
  // Split props between local, config and other
  const [, other] = splitProps(props, ['of', 'onSubmit']);

  return (
    <form
      {...other}
      novalidate
      ref={(element) => {
        props.of[INTERNAL].element = element;
      }}
      onSubmit={(event) => handleSubmit(props.of, props.onSubmit)(event)}
    />
  );
}
