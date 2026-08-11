# Schema IR POC — Formisch Intermediate Representation

**Branch:** `poc/schema-ir`

This branch proves that Formisch core can drive identical forms via either a Valibot or Zod adapter, with **zero Valibot imports** in the library-agnostic core.

## What This Proves

1. **Core is library-agnostic.** The core package (`@formisch/core`) consumes a framework-agnostic IR (intermediate representation) instead of Valibot schemas directly.
2. **Adapters bridge the gap.** `@formisch/valibot` and `@formisch/zod` each transform their respective schema types into the same IR.
3. **Both adapters drive the same form.** A React demo toggles between Valibot and Zod schemas, initializing the same form with identical behavior.
4. **Parity is verified by tests.** The same schema shape in Valibot and Zod produces deeply-equal IR structures.

## The `grep` Proof

```bash
# Zero valibot imports in core source (excluding tests)
grep -r "from 'valibot'" packages/core/src/ --include="*.ts" | grep -v ".test.ts" | grep -v "vitest/"
# Result: (empty)

# Zero zod imports in core source
grep -r "from 'zod'" packages/core/src/ --include="*.ts" | grep -v ".test.ts" | grep -v "vitest/"
# Result: (empty)
```

The only mentions of "valibot" or "zod" in `packages/core/src/` are in JSDoc comments, not imports.

## How to Run

### Demo

```bash
pnpm install
pnpm -C playgrounds/ir-demo dev
```

Open the demo, toggle between "Valibot adapter" and "Zod adapter", and observe the same form behavior.

### Tests

```bash
# Core tests (410+ pass, 25 fail — all in out-of-scope tuple/union/combinator areas)
pnpm -C packages/core test

# Adapter tests
pnpm -C packages/adapters/valibot test   # 22 pass
pnpm -C packages/adapters/zod test       # 19 pass

# Parity test (valibot + zod → identical IR)
cd packages/core && npx vitest run src/form/parity.test.ts  # 8 pass
```

### Build

```bash
pnpm -C packages/core build
pnpm -C packages/adapters/valibot build
pnpm -C packages/adapters/zod build
```

## Architecture

### IR Type (`packages/core/src/types/schema/ir.ts`)

```ts
interface FormischFieldIR {
  readonly type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'date' | 'bigint' | 'unknown';
  readonly optional: boolean;
  getDefault(): unknown;
  readonly properties?: ReadonlyMap<string, FormischFieldIR>;
  readonly item?: FormischFieldIR;
}
```

### Data Flow

```
Valibot schema ──┐                    ┌── initializeFieldStore (IR-driven)
                  ├──→ FormischFieldIR ──→ decodeFormData (IR-driven)
Zod schema ──────┘                    └── validateFormInput (~standard.validate)
```

### Files Changed

- `packages/core/src/types/schema/ir.ts` — **new**: IR type definitions
- `packages/core/src/types/schema/schema.ts` — `Schema` = `FormischSchema` (Standard Schema + IR)
- `packages/core/src/field/initializeFieldStore/` — rewritten to consume IR
- `packages/core/src/form/decodeFormData/` — rewritten to consume IR
- `packages/core/src/form/createFormStore/` — reads IR root from `schema['~formisch']`
- `packages/core/src/form/validateFormInput/` — uses Standard Schema issue format
- `packages/core/src/types/form/form.ts` — Standard Schema types replace Valibot types
- `packages/core/src/vitest/utils.ts` — test helper with `toFormisch` wrapper

### New Packages

- `packages/adapters/valibot/` — `@formisch/valibot` adapter
- `packages/adapters/zod/` — `@formisch/zod` adapter

### React Wrapper

- `frameworks/react/src/hooks/useForm/useForm.ts` — changed from `v.safeParseAsync` to `schema['~standard'].validate`

## Out of Scope (Documented)

The following features are **not** supported in this POC:

- **Unions, variants, intersects** (`v.union`/`v.variant`/`v.intersect`, `z.union`/`z.intersection`)
- **Tuples** (`v.tuple`/`z.tuple`), **records**, `object_with_rest`, `tuple_with_rest`, `promise`
- **ArkType, TypeBox, Yup, Effect/Schema** adapters
- Changes to framework wrappers other than React's `useForm`
- Client-side number coercion beyond `decodeFormData` (IR exposes `type`; input coercion is a follow-up)
- Server-actions / meta-framework integration

## Open Design Questions

1. **Unions/variants/intersects:** How should the IR represent these? Options: (a) flatten to first option (current POC behavior), (b) add a `union` type with multiple option IRs, (c) defer to `~standard.validate` only.
2. **Tuples:** Should the IR add a `tuple` type with a fixed-length `items` array? Or model as a special `array` with `minItems`/`maxItems`?
3. **`getDefault()` serializability:** The current IR uses a closure wrapping `v.getDefault(schema)` / Zod's `defaultValue()`. For server-to-client transfer, this needs to be serializable. Options: (a) serialize the default value at transform time, (b) use a registry of default-value producers.
4. **Records/maps:** `v.record(v.string(), v.number())` has dynamic keys. How should the IR represent them?
5. **Per-branch metadata in unions:** The old code iterated all union options, applying defaults from each. The IR approach resolves to one option at transform time. Is this acceptable, or does the core need to handle multiple options?

## Relationship to #42 and `StandardFormSchema`

The IR is the structural half of what `StandardFormSchema` (issue #42) proposed. By carrying the IR alongside the Standard Schema `~standard` passthrough, Formisch gets both structural introspection (for field initialization and form-data decoding) and validation (via `~standard.validate`).

## Alpha Publish

After merging to `dev`, the author can cut an `@alpha` release:

```bash
pnpm -C packages/core build
pnpm -C packages/adapters/valibot build
pnpm -C packages/adapters/zod build

# Publish with alpha tag
cd packages/core && npm publish --tag alpha
cd packages/adapters/valibot && npm publish --tag alpha
cd packages/adapters/zod && npm publish --tag alpha
```
