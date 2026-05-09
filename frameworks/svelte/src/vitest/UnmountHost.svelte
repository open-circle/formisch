<script lang="ts">
  import type { FormConfig, RequiredPath, Schema } from '@formisch/core/svelte';
  import { createForm } from '../runes/createForm/createForm.svelte.ts';
  import { useField } from '../runes/useField/useField.svelte.ts';

  // Test fixture: generic parameters are deliberately untyped because Svelte
  // component generics don't survive @testing-library/svelte's `render()`
  // signature. We accept a permissive `RequiredPath` and cast internally.

  let {
    config,
    path,
  }: {
    config: FormConfig<Schema>;
    path: RequiredPath;
  } = $props();

  const form = createForm(config);
  const field = useField(
    () => form,
    () => ({ path: path as never })
  );
</script>

<input data-testid="input" {...field.props} />
