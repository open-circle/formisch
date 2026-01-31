# Changelog

All notable changes to the library will be documented in this file.

## vX.X.X (Month DD, YYYY)

- Add React-specific `handleSubmit` method using `FormEvent` type from React
- Rename `vanilla` build target in favor of dedicated `react` target

## v0.5.2 (December 11, 2025)

- Change `@formisch/core` to v0.4.4

## v0.5.1 (November 28, 2025)

- Fix return type of `handleSubmit` method to return a function that returns a Promise (issue #41)

## v0.5.0 (November 25, 2025)

- Add support for returning error messages of normal objects in `handleSubmit` method (pull request #11)
- Fix `isDirty` in `reset` to handle `null` like `undefined` for empty string and `NaN` comparisons (pull request #40)

## v0.4.1 (October 31, 2025)

- Fix bug in `move` method that corrupted item state when moving array items

## v0.4.0 (October 27, 2025)

- Fix `focus` method to accept `form` as first parameter

## v0.3.0 (September 22, 2025)

- Change `@formisch/core` to v0.4.0
- Fix bug with `elements` state by resetting it to `initialElements` state

## v0.2.0 (July 27, 2025)

- Add `handleSubmit` method for form submission handling

## v0.1.0 (July 14, 2025)

- Initial release
