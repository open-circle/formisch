<script
  lang="ts"
  generics="TSchema extends Schema, TFieldArrayPath extends RequiredPath"
>
  import type {
    FormConfig,
    RequiredPath,
    Schema,
    ValidArrayPath,
  } from '@formisch/core/svelte';
  import { insert } from '@formisch/methods/svelte';
  import type * as v from 'valibot';
  import { createForm } from '../runes/createForm/createForm.svelte.ts';
  import { useFieldArray } from '../runes/useFieldArray/useFieldArray.svelte.ts';

  let {
    config,
    path,
  }: {
    config: FormConfig<TSchema>;
    path: ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>;
  } = $props();

  const form = createForm(config);
  const fieldArray = useFieldArray(
    () => form,
    () => ({ path })
  );

  function add() {
    insert(form, { path, initialInput: 'c' });
  }
</script>

<div>
  <span data-testid="count">{fieldArray.items.length}</span>
  <button type="button" onclick={add}>Add</button>
</div>
