<script lang="ts">
  import type { FormConfig, FormSchema } from '@formisch/core/svelte';
  import { createForm } from '../runes/createForm/createForm.svelte.ts';
  import { useFieldArray } from '../runes/useFieldArray/useFieldArray.svelte.ts';
  import ReorderRowHost from './ReorderRowHost.svelte';
  // Test fixture: generic parameters are deliberately untyped because Svelte
  // component generics don't survive @testing-library/svelte's `render()`
  // signature. We accept permissive types and cast internally.

  /* eslint-disable @typescript-eslint/no-explicit-any */
  let {
    config,
    onMounted,
  }: {
    config: FormConfig<FormSchema>;
    onMounted: (form: any) => void;
  } = $props();

  const form = createForm(config as any);
  const fieldArray = useFieldArray(form, { path: ['todos'] as any });
  onMounted(form);
  /* eslint-enable @typescript-eslint/no-explicit-any */
</script>

{#each fieldArray.items as id, index (id)}
  <ReorderRowHost {form} {index} />
{/each}
