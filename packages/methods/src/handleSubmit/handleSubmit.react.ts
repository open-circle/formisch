import {
  type BaseFormStore,
  type Schema,
  type SubmitHandler,
} from '@formisch/core/react';
import type { FormEvent } from 'react';
import { handleSubmit as baseHandleSubmit } from './handleSubmit.ts';

/**
 * Creates a submit event handler for the form that prevents default browser
 * submission, validates the form input, and calls the provided handler if
 * validation succeeds. This is designed to be used with the form's onsubmit event.
 *
 * @param form The form store to handle submission for.
 * @param handler The submit handler function called with validated output if validation succeeds.
 *
 * @returns A submit event handler function to attach to the form element.
 */
export function handleSubmit<TSchema extends Schema>(
  form: BaseFormStore<TSchema>,
  handler: SubmitHandler<TSchema>
): (event: FormEvent<HTMLFormElement>) => Promise<void>;

// @__NO_SIDE_EFFECTS__
export function handleSubmit(
  form: BaseFormStore,
  handler: SubmitHandler<Schema>
): (event: FormEvent<HTMLFormElement>) => Promise<void> {
  // @ts-expect-error: SubmitHandler uses FormEvent but base uses SubmitEvent
  return baseHandleSubmit(form, handler);
}
