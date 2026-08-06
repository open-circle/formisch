<script lang="ts">
  import { useField } from '../runes/useField/useField.svelte.ts';
  // Test fixture: generic parameters are deliberately untyped because Svelte
  // component generics don't survive @testing-library/svelte's `render()`
  // signature. We accept permissive types and cast internally.

  /* eslint-disable @typescript-eslint/no-explicit-any */
  let { form, index }: { form: any; index: number } = $props();

  const field = useField(form, () => ({
    path: ['todos', index, 'label'] as any,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
</script>

<input {...field.props} />
