import {
  INTERNAL,
  type Schema,
  type SubmitEventHandler,
  type SubmitHandler,
} from '@formisch/core/react';
import { handleSubmit } from '@formisch/methods/react';
import type { FormHTMLAttributes, ReactElement } from 'react';
import type { FormStore } from '../../types/index.ts';

/**
 * Form component props type.
 */
export type FormProps<TSchema extends Schema = Schema> = Omit<
  FormHTMLAttributes<HTMLFormElement>,
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
): ReactElement;

// @__NO_SIDE_EFFECTS__
export function Form({ of, onSubmit, ...other }: FormProps): ReactElement {
  return (
    <form
      {...other}
      noValidate
      ref={(element) => {
        if (element) {
          // eslint-disable-next-line react-hooks/immutability
          of[INTERNAL].element = element;
        }
      }}
      onSubmit={handleSubmit(of, onSubmit)}
    />
  );
}
