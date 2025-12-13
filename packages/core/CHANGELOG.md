# Changelog

All notable changes to the library will be documented in this file.

## vX.X.X (Month DD, YYYY)

- Fix `initialInput` passed to `initializeFieldStore` for nullish wrapper schemas (pull request #48)

## v0.4.4 (December 11, 2025)

- Fix `setFieldInput` not setting input if path is empty array (issue #46)

## v0.4.3 (November 29, 2025)

- Fix radio button value handling in `getElementInput` (pull request #39)

## v0.4.2 (November 25, 2025)

- Fix `isDirty` to handle `null` like `undefined` for empty string and `NaN` comparisons (pull request #40)

## v0.4.1 (October 27, 2025)

- Fix bug when setting array input with more array items than previous state (pull request #29)

## v0.4.0 (September 22, 2025)

- Add new `initialElements` state to `InternalBaseStore` interface and update `initializeFieldStore`
- Change interfaces of `InternalFieldStore` to support `null` and `undefined` values for arrays and objects (issue #15)
- Fix bug in `copyItemState`, `resetItemState` and `swapItemState` by including `elements` and `errors` state

## v0.3.1 (September 13, 2025)

- Fix `setFieldInput` and `setInitialFieldInput` for nullish arrays and objects (issue #15)

## v0.3.0 (August 17, 2025)

- Change implementation of `setFieldInput` to set `isTouched` to `true`
- Fix `PathValue`, `ValidPath` and `ValidArrayPath` for optional properties (issue #13)

## v0.2.0 (July 27, 2025)

- Change name of `validate` method to `parse` in internal form store
- Change name of `validateOn` config to `validate` in internal form store
- Change name of `revalidateOn` config to `revalidate` in internal form store
- Fix bug in `resetItemState` by also resetting `.errors` signals

## v0.1.0 (July 14, 2025)

- Initial release
