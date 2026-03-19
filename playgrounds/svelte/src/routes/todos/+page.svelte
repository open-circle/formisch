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
    InputErrors,
    InputLabel,
    TextInput,
  } from '$lib/components';

  const TodoFormSchema = v.object({
    heading: v.pipe(
      v.string('Please enter a heading.'),
      v.nonEmpty('Please enter a heading.')
    ),
    todos: v.pipe(
      v.array(
        v.object({
          label: v.pipe(
            v.string('Please enter a label.'),
            v.nonEmpty('Please enter a label.')
          ),
          deadline: v.pipe(
            v.string('Please enter a deadline.'),
            v.nonEmpty('Please enter a deadline.')
          ),
        })
      ),
      v.nonEmpty('Please add at least one todo.'),
      v.maxLength(4, 'You can only add up to 4 todos.')
    ),
  });

  const todoForm = createForm({
    schema: TodoFormSchema,
    initialInput: {
      heading: '',
      todos: [{ label: '', deadline: '' }],
    },
  });
</script>

<svelte:head>
  <title>Todos form</title>
</svelte:head>

<Form of={todoForm} onsubmit={(output) => console.log(output)}>
  <div class="space-y-12 md:space-y-14 lg:space-y-16">
    <FormHeader of={todoForm} heading="Todo form" />

    <div class="space-y-8 md:space-y-10 lg:space-y-12">
      <Field of={todoForm} path={['heading']}>
        {#snippet children(field)}
          <TextInput
            {...field.props}
            input={field.input}
            errors={field.errors}
            type="text"
            label="Heading"
            placeholder="Shopping list"
            required
          />
        {/snippet}
      </Field>

      <FieldArray of={todoForm} path={['todos']}>
        {#snippet children(fieldArray)}
          <div class="space-y-5 px-8 lg:px-10">
            <InputLabel label="Todos" margin="none" required />

            <div>
              <div use:autoAnimate class="space-y-5">
                {#each fieldArray.items as item, index (item)}
                  <div
                    class="flex flex-wrap gap-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 p-5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700"
                  >
                    <Field of={todoForm} path={['todos', index, 'label']}>
                      {#snippet children(field)}
                        <TextInput
                          {...field.props}
                          input={field.input}
                          class="w-full p-0! md:w-auto md:flex-1"
                          errors={field.errors}
                          type="text"
                          placeholder="Enter task"
                          required
                        />
                      {/snippet}
                    </Field>

                    <Field of={todoForm} path={['todos', index, 'deadline']}>
                      {#snippet children(field)}
                        <TextInput
                          {...field.props}
                          input={field.input}
                          class="flex-1 p-0!"
                          type="date"
                          errors={field.errors}
                          required
                        />
                      {/snippet}
                    </Field>

                    <ColorButton
                      color="red"
                      label="Delete"
                      width="auto"
                      onclick={() =>
                        remove(todoForm, { path: ['todos'], at: index })}
                    />
                  </div>
                {/each}
              </div>
              <InputErrors name="todos" errors={fieldArray.errors} />
            </div>

            <div class="flex flex-wrap gap-5">
              <ColorButton
                color="green"
                label="Add new"
                onclick={() =>
                  insert(todoForm, {
                    path: ['todos'],
                    initialInput: { label: '', deadline: '' },
                  })}
              />
              <ColorButton
                color="yellow"
                label="Move first to end"
                onclick={() =>
                  move(todoForm, {
                    path: ['todos'],
                    from: 0,
                    to: fieldArray.items.length - 1,
                  })}
              />
              <ColorButton
                color="purple"
                label="Swap first two"
                onclick={() =>
                  swap(todoForm, { path: ['todos'], at: 0, and: 1 })}
              />
              <ColorButton
                color="blue"
                label="Replace first"
                onclick={() =>
                  replace(todoForm, {
                    path: ['todos'],
                    at: 0,
                    initialInput: {
                      label: Math.random().toString(36).slice(2),
                      deadline: new Date().toISOString().split('T')[0],
                    },
                  })}
              />
            </div>
          </div>
        {/snippet}
      </FieldArray>
    </div>

    <FormFooter of={todoForm} />
  </div>
</Form>
