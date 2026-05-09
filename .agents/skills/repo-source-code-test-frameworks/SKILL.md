---
name: repo-source-code-test-frameworks
description: Write unit and type tests for Formisch framework packages (frameworks/preact, frameworks/solid, frameworks/svelte, frameworks/vue, frameworks/react). Use when adding tests for hooks/composables/runes (useForm/createForm, useField, useFieldArray) or components (Form, Field, FieldArray) in any framework wrapper.
metadata:
  author: formisch
  version: '1.0'
---

# Writing Framework Tests

Tests for `frameworks/<fw>/`. For `packages/core/` or `packages/methods/`, use `repo-source-code-test-packages`.

## Rules

1. **React is the canonical reference.** New shared tests land in `frameworks/react` first, then port.
2. **Cross-framework consistency.** Shared API (`useForm`/`createForm`, `useField`, `useFieldArray`, `Form`, `Field`, `FieldArray`) keeps the same `describe`/`test` names, schemas, `initialInput`, expected outputs. Only mechanical adapters differ.
3. **No framework hint in test names.** Never `'should ... (Solid-only)'`. Use a `// ...` comment above the test if framework-specific reasoning matters.
4. **No tautological assertions.** A test must be able to fail under a real source change.
5. **100% coverage** on non-excluded files. Match React's `vitest.config.ts` exclusions: `src/types`, `src/vitest`, `**/index.ts(x)`, test files.
6. **`vi.waitFor` for async, never `setTimeout(0)`.**

## File layout

```
frameworks/<fw>/
├── vitest.config.ts          # framework plugin + jsdom + setupFiles + coverage exclusions
├── package.json              # `test: vitest run --typecheck`, framework testing-library devDep
└── src/
    ├── vitest/
    │   ├── setup.ts          # jest-dom + cleanup
    │   ├── renderHook.ts     # (Vue/Svelte only)
    │   └── *Host.svelte      # (Svelte only) shared hosts
    ├── hooks|primitives|composables|runes/<name>/<name>.test.{ts,tsx} + .test-d.ts
    └── components/<Name>/<Name>.test.{ts,tsx}
                            └── *Host.test.svelte # (Svelte only) per-test hosts
```

## Standard test set

Identical `describe`/`test` names across all frameworks:

| Source                          | `describe` blocks                                                             | Tests       |
| ------------------------------- | ----------------------------------------------------------------------------- | ----------- |
| `useForm` / `createForm`        | `initialization`, `initial validation`, `reactivity`                          | 4 + 2 type  |
| `useField`                      | `initialization`, `input updates`, `validation modes`, `element registration` | 10 + 4 type |
| `useFieldArray`                 | `initialization`, `reactivity`                                                | 6 + 4 type  |
| `Form` / `Field` / `FieldArray` | (flat)                                                                        | 3 each      |

The `store stability` describe in React tests `useMemo` across re-renders and is **React-only**. In other frameworks omit it with a one-line `// Note: ...` comment.

## Per-framework adapters

| Concern         | Preact                    | Solid                      | Svelte                    | Vue                    | React                    |
| --------------- | ------------------------- | -------------------------- | ------------------------- | ---------------------- | ------------------------ |
| Hook name       | `useForm`                 | `createForm`               | `createForm`              | `useForm`              | `useForm`                |
| Read state      | `form.isValid.value`      | `form.isValid`             | `form.isValid`            | `form.isValid`         | `form.isValid`           |
| Imperative set  | `field.onInput(v)`        | `field.onInput(v)`         | `field.onInput(v)`        | `field.input = v`      | `field.onChange(v)`      |
| DOM input event | `fireEvent.input`         | `fireEvent.input`          | `fireEvent.input`         | `input.setValue(v)`    | `fireEvent.change`       |
| Auto-focus prop | `autofocus`               | `autofocus`                | `autofocus`               | `autofocus`            | `autoFocus`              |
| Field children  | function                  | function                   | `{#snippet children}`     | `v-slot` / scoped slot | function                 |
| Testing library | `@testing-library/preact` | `@solidjs/testing-library` | `@testing-library/svelte` | `@vue/test-utils`      | `@testing-library/react` |

## `renderHook`

- **Preact / React:** from the testing library — `{ result: { current }, rerender, unmount }`.
- **Solid:** from `@solidjs/testing-library` — `{ result, owner, cleanup }`. `result` is direct, not wrapped in `.current`. Use `createRoot` from `solid-js` only if no JSX context is needed; our primitives need an owner so `renderHook` is the default.
- **Vue:** custom helper at `src/vitest/renderHook.ts` — mounts a `defineComponent({ setup() { return hook(); } })` (the canonical Vue Test Utils [TestComponent recipe](https://test-utils.vuejs.org/guide/advanced/reusability-composition)). Required because `onBeforeMount`/`computed` need component context.
- **Svelte:** custom helper at `src/vitest/renderHook.ts` — mounts `Hook.svelte`. Required because `onMount` and `[createAttachmentKey()]` need template context. For pure rune logic with no lifecycle, `$effect.root(() => { ... })()` in a `.test.svelte.ts` is lighter — but no covered rune in this repo qualifies.

## Async

```ts
// ❌ flaky
await new Promise((r) => setTimeout(r, 0));
// ✅
await vi.waitFor(() => expect(form.isValid).toBe(false));
```

For Svelte rune updates, `flushSync()` from `svelte` synchronously drains derived/effect updates before the assertion. For Vue, `flushPromises()` from `@vue/test-utils` is fine for one-shot microtask drains; prefer `vi.waitFor` for multi-tick reactive flows.

## Type tests (`*.test-d.ts`)

```ts
import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import type { FieldStore } from '../../types/index.ts';
import { useForm } from '../useForm/index.ts';
import { useField } from './useField.ts';

describe('useField', () => {
  test('should narrow input type for primitive leaves', () => {
    const schema = v.object({ name: v.string() });
    const form = useForm({ schema });
    expectTypeOf(useField(form, { path: ['name'] }).input).toEqualTypeOf<
      string | undefined
    >();
  });

  test('should reject invalid paths', () => {
    const form = useForm({ schema: v.object({ name: v.string() }) });
    // @ts-expect-error nonexistent field
    useField(form, { path: ['nonexistent'] });
  });
});
```

For Preact, wrap leaf types in `ReadonlySignal<...>` — that's the only framework-specific delta in `.test-d.ts` files.

## Schema types

Always derive with `typeof schema`. If the schema is referenced only at the type level (host owns runtime), suppress the lint warning rather than hand-writing the valibot generic shape:

```ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- referenced only via `typeof schema`
const schema = v.object({ name: v.string() });
type Schema = typeof schema;
```

## Framework gotchas

**Preact** — every reactive `field.*` / `form.*` is a `ReadonlySignal<T>`; read with `.value`. Setter is `field.onInput(v)`. DOM events fire on `oninput`. `props.autofocus` is lowercase.

**Solid** — primitive is `createForm` (not `useForm`). Methods (`insert`, `swap`) don't need `act()`. Use `class=` not `className=` in JSX. `vite-plugin-solid` ≥ 2.8.2 auto-configures vitest; don't add manual deps overrides.

**Vue** — `field.props` has no `onInput`; wire DOM input via the setter:

```ts
h('input', {
  ...field.props,
  value: field.input ?? '',
  onInput: (e: Event) => {
    field.input = (e.target as HTMLInputElement).value;
  },
});
```

For "element removed" assertions, mount with `attachTo: document.body` and query `document.querySelector` — `wrapper.find` keeps finding stale nodes after `unmount()`.

**Svelte** — runes need Svelte compilation. Three test patterns:

- `Hook.svelte` via `renderHook` — default; required when source calls `onMount` or uses `[createAttachmentKey()]`.
- `*Host.test.svelte` per-test components — for snippet/slot rendering of `Field`/`FieldArray`/`Form`.
- `$effect.root` in a `*.test.svelte.ts` — only for pure rune logic with no lifecycle.

Snippets can't run statements; forward values via `{@const _ = onField(field)}` with a comment explaining the pattern. After every test, `cleanup()` from `@testing-library/svelte` must run in `setup.ts` or `screen.getByTestId` finds duplicates.

**Svelte build hygiene** — `package.json` `files` excludes `**/*.test.*`, `**/*.test-d.*`, `dist/vitest`. Verify after adding new fixtures:

```bash
pnpm -C frameworks/svelte build && cd frameworks/svelte && pnpm pack --pack-destination /tmp/
tar -tzf /tmp/formisch-svelte-*.tgz | grep -E "(test|Host|vitest)"  # must be empty
```

## Coverage

```bash
cd frameworks/<fw> && pnpm exec vitest run --coverage
```

Must hit 100% on every non-excluded file. Common gaps that need framework-specific tests (no React analogue): `field.props.onChange` handler (Preact/Solid/Svelte/Vue, covered by `validate:'change'` test), `usePathSignal` length-mismatch branch (Preact), `unwrap` (Solid/Svelte). Add such tests with a `// ...` comment, not a `(X-only)` suffix.

## Running

```bash
pnpm -C frameworks/<fw> test           # runtime + type
pnpm -C frameworks/<fw> lint           # eslint + tsc --noEmit
```

CI: `<fw>_vitest` job in `.github/workflows/ci.yml`.

## Checklist

- [ ] Test names match React canonical names exactly (no `(X-only)` suffixes)
- [ ] Framework divergence justified by `// ...` comment, not test name
- [ ] `vi.waitFor` for async, never `setTimeout(0)`
- [ ] Schema types via `typeof schema`, never hand-written valibot generics
- [ ] No tautological assertions
- [ ] 100% coverage on covered files
- [ ] `pnpm test` and `pnpm lint` pass
- [ ] (Svelte) `pnpm pack` output contains no test/Host/vitest files
- [ ] CI has a `<fw>_vitest` job
