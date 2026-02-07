# Property Component Reference

The `Property` component (`/website/src/components/Property.tsx`) renders TypeScript type definitions with syntax highlighting.

## PropertyProps

```typescript
type PropertyProps = {
  modifier?: string; // e.g., 'extends', 'readonly', 'typeof'
  type: DefinitionData; // The type definition
  default?: DefinitionData; // Optional default value
};
```

## DefinitionData Types

`DefinitionData` is a union type that mirrors TypeScript's type system:

### Primitive Types

```typescript
'string' | 'symbol' | 'number' | 'bigint' | 'boolean' |
'null' | 'undefined' | 'void' | 'never' | 'any' | 'unknown' |
'object' | 'array' | 'tuple' | 'function'
```

### Literal Values

```typescript
{ type: 'string'; value: string; }
{ type: 'number'; value: number; }
{ type: 'boolean'; value: boolean; }
```

### Object Type

```typescript
{
  type: 'object';
  entries: {
    key: string | { name: string; modifier?: string; type?: DefinitionData };
    optional?: boolean;
    value: DefinitionData;
  }[];
}
```

### Array Type

```typescript
{
  type: 'array';
  modifier?: string;
  spread?: boolean;
  item: DefinitionData;
}
```

### Tuple Type

```typescript
{
  type: 'tuple';
  modifier?: string;
  items: DefinitionData[];
}
```

### Function Type

```typescript
{
  type: 'function';
  params: {
    spread?: boolean;
    name: string;
    optional?: boolean;
    type: DefinitionData;
  }[];
  return: DefinitionData;
}
```

### Union Type

```typescript
{
  type: 'union';
  options: [DefinitionData, DefinitionData, ...DefinitionData[]];
}
```

### Intersect Type

```typescript
{
  type: 'intersect';
  options: [DefinitionData, DefinitionData, ...DefinitionData[]];
}
```

### Custom Type (Named Types)

```typescript
{
  type: 'custom';
  modifier?: string;       // e.g., 'readonly', 'typeof'
  spread?: boolean;
  name: string;           // Type name
  href?: string;          // Link to type documentation
  generics?: DefinitionData[];   // Generic type parameters
  indexes?: DefinitionData[];    // Index signatures [key: type]
}
```

## Common Patterns

### Generic Constraint

```typescript
TSchema: {
  modifier: 'extends',
  type: {
    type: 'custom',
    name: 'Schema',
    href: '/core/api/Schema/',
  },
},
```

### Optional Parameter (Union with undefined)

```typescript
config: {
  type: {
    type: 'union',
    options: [
      {
        type: 'custom',
        name: 'ValidateConfig',
        href: '../ValidateConfig/',
      },
      'undefined',
    ],
  },
},
```

### Generic Return Type

```typescript
Store: {
  type: {
    type: 'custom',
    name: 'FormStore',
    href: '../FormStore/',
    generics: [
      { type: 'custom', name: 'TSchema' },
    ],
  },
},
```

### Function Type

```typescript
onSubmit: {
  type: {
    type: 'function',
    params: [
      {
        name: 'output',
        type: {
          type: 'custom',
          name: 'InferOutput',
          href: 'https://valibot.dev/api/InferOutput/',
          generics: [{ type: 'custom', name: 'TSchema' }],
        },
      },
    ],
    return: {
      type: 'union',
      options: ['void', { type: 'custom', name: 'Promise', generics: ['void'] }],
    },
  },
},
```

### Object Type

```typescript
config: {
  type: {
    type: 'object',
    entries: [
      {
        key: 'shouldFocus',
        optional: true,
        value: 'boolean',
      },
      {
        key: 'shouldValidate',
        optional: true,
        value: 'boolean',
      },
    ],
  },
},
```

## Link Rules

### Internal Links (Formisch Types)

```typescript
// Relative path within same section
href: '../FormStore/'

// Absolute path for cross-package
href: '/core/api/Schema/'
href: '/methods/api/validate/'
```

### External Links (Valibot Types)

```typescript
href: 'https://valibot.dev/api/InferInput/'
```

### No Links (Third-Party Framework Types)

```typescript
// Don't add href for framework types
name: 'ReadonlySignal'  // From @preact/signals - no href
name: 'QRL'             // From @qwik.dev/core - no href
name: 'JSXOutput'       // From @qwik.dev/core - no href
```

## Property Ordering

When defining custom types with `href` and `generics`, use this order:

```typescript
{
  type: 'custom',
  name: 'TypeName',     // 1. Name first
  href: '/path/',       // 2. Link second
  generics: [...]       // 3. Generics last
}
```

## Type Reference Rules

Use the generic parameter names defined in the current file:

```typescript
// ✅ Correct: Use TFieldPath (the parameter name)
generics: [{ type: 'custom', name: 'TFieldPath' }]

// ❌ Wrong: Use RequiredPath (the base type)
generics: [{ type: 'custom', name: 'RequiredPath' }]
```
