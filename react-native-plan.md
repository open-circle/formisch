# Formisch for React Native — Review & Plan

Plan for `@formisch/react-native` (#117). Builds on PR #137 (signal-layer foundation: `index.react-native.ts` core adapter + `./react-native` build targets for core and methods). Companion research notes: `react-native-learnings.md`.

## 1. Summary

React Native is a _better_ fit for Formisch's schema-first design than the web: RN inputs hand us raw, correctly typed values (`string`, `boolean`, `number`, `Date`), so Valibot schemas validate them directly with no coercion layer. The entire signal system, form state management, validation logic, array methods, and the headless `Field`/`FieldArray` components work unchanged. What must change is small and well-contained:

1. **Core/methods**: replace the DOM-typed surface (`FieldElement`, `focusFieldElement`, form `element`, `SubmitEvent`) via the existing `.react-native.ts` override mechanism, and drop the two DOM-only exports (`getElementInput`, `decodeFormData`) from the RN entry.
2. **New `frameworks/react-native` package**: same structure as `frameworks/react`, with an RN-adapted `useField` (controlled binding, no DOM `onChange`), a `Form` component that renders a `View` and registers the submit runner, and RN-typed props.
3. **New `playgrounds/react-native`**: an Expo app replicating the five playground forms with native components.

A hard requirement discovered during research: **RN app tsconfigs do not include `lib: ["DOM"]`** (e.g. `@react-native/typescript-config`). Every DOM type reference (`HTMLInputElement`, `SubmitEvent`, `FormData`, `File`) that leaks into the `.d.ts` of the react-native build breaks type-checking in consumer apps. The overrides below are therefore not just cosmetic — they are required for the package to type-check in RN projects at all.

## 2. Proposed developer experience

The API mirrors Formisch for React, adapted to RN idioms (the react-hook-form `Controller` pattern RN devs already know). Value binding is explicit — `field.props` no longer carries `onChange`, since RN components deliver values through differently named, differently typed callbacks:

```tsx
import { Field, focus, Form, submit, useForm } from '@formisch/react-native';
import { Button, Text, TextInput } from 'react-native';
import * as v from 'valibot';

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email('The email address is badly formatted.')),
  password: v.pipe(v.string(), v.minLength(8, 'Min. 8 characters.')),
});

export default function LoginScreen() {
  const loginForm = useForm({ schema: LoginSchema });

  return (
    <Form of={loginForm} onSubmit={(output) => console.log(output)}>
      <Field of={loginForm} path={['email']}>
        {(field) => (
          <>
            <TextInput
              {...field.props}
              value={field.input}
              onChangeText={field.onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => focus(loginForm, { path: ['password'] })}
            />
            {field.errors && <Text>{field.errors[0]}</Text>}
          </>
        )}
      </Field>
      <Field of={loginForm} path={['password']}>
        {(field) => (
          <>
            <TextInput
              {...field.props}
              value={field.input}
              onChangeText={field.onChange}
              secureTextEntry
              returnKeyType="send"
              onSubmitEditing={() => submit(loginForm)}
            />
            {field.errors && <Text>{field.errors[0]}</Text>}
          </>
        )}
      </Field>
      <Button
        title="Login"
        disabled={loginForm.isSubmitting}
        onPress={() => submit(loginForm)}
      />
    </Form>
  );
}
```

Other components bind the same way, with correctly typed values flowing straight into the schema:

```tsx
<Switch {...field.props} value={field.input} onValueChange={field.onChange} />
<Picker {...field.props} selectedValue={field.input} onValueChange={field.onChange} />
<Slider {...field.props} value={field.input} onSlidingComplete={field.onChange} />
<DateTimePicker value={field.input} onChange={(e, date) => field.onChange(date)} />
```

What this design delivers:

- `field.onChange(value)` already accepts a typed raw value in every framework — it plugs into `onChangeText`/`onValueChange` with zero adaptation. This is the API you sketched in #117.
- Spreading `field.props` (ref + focus/blur handlers) keeps touched/blur validation _and_ registers the element, which powers `focus(form, { path })` and focus-first-error on submit — the feature TanStack Form tells RN users to hand-roll, and a genuine differentiator.
- `submit(form)` works from buttons and `onSubmitEditing` alike because `Form` registers the submit runner on the store (see §5).
- All methods (`reset`, `insert`, `move`, `swap`, `setInput`, `getErrors`, …) work unchanged.

## 3. DOM audit — the exact surface to replace

Full sweep of `packages/core/src`, `packages/methods/src`, `frameworks/react/src` (shipped source only):

| File                                       | DOM usage                                                                                                                                  | RN treatment                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `core/src/types/field/field.ts`            | `FieldElement = HTMLInputElement \| HTMLSelectElement \| HTMLTextAreaElement`; stored as `elements`/`initialElements` on every field store | Override: structural RN element interface (§4.1)                          |
| `core/src/types/form/form.ts`              | `InternalFormStore.element?: HTMLFormElement`; `SubmitEventHandler` uses `SubmitEvent`                                                     | Override: `submit` runner instead of `element`; event-free handler (§4.2) |
| `core/src/field/getElementInput/`          | `element.value/.checked/.files/.options`, `document.getElementsByName`                                                                     | Drop from RN entry — unused without DOM `onChange` (§4.3)                 |
| `core/src/field/focusFieldElement/`        | `element.focus()`, `getRootNode().activeElement`                                                                                           | Override: `focus()` + `isFocused?()` (§4.4)                               |
| `core/src/form/decodeFormData/`            | `FormData`, `File`                                                                                                                         | Drop from RN entry — RN's `FormData` is an upload-only shim (§4.5)        |
| `methods/src/handleSubmit/handleSubmit.ts` | `SubmitEvent`, `preventDefault()`                                                                                                          | Override: event-free signature (§5.1)                                     |
| `methods/src/submit/submit.ts`             | `element.requestSubmit()`                                                                                                                  | Override: invoke registered runner (§5.2)                                 |
| `methods/src/reset/reset.ts`               | clears `element.value` on `type === 'file'` inputs                                                                                         | Extract helper with RN no-op (§5.3)                                       |
| `frameworks/react/.../useField.ts`         | `element.isConnected` cleanup, `event.currentTarget` in `onChange`                                                                         | RN-specific `useField` in new package (§6)                                |
| `frameworks/react/.../Form.tsx`            | `<form noValidate>`, `HTMLFormElement` ref, `FormHTMLAttributes`                                                                           | RN `Form` renders `View` (§6)                                             |
| `frameworks/react/src/types/field.ts`      | `ChangeEventHandler`/`FocusEventHandler<FieldElement>`                                                                                     | RN-typed `FieldElementProps` (§6)                                         |

Everything else is confirmed DOM-free, including the array-state utilities (`copyItemState`, `swapItemState`, `resetItemState`) — they only move `elements` array references between stores, which works identically with RN refs. The signal adapter (`index.react-native.ts`) from PR #137 needs no changes.

Note on both packages' tsconfig: `lib: ["ESNext", "DOM"]` stays as is — it's needed for the web variants; the RN safety comes from the `.d.ts` output of the RN build containing no DOM types, which the overrides guarantee.

## 4. Core changes (`packages/core`)

All via the established `{filename}.react-native.ts` mechanism. One implementation gotcha the plugin imposes: imports _inside_ a `.react-native.ts` file are not rewritten, so framework files must reference sibling variants explicitly (precedent: `form.qwik.ts` imports `../field/field.qwik.ts`).

### 4.1 `types/field/field.react-native.ts`

Full copy of `field.ts` (precedent: `field.qwik.ts`) with `FieldElement` redefined as a structural interface — core cannot depend on the `react-native` package, and it doesn't need to:

```ts
/**
 * Field element type.
 *
 * Hint: This is a structural subset of React Native's `NativeMethods`
 * interface, which every host component instance implements. `isFocused`
 * is only available on `TextInput` instances.
 */
export interface FieldElement {
  focus(): void;
  blur(): void;
  isFocused?(): boolean;
}
```

`TextInput` refs satisfy it exactly (`focus`/`blur`/`isFocused`); every other host component ref (`Switch`, `View`, third-party inputs) satisfies `focus`/`blur` via `NativeMethods`. Custom JS components can register any object with a `focus` method.

### 4.2 `types/form/form.react-native.ts`

Copy of `form.ts` (re-exporting DOM-free types where possible, precedent: `form.react.ts`) with two changes:

- `InternalFormStore`: replace `element?: HTMLFormElement` with `submit?: (() => Promise<void>) | undefined` — the submit runner registered by the `Form` component, consumed by the `submit()` method.
- `SubmitEventHandler<TSchema> = (output: v.InferOutput<TSchema>) => MaybePromise<unknown>` — no event parameter (there is no submit event; `GestureResponderEvent` would require a `react-native` dependency and adds nothing).

### 4.3 `field/index.react-native.ts` (barrel)

Copy of `field/index.ts` minus the `getElementInput` line. Without DOM `onChange` there is no call site (its only consumer is `frameworks/react`'s `useField`), and its implementation is unimplementable in RN (`document.getElementsByName`). Omitting it makes the RN API surface honest — TS users get "no such export" instead of a runtime crash. The transitive re-exports through base `index.ts` barrels still get variant-rewritten, so this composes with 4.4.

### 4.4 `field/focusFieldElement/focusFieldElement.react-native.ts`

```ts
export function focusFieldElement(
  internalFieldStore: InternalFieldStore
): boolean {
  for (const element of internalFieldStore.elements) {
    element.focus();
    // Verify via `isFocused` where available (TextInput); otherwise
    // assume the call succeeded, mirroring the web behavior of trying
    // elements in order until one receives focus
    if (!element.isFocused || element.isFocused()) {
      return true;
    }
  }
  return false;
}
```

This keeps `focus(form, { path })` and `validateFormInput`'s focus-first-error working. For `TextInput` it opens the keyboard — exactly the native focus-on-error UX.

### 4.5 `form/index.react-native.ts` (barrel)

Copy of `form/index.ts` minus `decodeFormData`. RN's global `FormData` is an append-only upload shim (no `forEach`/`entries`), so the function cannot work, and its `.d.ts` references `FormData`/`File`, which don't exist in RN tsconfigs. It remains available in every other entry (it's a server-side concern anyway).

## 5. Methods changes (`packages/methods`)

The methods build already rewrites `@formisch/core` → `@formisch/core/react-native` and picks up `.react-native.ts` variants (PR #137).

### 5.1 `handleSubmit/handleSubmit.react-native.ts`

Precedent: `handleSubmit.react.ts` (thin typed wrapper over the base implementation). Single event-free signature:

```ts
export function handleSubmit<TSchema extends FormSchema>(
  form: BaseFormStore<TSchema>,
  handler: SubmitHandler<TSchema>
): () => Promise<void>;
```

The base implementation already tolerates a missing event (`event?.preventDefault()`), so the RN variant only fixes the types — which is mandatory, since the base overloads reference `SubmitEvent` in the `.d.ts`. Usable directly as `onPress={handleSubmit(form, onSubmit)}`.

### 5.2 `submit/submit.react-native.ts`

```ts
export function submit(form: BaseFormStore): void {
  void form[INTERNAL].submit?.();
}
```

Same no-op-when-unregistered semantics as the web version (`element?.requestSubmit()`).

### 5.3 `reset.ts` — extract the file-input loop

`reset` clears native file inputs (`element.type === 'file'` → `element.value = ''`). That's runtime-safe on RN (the properties are simply `undefined`) but ships dead DOM code and reads properties the RN `FieldElement` doesn't have. Recommendation: extract into a core helper, e.g. `field/resetFieldElements/` (web: clear file inputs; `resetFieldElements.react-native.ts`: no-op). Keeps `reset.ts` shared, keeps the RN bundle clean.

### 5.4 `setInput/setInput.react-native.ts`

Copy of `setInput.react.ts` (importing `@formisch/core/react-native`). The react variant exists because fully controlled inputs need the `'change'` trigger to run on programmatic sets — RN is fully controlled in the same way, so it must mirror the react variant, not the base.

## 6. New package: `frameworks/react-native`

Same layout as `frameworks/react`; per-framework copies are the repo's established pattern. Everything imports from `@formisch/core/react-native` / `@formisch/methods/react-native` and gets bundled into the dist (core/methods as devDependencies, like the other framework packages).

```
frameworks/react-native/src/
├── components/
│   ├── Field/        → verbatim copy (headless)
│   ├── FieldArray/   → verbatim copy (headless)
│   └── Form/         → new: View wrapper + submit registration
├── hooks/
│   ├── useForm/      → verbatim copy
│   ├── useField/     → adapted (props, element cleanup)
│   ├── useFieldArray/→ verbatim copy
│   └── useSignals/   → verbatim copy
├── types/
│   ├── field.ts      → RN FieldElementProps
│   ├── form.ts       → verbatim copy
│   └── index.ts
└── index.ts
```

### `Form` component

```tsx
export type FormProps<TSchema extends FormSchema = FormSchema> = ViewProps & {
  readonly of: FormStore<TSchema>;
  readonly onSubmit: SubmitHandler<TSchema>;
};

// Renders a plain View (layout container via `style`, like every RN screen)
// and registers the submit runner so `submit(form)` and `onSubmitEditing`
// chains work from anywhere.
export function Form({ of, onSubmit, ...other }: FormProps): ReactElement {
  const handler = useRef(onSubmit);
  useEffect(() => {
    handler.current = onSubmit;
  });
  useEffect(() => {
    of[INTERNAL].submit = handleSubmit(of, (output) => handler.current(output));
  }, [of]);
  return <View {...other} />;
}
```

This preserves the cross-framework mental model (`<Form of onSubmit>` everywhere) while being idiomatic RN — a `View` is the natural container, and submission stays a plain function call. Devs who prefer no wrapper can skip `Form` and use `handleSubmit(form, handler)` directly on a button (then `submit(form)` is a no-op, same as web without a mounted `Form`).

### `useField` adaptations

Two changes from the react version:

1. **`props` shrinks to `{ ref, onFocus, onBlur }`.**
   - `onChange` is dropped (your #117 suggestion): there is no DOM event to read from, and every RN component delivers values through its own callback. Binding is explicit: `value={field.input}` + `onChangeText={field.onChange}`.
   - `name` is dropped: RN components have no `name` prop; spreading it is dead weight. (Devs who want it for testing use `testID` explicitly.)
   - `autoFocus` is dropped: on RN, autofocusing pops the keyboard open — doing that implicitly whenever a field mounts with errors is intrusive. Focus-on-error after submit is already handled imperatively by `validateFormInput({ shouldFocus: true })`, which is the right UX moment (user just pressed submit).
   - `onFocus`/`onBlur` keep their exact web semantics (touched + `'touch'`/`'blur'` triggers).
2. **Element cleanup without `isConnected`.** RN refs have no `isConnected`, so the web's disconnect-filtering effect doesn't port. Instead the ref callback tracks its own registration and removes it when React detaches (`ref(null)` — works on React 18 and 19). The `initialElements` sync logic (reorder + reset edge cases) must be ported carefully — the todos playground and the existing array-method test scenarios cover exactly these cases.

### `types/field.ts` — `FieldElementProps`

```ts
export interface FieldElementProps {
  readonly ref: (element: FieldElement | null) => void;
  readonly onFocus: (event: NativeSyntheticEvent<TargetedEvent>) => void;
  readonly onBlur: (event: NativeSyntheticEvent<TargetedEvent>) => void;
}
```

Typed against `react-native` (peer dependency of this package — core stays structural). `TargetedEvent` is the base of RN's focus events, so the handlers are assignable to `TextInput`, `Pressable`, and other components' `onFocus`/`onBlur` props, and spreading onto components without those props (e.g. `Switch`) type-checks because JSX spreads don't trigger excess-property checks. The `FieldStore`/`FieldArrayStore` interfaces are otherwise identical to react's.

### `package.json`

```jsonc
{
  "name": "@formisch/react-native",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "react-native": "./dist/index.js", // legacy main-field resolution
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "react-native": "./dist/index.js", // Metro asserts this condition
      "import": "./dist/index.js",
      "default": "./dist/index.js", // Metro asserts require, not import
    },
  },
  "peerDependencies": {
    "react": ">=18",
    "react-native": ">=0.73",
    "typescript": ">=5",
    "valibot": "^1.4.1",
  },
}
```

Rationale: Metro asserts `['require', 'react-native']` conditions (never `'import'`), so `"react-native"` + `"default"` cover exports-enabled apps and the top-level `"react-native"`/`"main"` fields cover apps that opted out of exports. No `react-dom` peer. Floor `react-native >=0.73`: first version with built-in TS types and stable Metro symlink support; documented/tested against ≥0.76 (New Architecture default, which fixed controlled-`TextInput` flicker). tsconfig uses `lib: ["ESNext"]` — deliberately no DOM, so any accidental DOM usage fails the lint.

## 7. New playground: `playgrounds/react-native`

Expo app (SDK 53+, RN 0.79+, New Architecture) — Expo is the ecosystem default and what RN devs expect an example to look like. `expo-router` for navigation with the five screens mirroring the other playgrounds:

| Screen  | Native components                                                                                                                               | Schema notes                                                                                                                                                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| login   | `TextInput` (email/password), keyboard chaining via `focus()`                                                                                   | unchanged                                                                                                                                                                                                                                  |
| todos   | `TextInput` list + add/remove/move/swap/replace buttons                                                                                         | unchanged — exercises element-moving logic with RN refs                                                                                                                                                                                    |
| special | `TextInput` (numeric), Slider, checkbox group (`expo-checkbox`), custom radio `Pressable`s, `Picker`, multi-select list, `expo-document-picker` | `range` becomes `v.number()` (Slider emits numbers); file fields validate asset objects (`v.object({ uri: v.string(), … })`) instead of `v.file()`; add a `Date` field via `@react-native-community/datetimepicker` to showcase `v.date()` |
| nested  | nested objects/arrays                                                                                                                           | unchanged                                                                                                                                                                                                                                  |
| payment | `Picker` + conditional fields                                                                                                                   | unchanged                                                                                                                                                                                                                                  |

Additional choices:

- **Styling: `StyleSheet`** — zero extra dependencies and the baseline idiom every RN dev reads fluently. (Alternative: NativeWind for Tailwind parity with the other playgrounds — see open decisions.)
- Include `react-native-web` so `expo start --web` works — cheap browser-based dev/demo without a simulator, and it doubles as validation of the RNW-based test strategy.
- Wrap screens in `KeyboardAvoidingView` to model the recommended pattern.
- Monorepo note: `expo/metro-config` auto-detects workspace roots; Metro's symlink support handles pnpm. Needs verification during implementation — this is the highest-uncertainty item in the playground setup.

## 8. Testing

Recommendation: **Vitest + `react-native-web` alias + `@testing-library/react` (jsdom)** for `frameworks/react-native` — the same stack as `frameworks/react`, with `react-native` aliased to `react-native-web` in the vitest config.

- Keeps the monorepo on one test runner (every other framework package uses vitest; `@testing-library/react-native` is Jest-centric and RN source needs Babel/Flow transforms that fight vitest).
- RNW implements the full contract we exercise: `onChangeText`, `onValueChange`, and the imperative `focus()`/`blur()`/`isFocused()` on `TextInput`.
- Known limitation: RNW is a web reimplementation, not the native runtime. Acceptable because our components are headless logic — native fidelity is covered manually via the playground (and Expo web narrows the gap further).

Core/methods RN overrides need no RN runtime at all: `focusFieldElement.react-native.ts`, `submit.react-native.ts`, etc. are tested with plain structural mocks (`{ focus: vi.fn(), isFocused: () => true }`) in the existing vitest setups. Port the react package's test suites (useField, useForm, Field, FieldArray, Form, useSignals) with RN-adjusted assertions, plus new tests for: element registration/removal on unmount, element moves across array insert/move/swap/reset, focus-first-error, and submit-runner registration.

## 9. Open decisions (your feedback wanted)

1. **`field.props` contents** — proposed: `{ ref, onFocus, onBlur }` only (drop `onChange`, `name`, `autoFocus`). The `autoFocus` drop is the debatable one; I think implicit keyboard-popping is wrong for RN, but it does diverge from web behavior.
2. **`field.onChange` name** — proposed: keep `onChange` for cross-framework consistency (also matches RHF's `field.onChange`, and reads fine as `onChangeText={field.onChange}` / `onValueChange={field.onChange}`). You floated renaming (e.g. `onValueChange`) in #117 — happy to switch if you prefer the RN-native name over consistency.
3. **`Form` component** — proposed: keep it as a `View` wrapper that registers the submit runner (API symmetry + makes `submit(form)`/`onSubmitEditing` chains work). Alternative: no `Form` at all, RHF-style `onPress={handleSubmit(form, handler)}` only — more minimal, but `submit(form)` would need another registration path and cross-framework docs would fork harder.
4. **Internal store field name** — `submit?: () => Promise<void>` on the RN `InternalFormStore` replacing `element`. Could also be named `submitRunner`/`onSubmit`.
5. **Testing stack** — vitest + react-native-web (recommended) vs. Jest + `@testing-library/react-native` (higher fidelity, breaks monorepo consistency).
6. **Playground styling** — `StyleSheet` (recommended, dependency-light) vs. NativeWind (visual/Tailwind parity with other playgrounds).
7. **PR scoping** — see §10: extend PR #137 with the core/methods overrides, or merge #137 as-is and put the overrides in PR 2.
8. **Peer floor** — `react-native >=0.73` proposed; could tighten to `>=0.76` (New Architecture default) for a cleaner support story.

## 10. PR sequencing

**PR #137 (finalize)** — extend with the core + methods overrides so the `./react-native` entries become genuinely RN-safe rather than DOM-typed re-exports:

- `core`: `field.react-native.ts` (types), `form.react-native.ts` (types), `focusFieldElement.react-native.ts`, `field/index.react-native.ts`, `form/index.react-native.ts`, `resetFieldElements` helper + RN no-op
- `methods`: `handleSubmit.react-native.ts`, `submit.react-native.ts`, `setInput.react-native.ts`, `reset.ts` refactor to use the helper
- Tests for all of the above (mock-based, existing vitest setups)

Rationale: shipping `@formisch/core/react-native` with `HTMLInputElement` in its `.d.ts` is a broken intermediate state for any RN consumer; the overrides are exactly the "core react-native adapter" the PR title claims. It also keeps PR 2 purely additive (new packages only), which is much easier to review. If you prefer to merge #137 as-is, the overrides move wholesale to the top of PR 2 — no technical blocker either way.

**PR 2** — `frameworks/react-native` package + `playgrounds/react-native` + CI/lint wiring, matching the structure of the existing framework packages.

Follow-up (out of scope for both PRs): website docs for React Native — new framework tab, RN-specific guides (input binding, keyboard/focus patterns, file/date schemas).
