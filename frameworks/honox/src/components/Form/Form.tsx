import {
  type FormSchema,
  INTERNAL,
  type SubmitEventHandler,
} from '@formisch/core/honox';
import { handleSubmit } from '@formisch/methods/honox';
import type { JSX } from 'hono/jsx/jsx-runtime';
import type { FormStore } from '../../types/index.ts';

/**
 * Form component props type.
 */
export type FormProps<TSchema extends FormSchema = FormSchema> = Omit<
  JSX.IntrinsicElements['form'],
  'onSubmit' | 'novalidate' | 'ref'
> & {
  /**
   * The form store instance.
   */
  readonly of: FormStore<TSchema>;
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
export function Form({ of, onSubmit, ...other }: FormProps): JSX.Element {
  return (
    <form
      {...other}
      novalidate
      ref={(element: HTMLFormElement | null) => {
        if (element) {
          of[INTERNAL].element = element;
        }
      }}
      onSubmit={handleSubmit(of, onSubmit)}
    />
  );
}
