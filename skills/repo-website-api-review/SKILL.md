---
name: repo-website-api-review
description: Review and verify API documentation routes on the Formisch website. Use when checking documentation accuracy, completeness, and consistency with source code.
metadata:
  author: formisch
  version: '1.0'
---

# Reviewing API Documentation

This skill provides a systematic approach to reviewing API documentation routes for accuracy and consistency.

## Review Process

### Step 1: Compare with Source Code

For each documented API:

1. **Read the source file** completely
2. **Compare function signatures** - Must match exactly
3. **Verify types** - Generics, parameters, return types
4. **Check JSDoc** - Descriptions should match

### Step 2: Check properties.ts

Verify each property:

- [ ] Generic constraints match source code
- [ ] Parameter types are accurate
- [ ] Return type is correct
- [ ] All `href` links are valid
- [ ] No unused properties defined

### Step 3: Check index.mdx

Verify content:

- [ ] Front matter is complete (title, description, source, contributors)
- [ ] Function signature matches source exactly
- [ ] All generics documented
- [ ] All parameters documented with correct headings (Parameters vs Properties)
- [ ] Explanation references specific parameters/properties
- [ ] Examples are realistic and follow conventions
- [ ] Related section uses correct framework terminology

### Step 4: Check Menu and Links

- [ ] API listed in menu.md (alphabetical order)
- [ ] All internal links work
- [ ] Cross-package links use absolute paths
- [ ] No broken links to types or functions

## Common Issues to Find

### Signature Mismatches

```typescript
// Source code
export function validate(form: FormStore, config?: Config): void;

// ❌ Documentation shows different signature
const result = validate(form); // Missing config, wrong return
```

### Missing Parameters

Documentation should include ALL parameters from source:

```mdx
## Parameters

- `form` <Property {...properties.form} />
- `config` <Property {...properties.config} /> <!-- Don't forget optional params -->
```

### Wrong Headings

| API Type   | Heading         |
| ---------- | --------------- |
| Functions  | `## Parameters` |
| Components | `## Properties` |

### Outdated Examples

Examples must work with current API:

```typescript
// ❌ Old API usage
const form = createForm(schema);

// ✅ Current API
const form = createForm({ schema });
```

### Framework Terminology

| Framework | Related Section Heading |
| --------- | ----------------------- |
| Solid     | `### Primitives`        |
| Qwik      | `### Hooks`             |
| Preact    | `### Hooks`             |
| Vue       | `### Composables`       |
| Svelte    | `### Runes`             |

### Type Links

```typescript
// ❌ Wrong - using constraint type name
generics: [{ type: 'custom', name: 'RequiredPath' }];

// ✅ Correct - using parameter name
generics: [{ type: 'custom', name: 'TFieldPath' }];
```

### Cross-Package Links

```typescript
// ❌ Wrong - relative across packages
href: '../../../core/api/Schema/';

// ✅ Correct - absolute path
href: '/core/api/Schema/';
```

## Verification Checklist

### properties.ts

- [ ] All generics have `modifier: 'extends'`
- [ ] Custom types have valid `href` links
- [ ] Property order: `name`, `href`, `generics`
- [ ] No unused properties
- [ ] Types match source exactly

### index.mdx

- [ ] Title matches API name exactly (case-sensitive)
- [ ] Description ends with period
- [ ] Source path is correct
- [ ] Function signature code block matches source
- [ ] Correct heading (Parameters/Properties)
- [ ] Explanation references specific params/props
- [ ] Returns section present (unless void or component)
- [ ] Examples section present (unless component/type)
- [ ] Related section uses correct framework terminology
- [ ] No Types in Related section

### Menu Integration

- [ ] API listed in appropriate menu.md
- [ ] Alphabetical order maintained
- [ ] Link path matches folder structure

### Link Validation

- [ ] All `href` in properties.ts resolve
- [ ] ApiList links are valid
- [ ] Cross-framework links use absolute paths
- [ ] External links (Valibot) use full URLs

## Review Output Format

Document issues found:

```markdown
## Review: createForm

### Issues Found

1. **Signature mismatch** (L15)
   - Source shows `config: FormConfig<TSchema>`
   - Docs show `config: Config`

2. **Missing parameter** (Parameters section)
   - `initialInput` not documented

3. **Broken link** (properties.ts L23)
   - `href: '../FormConfig/'` - FormConfig not documented

### Recommendations

- Update properties.ts with correct FormConfig type
- Add initialInput to Parameters section
- Create FormConfig type documentation
```
