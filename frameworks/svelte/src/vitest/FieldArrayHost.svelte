<script lang="ts">
  import type { FormConfig, RequiredPath, Schema } from '@formisch/core/svelte';
  import { insert } from '@formisch/methods/svelte';
  import { createForm } from '../runes/createForm/createForm.svelte.ts';
  import { useFieldArray } from '../runes/useFieldArray/useFieldArray.svelte.ts';

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
  const fieldArray = useFieldArray(
    () => form,
    () => ({ path: path as never })
  );

  function add() {
    insert(form, { path: path as never, initialInput: 'c' as never });
  }
</script>

<div>
  <span data-testid="count">{fieldArray.items.length}</span>
  <button type="button" onclick={add}>Add</button>
</div>
