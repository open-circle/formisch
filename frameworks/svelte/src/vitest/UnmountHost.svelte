<script
  lang="ts"
  generics="TSchema extends Schema, TFieldPath extends RequiredPath"
>
  import type {
    FormConfig,
    RequiredPath,
    Schema,
    ValidPath,
  } from '@formisch/core/svelte';
  import type * as v from 'valibot';
  import { createForm } from '../runes/createForm/createForm.svelte.ts';
  import { useField } from '../runes/useField/useField.svelte.ts';

  let {
    config,
    path,
  }: {
    config: FormConfig<TSchema>;
    path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
  } = $props();

  const form = createForm(config);
  const field = useField(
    () => form,
    () => ({ path })
  );
</script>

<input data-testid="input" {...field.props} />
