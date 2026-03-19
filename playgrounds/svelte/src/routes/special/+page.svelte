<script lang="ts">
  import { Field, Form, createForm } from '@formisch/svelte';
  import * as v from 'valibot';
  import {
    Checkbox,
    FileInput,
    FormFooter,
    FormHeader,
    RadioGroup,
    Select,
    Slider,
    TextInput,
  } from '$lib/components';

  const SpecialFormSchema = v.object({
    number: v.optional(v.string()),
    range: v.optional(v.string(), '50'),
    checkbox: v.object({
      array: v.array(v.string()),
      boolean: v.optional(v.boolean(), false),
    }),
    radio: v.optional(v.string()),
    select: v.object({
      array: v.array(v.string()),
      string: v.optional(v.string()),
    }),
    file: v.object({
      list: v.array(v.file()),
      item: v.optional(v.file()),
    }),
  });

  const specialForm = createForm({
    schema: SpecialFormSchema,
  });
</script>

<svelte:head>
  <title>Special form</title>
</svelte:head>

<Form of={specialForm} onsubmit={(output) => console.log(output)}>
  <div class="space-y-12 md:space-y-14 lg:space-y-16">
    <FormHeader of={specialForm} heading="Special form" />
    <div class="space-y-8 md:space-y-10 lg:space-y-12">
      <Field of={specialForm} path={['number']}>
        {#snippet children(field)}
          <TextInput
            {...field.props}
            input={field.input}
            errors={field.errors}
            type="number"
            label="Number"
          />
        {/snippet}
      </Field>

      <Field of={specialForm} path={['range']}>
        {#snippet children(field)}
          <Slider
            {...field.props}
            input={field.input}
            errors={field.errors}
            label="Range"
          />
        {/snippet}
      </Field>

      <div
        class="block px-8 font-medium md:text-lg lg:mb-5 lg:px-10 lg:text-xl"
      >
        Checkbox array
      </div>

      <div
        class="mx-8 flex flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800"
      >
        {#each [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }, { label: 'Option 3', value: 'option_3' }] as { label, value } (value)}
          <Field of={specialForm} path={['checkbox', 'array']}>
            {#snippet children(field)}
              <Checkbox
                class="p-0!"
                {...field.props}
                {label}
                {value}
                input={field.input.includes(value)}
                errors={field.errors}
              />
            {/snippet}
          </Field>
        {/each}
      </div>

      <Field of={specialForm} path={['checkbox', 'boolean']}>
        {#snippet children(field)}
          <Checkbox
            {...field.props}
            input={field.input}
            errors={field.errors}
            label="Checkbox boolean"
          />
        {/snippet}
      </Field>

      <Field of={specialForm} path={['radio']}>
        {#snippet children(field)}
          <RadioGroup
            {...field.props}
            label="Radio group"
            options={[
              { label: 'Option 1', value: 'option_1' },
              { label: 'Option 2', value: 'option_2' },
              { label: 'Option 3', value: 'option_3' },
            ]}
            input={field.input}
            errors={field.errors}
          />
        {/snippet}
      </Field>

      <Field of={specialForm} path={['select', 'array']}>
        {#snippet children(field)}
          <Select
            {...field.props}
            input={field.input}
            options={[
              { label: 'Option 1', value: 'option_1' },
              { label: 'Option 2', value: 'option_2' },
              { label: 'Option 3', value: 'option_3' },
            ]}
            errors={field.errors}
            label="Select array"
            multiple
          />
        {/snippet}
      </Field>

      <Field of={specialForm} path={['select', 'string']}>
        {#snippet children(field)}
          <Select
            {...field.props}
            input={field.input}
            options={[
              { label: 'Option 1', value: 'option_1' },
              { label: 'Option 2', value: 'option_2' },
              { label: 'Option 3', value: 'option_3' },
            ]}
            errors={field.errors}
            label="Select string"
          />
        {/snippet}
      </Field>

      <Field of={specialForm} path={['file', 'list']}>
        {#snippet children(field)}
          <FileInput
            {...field.props}
            input={field.input}
            errors={field.errors}
            label="File list"
            multiple
          />
        {/snippet}
      </Field>

      <Field of={specialForm} path={['file', 'item']}>
        {#snippet children(field)}
          <FileInput
            {...field.props}
            input={field.input}
            errors={field.errors}
            label="File item"
          />
        {/snippet}
      </Field>
    </div>
    <FormFooter of={specialForm} />
  </div>
</Form>
