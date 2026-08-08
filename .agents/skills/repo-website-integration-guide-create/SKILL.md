---
name: repo-website-integration-guide-create
description: Add integration guides for using Formisch with UI component libraries (e.g. shadcn/ui, Mantine, Chakra UI) to the Formisch website. Use when documenting how to wire Formisch fields to a component library's inputs.
metadata:
  author: formisch
  version: '1.1'
---

# Adding Integration Guides

Use this skill to add a UI component library integration guide to the Formisch website. Read `repo-website-guide-create` first for the shared front matter, links, code fences and formatting conventions. This skill adds the integration-specific structure and verification requirements.

## Location and Registration

- File: `website/src/routes/(docs)/{framework}/guides/(integration-guides)/{library-slug}/index.mdx`
- Slug: kebab-case library name (`shadcn-ui`, `chakra-ui`, `mantine`)
- Menu label and H1: the library's display name (`shadcn/ui`, `Chakra UI`)
- Register the guide in `website/src/routes/(docs)/{framework}/guides/menu.md` under `## Integration guides`, after `Migration guides`.
- Keep the heading exactly `Integration guides`. `DocsLayout.tsx` derives the `(integration-guides)` folder name from it for the Edit page link.
- Do not manually edit generated llms.txt, sitemap, OG image or public `.md` files.

## Reader Experience

Make the shortest guide that still produces a correct, accessible integration:

- Start with the decision the reader needs to make, then show the code.
- Explain why only where it prevents a likely mistake, such as a value conversion, hidden input ref or accessibility association.
- Keep introductory prose and caveats brief. Put component-specific details beside the relevant snippet instead of in a long notes section.
- Use consistent names and page-unique DOM IDs so snippets can be combined safely.
- Prefer complete, copy-safe snippets over shorter examples that silently omit validation, focus or accessibility behavior.
- Avoid claiming that two library backends have the same API. State the exact library major version and primitive backend the guide targets. Treat visual styles separately: do not require a design preset unless the integration depends on it.

## Guide Structure

Use this section order. FIXED parts stay consistent across integration guides; LIBRARY parts follow the verified component APIs.

```
# {Library}                     LIBRARY  2-3 sentence introduction with external
                                         link, targeted major version/backend,
                                         and the two Formisch wiring patterns
## Installation                 LIBRARY  Formisch + Valibot + verified library or
                                         CLI commands
## Wiring patterns              FIXED decision rule, LIBRARY snippets
### Spreading field.props                minimal native-forwarding text input
### Controlled components                minimal composite control with value,
                                         lifecycle and focus wiring
## Displaying errors            LIBRARY  error mapping, visual invalid state and
                                         accessible error association; link to
                                         validation timing
## Login form example           FIXED schema and structure, LIBRARY components;
                                         email + password + remember-me checkbox;
                                         submit disabled while submitting
## Component reference          FIXED H3 set and order, LIBRARY snippets
### Text input                           include a one-line textarea note
### Checkbox
### Select
### Radio group
### Slider
## Library-specific notes       OPTIONAL only verified caveats that do not fit
                                         beside a component
## Next steps                   FIXED links to input-components,
                                         controlled-fields and validation
```

If the library has no direct counterpart for a reference component, say so briefly instead of inventing an API.

## Canonical Login Schema

Use this schema verbatim so integration guides remain comparable:

```ts
const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your email.'),
    v.email('The email address is badly formatted.')
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your password.'),
    v.minLength(8, 'Your password must have 8 characters or more.')
  ),
  rememberMe: v.optional(v.boolean(), false),
});
```

Initialize controlled values in the complete example unless the component explicitly supports `undefined`. This avoids uncontrolled-to-controlled transitions and makes the first render match the schema input.

## Wiring Decision Rule

### Native-forwarding components

If a component forwards props and its ref to a native `<input>`, `<select>` or `<textarea>`:

- spread `field.props`
- pass `field.input` as `value` or `checked`
- use a nullish fallback when the native prop does not accept `undefined`
- place explicit props after the spread when they intentionally override Formisch's native handler

### Controlled components

If a component exposes `onCheckedChange`, `onValueChange` or another value callback, `field.onChange` is only the value portion of the integration. Preserve the complete field contract:

| Formisch behavior       | Typical component-library target                        |
| ----------------------- | ------------------------------------------------------- |
| `field.input`           | `value` or `checked`                                    |
| `field.onChange`        | custom value callback                                   |
| `field.props.name`      | root `name` or hidden native input                      |
| `field.props.ref`       | public `inputRef` or another focusable native target    |
| `field.props.autoFocus` | visible trigger, first group item or registered input   |
| `field.props.onFocus`   | focus event on the visible interactive control or group |
| `field.props.onBlur`    | blur event on the visible interactive control or group  |

The lifecycle mapping keeps `isTouched`, touch/blur validation, `focus()` and submit-time error focusing working. If the public wrapper hides the necessary primitive ref or event prop, adapt the copied local component and document that small change. A scoped ref lookup inside the owned wrapper is an acceptable fallback when the generated structure has been runtime-verified.

Formisch's focus and blur handlers are parameterless lifecycle callbacks. Pass them directly to component event props; any event argument supplied by the component is intentionally ignored. Do not add a cast or wrapper solely to erase an event parameter. Adapt a callback only when Formisch or the component actually needs a different value.

Field API source of truth: `frameworks/{framework}/src/types/field.ts`.

| API                                                   | Purpose                                            |
| ----------------------------------------------------- | -------------------------------------------------- |
| `field.props`                                         | Native name, ref, autofocus and lifecycle handlers |
| `field.input`                                         | Current controlled value                           |
| `field.onChange`                                      | Programmatic update and input/change validation    |
| `field.errors`                                        | `[string, ...string[]] \| null` error messages     |
| `field.isTouched` / `field.isDirty` / `field.isValid` | Current field state                                |

## Accessibility and Copy Safety

Every example that displays a label or error must preserve its semantic relationship:

- Use a page-unique DOM ID; do not assume a field name is globally unique.
- Connect a native or button-like control with `htmlFor` and `id`.
- Give composite widgets an accessible name with the library's label primitive or `aria-labelledby`.
- Connect a group legend to the actual `radiogroup`; a surrounding `fieldset` may not name a nested composite root.
- Set `aria-invalid` on the interactive element or group and reference a stable error ID with `aria-errormessage` or `aria-describedby` when errors are present.
- Match structural values to the widget. For example, array-driven sliders must receive one value per intended thumb.
- Normalize nullable, union or sentinel callback values explicitly before passing them to `field.onChange`.

## Verify Library APIs (Mandatory)

Do not write component props, event signatures or installation commands from memory.

1. **Identify the target.** Record the current library major version and, when applicable, the generated primitive backend. Determine separately whether visual styles change the component APIs used by the integration. Do not force a design choice merely to make the scaffold reproducible.
2. **Read authoritative docs.** Prefer the library's official documentation and generated source. Context7 may be used to retrieve it; use web search only as a fallback. Check Formisch's current field types and implementation locally.
3. **Scaffold the real output.** In a temporary directory, use the documented CLI or package versions to create the same components readers will receive. Inspect the generated wrapper and its primitive type declarations, especially hidden inputs, refs and event targets. If the guide is design-agnostic, compare the relevant generated APIs across the supported visual styles.
4. **Compile every pattern.** Install `valibot` and the Formisch package that matches the documented API, then typecheck and production-build the transcribed examples. Use the published `@formisch/{framework}` for released behavior. For an unreleased repository change, build and pack the local framework package instead of installing it through a workspace symlink, which can introduce a second framework runtime. Do not rely on MDX syntax highlighting as verification.
5. **Exercise behavior in a browser.** Verify that:
   - visible labels are the accessible names returned by role queries
   - each label targets the intended control and group labels name the group
   - errors render and are associated with the invalid control
   - controlled values update and the submitted output contains parsed values
   - focus marks the field as touched and triggers touch validation, while blur triggers blur validation
   - `focus()` and submit-time error focusing reach controlled fields
   - composite structure matches the value shape, such as one slider thumb per value
6. **Add focused automated coverage.** When a generated wrapper has non-obvious behavior such as thumb derivation or focus delegation, add or run a small runtime test in the scaffold. Use a real browser for layout, visibility and focus claims that DOM emulators cannot model reliably.

Transcribe only the verified, minimal wiring into the guide. Delete the temporary scaffold after recording the results if it lives inside the repository.

## Porting to Other Frameworks

Use the same skeleton and schema, then replace package and API names according to the framework terminology table in `repo-website-guide-create`. Confirm that the UI library supports the framework before creating the guide. Register it under the same `## Integration guides` heading for that framework.

## Cross-Linking

Integration guides are cross-linked as Markdown lists with one `<Link>` per guide, introduced by this exact sentence:

> For ready-made wiring recipes, check out our integration guides:

Maintain the list in two places per framework:

- the end of the input-components guide's `Using component libraries` section
- the end of the controlled-fields guide's `Custom inputs and component libraries` section

Append the new guide to `menu.md` and both lists. Create the lists if necessary. Keep these lists and the menu as the only inbound guide indexes so they stay easy to maintain.

## Checklist

Before submitting:

- [ ] Route and menu entry follow the required location and heading
- [ ] Section order matches this skill
- [ ] Targeted library version and backend are explicit and verified without imposing an unrelated visual style
- [ ] Canonical login schema is verbatim and controlled values are initialized
- [ ] Native and controlled patterns preserve the full Formisch field contract
- [ ] Labels, groups, errors and IDs are accessible and safe when snippets are combined
- [ ] Value conversions and widget structure match the actual component API
- [ ] Every example typechecks and the production build passes in a real scaffold
- [ ] Browser checks cover input, errors, touch/blur, focus and submission
- [ ] Non-obvious runtime behavior has focused coverage
- [ ] Menu and both inbound cross-link lists are updated
