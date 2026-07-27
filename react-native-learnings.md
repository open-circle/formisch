# React Native Forms — Research Learnings

Research notes for the React Native framework adapter (#117, PR #137). Verified against reactnative.dev, the `react-native` TypeScript definitions, Metro docs, and the official docs of react-hook-form, Formik, and TanStack Form as of July 2026.

## 1. How React Native devs build forms

### The input primitives

React Native has no `<form>`, `<input>`, or `<select>`. Forms are composed from these components:

| Component      | Value prop          | Change handler                                  | Source                                   |
| -------------- | ------------------- | ----------------------------------------------- | ---------------------------------------- |
| `TextInput`    | `value?: string`    | `onChangeText: (text: string) => void`          | `react-native`                           |
| `Switch`       | `value?: boolean`   | `onValueChange: (value: boolean) => void`       | `react-native`                           |
| Picker         | `selectedValue?: T` | `onValueChange: (itemValue, itemIndex) => void` | `@react-native-picker/picker`            |
| Slider         | `value?: number`    | `onValueChange: (value: number) => void`        | `@react-native-community/slider`         |
| DateTimePicker | `value: Date`       | `onChange: (event, date?: Date) => void`        | `@react-native-community/datetimepicker` |

The critical pattern: **change handlers receive raw, correctly typed values** — `string`, `boolean`, `number`, `Date` — not DOM events. `TextInput` also has an event-based `onChange`, but the payload lives at `event.nativeEvent.text` (`event.target` is a numeric node handle, not an element), and nobody uses it; `onChangeText` is the idiom.

`TextInput` focus/blur events exist (`onFocus`/`onBlur` receive `NativeSyntheticEvent<TextInputFocusEventData>`), plus `onSubmitEditing` which fires when the keyboard's return key is pressed.

Keyboard/UX props that a form library's docs should be aware of: `keyboardType` (`'email-address'`, `'numeric'`, …), `inputMode` (HTML-parity, takes precedence), `autoCapitalize`, `autoComplete` (cross-platform autofill), `textContentType` (iOS keychain/autofill), `secureTextEntry`, `returnKeyType` (`'next'`, `'send'`, `'done'`, …), `submitBehavior: 'submit' | 'blurAndSubmit' | 'newline'` (replaces deprecated `blurOnSubmit`), `autoFocus`, `editable`/`readOnly`, `maxLength`.

### Controlled is the only model

There is no ref-based value reading (`input.value` does not exist) and no `name` attribute, so uncontrolled DOM-style registration (react-hook-form's classic `register()`) is impossible. Every RN form binds `value` + change handler per field. `defaultValue` exists for uncontrolled text, but no library builds on it.

Historically, controlled `TextInput` had flicker/cursor-jump problems because the async bridge raced fast typing (facebook/react-native#24585). The New Architecture (Fabric/JSI, default since RN 0.76, Oct 2024) made JS↔native communication synchronous and fixed this class of bugs. Controlled inputs are now the accepted default; per-field re-render granularity (react-hook-form's `useController`) is the current performance bar — which fine-grained signals can meet or beat.

### Submit

No form element, no submit event, no `preventDefault`, and RN's global `FormData` is a partial network polyfill (`append`/`getAll`/`getParts` only — no iteration), unusable for form serialization. Submission is just a function call:

- `<Button title="Submit" onPress={handleSubmit} />` or `Pressable onPress`
- `onSubmitEditing={handleSubmit}` on the last field with `returnKeyType="send"`
- Often preceded by `Keyboard.dismiss()`

### Focus management

Purely imperative: keep a ref per `TextInput` and call `ref.current?.focus()` / `.blur()`. There is no `document.activeElement` (closest: `TextInput.State.currentlyFocusedInput()`). `TextInput` instances expose `focus()`, `blur()`, `isFocused()`, `clear()`, `setSelection()`. All host component refs expose `focus()`/`blur()` via RN's `NativeMethods` interface, but only `TextInput` meaningfully focuses (opens the keyboard).

Canonical multi-field UX (reactnative.dev/docs/improvingux): `returnKeyType="next"` + `onSubmitEditing={() => nextRef.current?.focus()}` + `submitBehavior="submit"` to chain fields while keeping the keyboard open; last field submits. Keyboard overlap is handled by `KeyboardAvoidingView` or, increasingly, `react-native-keyboard-controller` (Discord/Expensify-scale adoption; ships `KeyboardAwareScrollView` and a `KeyboardToolbar` with prev/next/done traversal). This layer belongs to the app, not the form library — but docs should acknowledge it.

## 2. How this differs from React on the web

| Web React                                                         | React Native                                                                                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `<form onSubmit>` + `SubmitEvent` + `preventDefault()`            | No form element; submit is `onPress` on a button                                                                                             |
| `onChange(event)` → `event.currentTarget.value` (always a string) | `onChangeText(text)` / `onValueChange(value)` — raw typed values                                                                             |
| `name` attribute, `document.getElementsByName` for groups         | No `name`; no DOM queries; groups must be explicit                                                                                           |
| `HTMLInputElement` etc.; `element.isConnected`, `getRootNode()`   | Host component refs; structural `focus()`/`blur()`/`isFocused()` only                                                                        |
| `input.files` → `File`/`FileList`                                 | Pickers return asset descriptor objects `{ uri, name?, mimeType?, fileSize? }`                                                               |
| `<input type="date">` → ISO strings                               | Date pickers produce real `Date` objects                                                                                                     |
| `autofocus` attribute                                             | `autoFocus` prop (mount-time only, opens the keyboard)                                                                                       |
| `FormData` for serialization                                      | `FormData` exists only as an upload shim                                                                                                     |
| `typeof window` check works                                       | **`window` is defined in RN** (`globalThis.window = globalThis`); use `typeof document === 'undefined'` — or better, a dedicated build entry |

A consequence worth highlighting: because RN hands the library **already correctly typed values**, a schema-first library is a _better_ fit in RN than on the web — no string-coercion layer (`valueAsNumber`, date parsing) is needed. `v.number()`, `v.date()`, `v.boolean()` validate picker outputs directly. Only `TextInput` produces strings.

## 3. How other form libraries handle React Native

**react-hook-form** — official guidance: wrap inputs in `Controller`/`useController`; `register()` doesn't apply. The wiring is `value={field.value}`, `onChangeText={field.onChange}` (their `field.onChange` accepts raw values, not just events), `onBlur={field.onBlur}`, `ref={field.ref}`. Passing `field.ref` to `TextInput` is what makes `setFocus(name)` and focus-on-error (`shouldFocusError`) work, since `TextInput` has `.focus()`.

**Formik** — no `<form>`, so `handleSubmit` goes on `Button onPress`. Because there's no `e.target.name`, `handleChange`/`handleBlur` are curried by field name: `onChangeText={handleChange('email')}`. No focus management at all.

**TanStack Form** — "headless, works out of the box": `value={field.state.value}`, `onChangeText={field.handleChange}` (raw value). No built-in focus support — their focus-management guide tells RN users to hand-roll a ref registry and focus the first invalid field themselves. This is the pain point Formisch can beat: our field stores already hold element arrays, so `focus(form, { path })` and focus-first-error-on-submit come for free once refs are registered via `field.props`.

## 4. Packaging for React Native (Metro)

- Metro supports `package.json` `"exports"` by default since Metro 0.82 / RN 0.79 / Expo SDK 53 (April 2025), but apps can and do opt out — keep the legacy `"main"` (and top-level `"react-native"`) fields working as fallback.
- Metro asserts the condition names `['require', 'react-native']` — it does **not** assert `'import'`. An entry point reachable only via the `"import"` condition is invisible to Metro; always provide `"react-native"` and/or `"default"` conditions.
- For subpaths matched through `"exports"`, Metro does not expand platform extensions (`.ios.js`, `.native.js`) — platform forking must go through conditions.
- RN 0.80 introduced the Strict TypeScript API and deprecated deep imports (`react-native/Libraries/...`). Import only from the `react-native` root.
- RN app tsconfigs (e.g. `@react-native/typescript-config`) do **not** include `lib: ["DOM"]`. Any shipped `.d.ts` that references `HTMLInputElement`, `SubmitEvent`, `FormData`, or `File` breaks type-checking in RN apps. The RN build output must be DOM-type-free.
- Pure JS/TS libraries are automatically Expo-compatible (including Expo Go). Native modules (pickers) are the app's dependencies, installed via `npx expo install`.
- RN versions pair tightly with React versions: RN 0.76/0.77 → React 18.3, RN 0.78+ → React 19.

## 5. Files and dates

- Pickers (`expo-image-picker`, `expo-document-picker`, `@react-native-documents/picker`) return asset objects like `{ uri: string, fileName/name, mimeType, fileSize/size }` — never web `File` objects on native (RN's `Blob`/`File` globals are partial network shims). A `v.file()` schema check fails on native; RN file fields should validate asset-descriptor objects instead.
- Uploads append `{ uri, name, type }` descriptors to RN's `FormData`.
- Date pickers produce and consume `Date` objects; there are no ISO date strings anywhere.

## 6. Synthesis — what "native-feeling" means for Formisch

1. Controller-style controlled binding: `value={field.input}` + `onChangeText={field.onChange}` / `onValueChange={field.onChange}`, with `field.onChange` accepting raw typed values (Formisch's `field.onChange` already does exactly this).
2. A spreadable `field.props` reduced to what's universal in RN: ref registration + focus/blur handlers. No DOM `onChange`, no `name`.
3. Ref registration unlocks the focus story (`focus(form, { path })`, focus-first-error on submit) — the proven RHF pattern and a differentiator over TanStack Form.
4. `handleSubmit`/`submit` callable from `onPress`/`onSubmitEditing` with no event.
5. Ship a `"react-native"`-safe package: correct Metro resolution, zero DOM types in `.d.ts`, no deep RN imports, Expo-compatible.
