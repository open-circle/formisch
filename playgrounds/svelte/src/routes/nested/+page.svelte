<script lang="ts">
  import {
    Field,
    FieldArray,
    Form,
    createForm,
    insert,
    move,
    remove,
    replace,
    swap,
  } from '@formisch/svelte';
  import autoAnimate from '@formkit/auto-animate';
  import * as v from 'valibot';
  import {
    ColorButton,
    FormFooter,
    FormHeader,
    TextInput,
  } from '$lib/components';

  const NestedFormSchema = v.object({
    items: v.array(
      v.object({
        label: v.optional(v.string()),
        options: v.array(v.optional(v.string())),
      })
    ),
  });

  const nestedForm = createForm({
    schema: NestedFormSchema,
    initialInput: {
      items: [
        {
          label: 'Item 1',
          options: ['Option 1', 'Option 2'],
        },
        {
          label: 'Item 2',
          options: ['Option 1', 'Option 2'],
        },
      ],
    },
  });
</script>

<svelte:head>
  <title>Nested form</title>
</svelte:head>

<Form of={nestedForm} onsubmit={(output) => console.log(output)}>
  <div class="space-y-12 md:space-y-14 lg:space-y-16">
    <FormHeader of={nestedForm} heading="Nested form" />

    <FieldArray of={nestedForm} path={['items']}>
      {#snippet children(fieldArray)}
        <div class="space-y-7 px-8 lg:px-10">
          <div use:autoAnimate class="space-y-5">
            {#each fieldArray.items as item, itemIndex (item)}
              <div
                class="flex-1 space-y-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 py-6 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700"
              >
                <div class="flex space-x-5 px-6">
                  <Field of={nestedForm} path={['items', itemIndex, 'label']}>
                    {#snippet children(field)}
                      <TextInput
                        {...field.props}
                        input={field.input}
                        errors={field.errors}
                        type="text"
                        class="flex-1 p-0!"
                        placeholder="Enter item"
                      />
                    {/snippet}
                  </Field>

                  <ColorButton
                    color="red"
                    label="Delete"
                    width="auto"
                    onclick={() =>
                      remove(nestedForm, { path: ['items'], at: itemIndex })}
                  />
                </div>

                <div
                  class="border-t-2 border-t-slate-200 dark:border-t-slate-800"
                  role="separator"
                ></div>

                <FieldArray
                  of={nestedForm}
                  path={['items', itemIndex, 'options']}
                >
                  {#snippet children(optionsFieldArray)}
                    <div use:autoAnimate class="space-y-5 px-6">
                      {#each optionsFieldArray.items as item, optionIndex (item)}
                        <div class="flex space-x-5">
                          <Field
                            of={nestedForm}
                            path={['items', itemIndex, 'options', optionIndex]}
                          >
                            {#snippet children(field)}
                              <TextInput
                                {...field.props}
                                input={field.input}
                                errors={field.errors}
                                class="flex-1 p-0!"
                                type="text"
                                placeholder="Enter option"
                              />
                            {/snippet}
                          </Field>

                          <ColorButton
                            color="red"
                            label="Delete"
                            width="auto"
                            onclick={() =>
                              remove(nestedForm, {
                                path: ['items', itemIndex, 'options'],
                                at: optionIndex,
                              })}
                          />
                        </div>
                      {/each}

                      <div class="flex flex-wrap gap-4">
                        <ColorButton
                          color="green"
                          label="Add option"
                          onclick={() =>
                            insert(nestedForm, {
                              path: ['items', itemIndex, 'options'],
                              initialInput: '',
                            })}
                        />
                        <ColorButton
                          color="yellow"
                          label="Move first to end"
                          onclick={() =>
                            move(nestedForm, {
                              path: ['items', itemIndex, 'options'],
                              from: 0,
                              to: optionsFieldArray.items.length - 1,
                            })}
                        />
                        <ColorButton
                          color="purple"
                          label="Swap first two"
                          onclick={() =>
                            swap(nestedForm, {
                              path: ['items', itemIndex, 'options'],
                              at: 0,
                              and: 1,
                            })}
                        />
                      </div>
                    </div>
                  {/snippet}
                </FieldArray>
              </div>
            {/each}
          </div>

          <div class="flex flex-wrap gap-4">
            <ColorButton
              color="green"
              label="Add item"
              onclick={() =>
                insert(nestedForm, {
                  path: ['items'],
                  initialInput: { label: '', options: [''] },
                })}
            />
            <ColorButton
              color="yellow"
              label="Move first to end"
              onclick={() =>
                move(nestedForm, {
                  path: ['items'],
                  from: 0,
                  to: fieldArray.items.length - 1,
                })}
            />
            <ColorButton
              color="purple"
              label="Swap first two"
              onclick={() =>
                swap(nestedForm, { path: ['items'], at: 0, and: 1 })}
            />
            <ColorButton
              color="blue"
              label="Replace first"
              onclick={() =>
                replace(nestedForm, {
                  path: ['items'],
                  at: 0,
                  initialInput: {
                    label: '',
                    options: [''],
                  },
                })}
            />
          </div>
        </div>
      {/snippet}
    </FieldArray>

    <FormFooter of={nestedForm} />
  </div>
</Form>
