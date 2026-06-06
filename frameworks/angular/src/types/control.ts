import type { FieldElement } from '@formisch/core/angular';

/**
 * Internal key for the element-binding contract a field exposes to the
 * `[formischControl]` directive. Not part of the public API.
 */
export const CONTROL = '~control' as const;

/**
 * The element-binding contract consumed by the `[formischControl]` directive.
 */
export interface FieldControl {
  /**
   * Registers the field element and returns a cleanup function that
   * unregisters it.
   */
  readonly ref: (element: FieldElement | null) => (() => void) | undefined;
  /**
   * Updates the field input and validates on the `input` event.
   */
  readonly onInput: (event: Event) => void;
  /**
   * Validates on the `change` event.
   */
  readonly onChange: () => void;
  /**
   * Marks the field as touched and validates on the `focus` event.
   */
  readonly onFocus: () => void;
  /**
   * Validates on the `blur` event.
   */
  readonly onBlur: () => void;
}
