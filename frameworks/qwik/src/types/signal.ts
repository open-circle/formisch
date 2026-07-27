/**
 * Readonly signal interface.
 *
 * Note: This is a structural equivalent of Qwik's `Readonly<Signal<T>>`. It
 * is used instead because eslint-plugin-qwik's `valid-lexical-scope` rule
 * only recognizes signals by a type name ending in "Signal" and therefore
 * reports false positives for `Readonly<Signal<T>>`. It can be removed once
 * this is fixed upstream.
 */
export interface ReadonlySignal<T> {
  /**
   * The value of the signal. Reading it in a reactive context subscribes to
   * updates.
   */
  readonly value: T;
  /**
   * The value of the signal without subscribing to updates.
   */
  readonly untrackedValue: T;
  /**
   * Triggers subscribers of the signal, for example when the value was
   * mutated but remained the same object.
   */
  trigger(): void;
}
