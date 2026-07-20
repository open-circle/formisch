import type { FormSchema } from '@formisch/core/react-native';
import type { ReactElement } from 'react';
import { View, type ViewProps } from 'react-native';
import type { FormStore } from '../../types/index.ts';

/**
 * Form component props type.
 */
export type FormProps<TSchema extends FormSchema = FormSchema> = ViewProps & {
  /**
   * The form store instance.
   */
  readonly of: FormStore<TSchema>;
};

/**
 * Form component that groups fields into a single native view. Unlike the DOM
 * frameworks, React Native has no native form element or submit event, so
 * submission is triggered explicitly by calling `handleSubmit(of, onSubmit)`
 * from a button's `onPress` handler instead of wiring it up here.
 *
 * @param props The form component props.
 *
 * @returns The native view that wraps the form.
 */
export function Form<TSchema extends FormSchema>(
  props: FormProps<TSchema>
): ReactElement;

// @__NO_SIDE_EFFECTS__
export function Form({ of: _of, ...other }: FormProps): ReactElement {
  return <View {...other} />;
}
