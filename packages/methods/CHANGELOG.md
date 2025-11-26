# Changelog

All notable changes to the library will be documented in this file.

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
