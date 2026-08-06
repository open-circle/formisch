import {
  type BaseFormStore,
  type FormSchema,
  type SubmitHandler,
} from '@formisch/core/react-native';
import { handleSubmit as baseHandleSubmit } from './handleSubmit.ts';

/**
 * Creates a submit handler for the form that validates the form input and
 * calls the provided handler if validation succeeds. React Native has no
 * native form submission, so the returned function is designed to be passed
 * to a button's `onPress` or a text input's `onSubmitEditing` handler.
 *
 * @param form The form store to handle submission for.
 * @param handler The submit handler function called with validated output if validation succeeds.
 *
 * @returns A submit handler function to call on press or submit editing.
 */
// @__NO_SIDE_EFFECTS__
export function handleSubmit<TSchema extends FormSchema>(
  form: BaseFormStore<TSchema>,
  handler: SubmitHandler<TSchema>
): () => Promise<void> {
  // Hint: The handler is wrapped so that it only receives the validated
  // output, since React Native has no submit event to forward.
  // @ts-expect-error - The linter checks the base implementation against the
  // browser types of `@formisch/core`, while the React Native build rewrites
  // its import to `@formisch/core/react-native`, making the types match.
  return baseHandleSubmit(form, (output) => handler(output));
}
