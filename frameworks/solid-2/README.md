# Formisch for SolidJS 2

This private workspace package contains the SolidJS 2 version of Formisch. It is not published on its own. Its build output is copied into `@formisch/solid` and published as the `@formisch/solid/v2` entry point.

```tsx
import { createForm, Field, Form } from '@formisch/solid/v2';
```

The Solid 1 version lives in `frameworks/solid`. Changes to the Solid adapter usually need to be applied to both packages.
